"""Real-browser integration test. Requires Python Playwright and a Chromium binary.

Run after npm run build: python3 frontend/tests/smoke.py
No paid API calls are made. PDF parsing, validation and Markdown export are real.
"""
import json
import os
from pathlib import Path
import shutil
import socket
import subprocess
import tempfile
import time
from urllib.request import urlopen

from playwright.sync_api import sync_playwright, expect


ROOT = Path(__file__).resolve().parents[2]


def main():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]
    base = f"http://127.0.0.1:{port}"
    with tempfile.TemporaryDirectory(prefix="esg-browser-") as temp:
        temp = Path(temp)
        pdf = temp / "report.pdf"
        subprocess.run([str(ROOT / ".venv/bin/python"), "-c",
                        "import pymupdf,sys; d=pymupdf.open(); d.new_page().insert_text((40,40),'Energy: 100 kWh'); d.save(sys.argv[1])",
                        str(pdf)], check=True)
        with (temp / "server.log").open("w+") as log:
            server = subprocess.Popen([str(ROOT / ".venv/bin/python"), "-m", "uvicorn",
                                       "frontend.tests.serve_fixture:app", "--host", "127.0.0.1", "--port", str(port)],
                                      cwd=ROOT, stdout=log, stderr=log)
            try:
                for _ in range(100):
                    try:
                        with urlopen(base + "/health", timeout=1) as response:
                            assert response.status == 200
                        break
                    except OSError:
                        if server.poll() is not None:
                            raise RuntimeError("Fixture server failed to start")
                        time.sleep(0.1)
                else:
                    raise RuntimeError("Fixture server readiness timeout")
                with sync_playwright() as playwright:
                    executable = os.getenv("CHROMIUM_EXECUTABLE") or shutil.which("chromium")
                    browser = playwright.chromium.launch(executable_path=executable, headless=True, args=["--no-sandbox"])
                    page = browser.new_page(viewport={"width": 1365, "height": 1000}, reduced_motion="reduce")
                    errors = []
                    page.on("pageerror", lambda error: errors.append(str(error)))
                    page.goto(base + "/site/index.html?page=recommendations")
                    expect(page.get_by_role("heading", name="報告摘要", exact=True).first).to_be_visible()
                    expect(page.get_by_role("button", name="一鍵生成摘要", exact=True)).to_be_disabled()
                    # Invalid files never reach the backend.
                    page.locator('input[type="file"]').set_input_files({"name": "bad.pdf", "mimeType": "application/pdf", "buffer": b"not a PDF"})
                    expect(page.get_by_role("alert")).to_contain_text("不像 PDF")
                    page.locator('input[type="file"]').set_input_files(str(pdf))
                    expect(page.get_by_role("button", name="一鍵生成摘要", exact=True)).to_be_enabled()
                    # Show backend failure; do not substitute fake successful UI output.
                    page.route("**/analyze/pdf", lambda route: route.fulfill(status=503, content_type="application/json", body=json.dumps({"detail": "尚未設定後端金鑰。"})))
                    page.get_by_role("button", name="一鍵生成摘要", exact=True).click()
                    expect(page.get_by_role("alert")).to_contain_text("尚未設定後端金鑰")
                    page.unroute("**/analyze/pdf")
                    page.get_by_role("button", name="一鍵生成摘要", exact=True).click()
                    expect(page.get_by_role("article", name="完整報告摘要內容")).to_contain_text("100 kWh")
                    expect(page.get_by_role("article", name="完整報告摘要內容")).to_contain_text("本次輸入文件 p.1")
                    with page.expect_download() as event:
                        page.get_by_role("button", name="下載報告摘要（Markdown）", exact=True).click()
                    download = event.value
                    assert download.suggested_filename == "report_完整報告摘要.md"
                    download.save_as(temp / "summary.md")
                    assert "指標與政策" in (temp / "summary.md").read_text()
                    page.get_by_role("link", name="查看未來方針建議").click()
                    expect(page.get_by_role("article", name="未來方針建議內容")).to_contain_text("建立能源追蹤")
                    expect(page.get_by_role("article", name="未來方針建議內容")).to_contain_text("推進路線圖")
                    with page.expect_download() as event:
                        page.get_by_role("button", name="下載建議方針（Markdown）", exact=True).click()
                    download = event.value
                    assert download.suggested_filename == "report_未來永續方針建議.md"
                    download.save_as(temp / "recommendations.md")
                    assert "平台分析建議" in (temp / "recommendations.md").read_text()
                    assert (temp / "summary.md").read_bytes() != (temp / "recommendations.md").read_bytes()
                    with urlopen(base + "/__test/calls") as response:
                        assert json.load(response)["calls"] == 1, "Switching pages must not cause a second paid request"
                    page.set_viewport_size({"width": 390, "height": 844})
                    assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), "Mobile page overflow"
                    page.get_by_role("button", name="清除結果", exact=True).click()
                    expect(page.get_by_role("article")).to_have_count(0)
                    page.reload()
                    expect(page.get_by_role("article")).to_have_count(0)
                    assert not errors, errors
                    browser.close()
                    print("Browser integration passed: upload, PDF parsing, error/retry, both documents, downloads, shared result, clearing, mobile layout.")
            finally:
                server.terminate()
                try:
                    server.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    server.kill()
                    server.wait()


if __name__ == "__main__":
    main()
