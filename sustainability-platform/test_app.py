import pymupdf
import asyncio
from fastapi.testclient import TestClient

import app

client = TestClient(app.app)


def test_missing_key(monkeypatch):
    monkeypatch.delenv("SUSTAINABILITY_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    assert client.post("/analyze/text", json={"text": "Annual emissions: 123 tCO2e"}).status_code == 503


def test_invalid_pdf():
    assert client.post("/analyze/pdf", files={"file": ("report.pdf", b"invalid")}).status_code == 422


def test_pdf_preserves_pages(monkeypatch):
    captured = []

    async def fake_analyze(pages):
        captured.extend(pages)
        return app.Analysis(summary="測試摘要", findings=[], information_gaps=[], recommendations=[])

    monkeypatch.setattr(app, "analyze", fake_analyze)
    with pymupdf.open() as pdf:
        pdf.new_page().insert_text((40, 40), "Emissions: 123 tCO2e")
        pdf.new_page().insert_text((40, 40), "Energy: 456 kWh")
        data = pdf.tobytes()
    response = client.post("/analyze/pdf", files={"file": ("report.pdf", data, "application/pdf")})
    assert response.status_code == 200
    assert captured == [(1, "Emissions: 123 tCO2e"), (2, "Energy: 456 kWh")]


def test_scan_requires_ocr():
    with pymupdf.open() as pdf:
        pdf.new_page()
        data = pdf.tobytes()
    response = client.post("/analyze/pdf", files={"file": ("scan.pdf", data)})
    assert response.status_code == 422
    assert "OCR" in response.json()["detail"]


def test_chunking_keeps_all_text():
    text = "a" * (app.CHUNK_SIZE * 2 + 1)
    chunks = app.split_pages([(7, text)])
    assert len(chunks) == 3
    assert "".join(piece["text"] for chunk in chunks for piece in chunk) == text
    assert all(piece["page"] == 7 for chunk in chunks for piece in chunk)


def test_invalid_citation(monkeypatch):
    class FakeClient:
        def __init__(self, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            pass

    async def fake_ask(*args):
        return app.Analysis(summary="摘要", findings=[app.Finding(topic="環境", fact="測試", source_pages=[99])], information_gaps=[], recommendations=[])

    monkeypatch.setenv("OPENAI_API_KEY", "test-only")
    monkeypatch.setattr(app, "AsyncOpenAI", FakeClient)
    monkeypatch.setattr(app, "ask", fake_ask)
    response = client.post("/analyze/text", json={"text": "測試報告"})
    assert response.status_code == 502


def test_structured_request(monkeypatch):
    from types import SimpleNamespace
    calls = []

    async def parse(**kwargs):
        calls.append(kwargs)
        return SimpleNamespace(output_parsed=app.Analysis(summary="摘要", findings=[], information_gaps=[], recommendations=[]))

    fake = SimpleNamespace(responses=SimpleNamespace(parse=parse))
    result = asyncio.run(app.ask(fake, app.INSTRUCTION, [{"page": 1, "text": "報告"}]))
    assert result.summary == "摘要"
    assert calls[0]["store"] is False
    assert calls[0]["text_format"] is app.Analysis


def sample_analysis():
    return app.Analysis(
        summary="用電資料已揭露，成果仍須追蹤。",
        findings=[app.Finding(topic="用電量", fact="2025 用電 100 kWh", source_pages=[1],
                             identifier="energy", dimension="E", period="2025", status="實績",
                             value="100", unit="kWh", evidence_quote="2025 用電 100 kWh")],
        information_gaps=["未揭露再生能源占比"],
        recommendations=[app.Recommendation(action="追蹤能源來源", rationale="依用電資料提出的建議",
                                           priority="中", metric="再生能源占比", source_pages=[1],
                                           pillar="營運與自然", evidence_ids=["energy"])],
    )


def test_export_secondary_source(monkeypatch):
    async def fake_analyze(pages):
        return sample_analysis()

    monkeypatch.setattr(app, "analyze", fake_analyze)
    response = client.post("/analyze/text", json={"text": "2025 用電 100 kWh", "source_kind": "secondary_summary"})
    assert response.status_code == 200
    data = response.json()
    assert "二手摘要；未取得原報告" in data["summary_markdown"]
    assert "本次輸入文件 p.1" in data["summary_markdown"]
    assert "100 kWh" in data["recommendations_markdown"]
    assert "平台分析建議" in data["recommendations_markdown"]
    assert len(data["source_sha256"]) == 64


def test_citation_requires_exact_quote(monkeypatch):
    class FakeClient:
        def __init__(self, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            pass

    async def fake_ask(*args):
        return sample_analysis()

    monkeypatch.setenv("SUSTAINABILITY_API_KEY", "test-only")
    monkeypatch.setattr(app, "AsyncOpenAI", FakeClient)
    monkeypatch.setattr(app, "ask", fake_ask)
    response = client.post("/analyze/text", json={"text": "報告沒有模型宣稱的數字"})
    assert response.status_code == 502
    assert "逐字來源證據" in response.json()["detail"]


def test_partial_pdf_warns_on_blank_pages(monkeypatch):
    async def fake_analyze(pages):
        return sample_analysis()

    monkeypatch.setattr(app, "analyze", fake_analyze)
    with pymupdf.open() as pdf:
        pdf.new_page().insert_text((40, 40), "Energy: 100 kWh")
        pdf.new_page()
        data = pdf.tobytes()
    response = client.post("/analyze/pdf", files={"file": ("report.pdf", data)})
    assert response.status_code == 200
    assert "2" in response.json()["extraction_warnings"][0]
