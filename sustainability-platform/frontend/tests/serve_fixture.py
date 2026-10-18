"""Browser-test backend: only the paid OpenAI boundary is replaced.

Run exclusively from smoke.py. Never use this fixture as the application server.
"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
import app as backend


class OfflineClient:
    def __init__(self, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        pass


calls = 0


async def offline_ask(client, instruction, data):
    global calls
    calls += 1
    return backend.Analysis(
        context=backend.ReportContext(company="測試企業", report_period="2025"),
        summary="公司揭露年度用電，建議追蹤能源來源。",
        findings=[backend.Finding(identifier="energy", topic="年度用電量", fact="年度用電 100 kWh。",
                                  source_pages=[1], dimension="E", period="2025", status="實績",
                                  value="100", unit="kWh", evidence_quote="Energy: 100 kWh")],
        information_gaps=["未揭露再生能源占比"],
        management_directions=["提升資料可追蹤性"],
        recommendations=[backend.Recommendation(action="建立能源追蹤", rationale="依揭露的能源資料提出改善方向。",
                                                priority="中", metric="再生能源占比", source_pages=[1],
                                                pillar="營運與自然", evidence_ids=["energy"],
                                                actions=["建立年度能源台帳"], tracking_metrics=["再生能源占比"])],
        roadmap=[backend.RoadmapStage(stage=stage, proposed_work="建立指標台帳", expected_management_outcome="數據可回查")
                 for stage in ["0–12 個月", "12–24 個月", "24 個月以上"]],
    )


os.environ["SUSTAINABILITY_API_KEY"] = "offline-test-only"
backend.AsyncOpenAI = OfflineClient
backend.ask = offline_ask
app = backend.app


@app.get("/__test/calls")
def call_count():
    return {"calls": calls}
