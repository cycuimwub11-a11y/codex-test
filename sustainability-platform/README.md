# 永續報告書分析 API

使用 FastAPI 和 OpenAI Responses API，支援文字或文字型 PDF，回傳繁體中文摘要、揭露事實、資訊缺口及改善建議。PDF 頁碼是檔案中的實際順序，從 1 開始。

## 對齊提供的報告範本

輸出遵循使用者提供的富邦金控摘要及未來方針文件的編排方向，但不預載或套用富邦數據：

- `findings`：指標與政策，包含期間、E/S/G/F 類別、實績／目標等性質、數值與單位、前期、目標、判讀、範圍、原文行動、限制及來源證據。
- `comparability_notes`：跨頁矛盾、調查年差異、方法變更、分母與邊界差異。
- `recommendations`：依策略支柱分組，列報告依據、建議行動與追蹤指標。數量依資料充足程度調整，不能強制湊成八項。
- `roadmap`：0–12 個月、12–24 個月、24 個月以上的建議工作與管理成果。
- `summary_markdown` 及 `recommendations_markdown`：可各自存成兩份 Markdown 文件，無需再次呼叫模型。
- `source_sha256`：本次輸入文件的雜湊，不是被引用但未提供的原報告雜湊。

若上傳的是已製作的摘要或建議文件，設定 `source_kind=secondary_summary`。這種輸入不能宣稱系統看過或核對完整原報告。文字輸入的來源頁碼固定為 1，僅指本次文字；PDF 頁碼指實際上傳文件。

```bash
curl --fail-with-body http://127.0.0.1:8000/analyze/pdf \
  -F 'file=@summary.pdf;type=application/pdf' \
  -F 'source_kind=secondary_summary'
```

系統會檢查指標識別碼、逐字證據是否出現在引用頁，以及建議引用的指標是否存在。這些檢查無法保證每項敘述與數字皆正確；仍需人工核閱。未擷取出文字的 PDF 頁面會列在 `extraction_warnings`，不能把這些頁面視為已分析。

## 安裝與啟動

需要 Python 3.12 或更新版本。在儲存庫目錄執行：

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.lock
```

在執行後端的環境中安全設定 `OPENAI_API_KEY`。不要將金鑰提交到 GitHub，也不要提供給前端。程式會從專案根目錄的 `.env` 載入設定，既有程序環境變數優先。如使用雲端秘密設定，確認金鑰已注入後端程序；建議使用 `SUSTAINABILITY_API_KEY`；也支援 `OPENAI_API_KEY`。

此 Codex 雲端環境保留了 `OPENAI_` 前綴，請在環境秘密設定中填入 `SUSTAINABILITY_API_KEY`，允許目的地為 `api.openai.com`。程式優先讀取此名稱，也支援一般本機使用的 `OPENAI_API_KEY`。

可選環境變數 `OPENAI_MODEL`，預設為 `gpt-4.1-mini`。模型須在你的 API 專案中可用；ChatGPT 訂閱不包含 API 使用費。

```bash
.venv/bin/uvicorn app:app --host 127.0.0.1 --port 8000
```

前端已匯入 `frontend/`。先在該目錄執行 `npm ci`、`npm run typecheck`、`npm run build`，再啟動後端；根路徑會導向網頁 `/site/`。摘要與未來方針頁面已串接 `/analyze/pdf`，支援兩份獨立 Markdown 下載。完整說明見 [前端 README](frontend/README.md)。也可使用 `/docs` 的 Swagger 介面測試 API。

## 呼叫流程

1. 呼叫 `GET /health`：`ai_configured` 只代表變數存在，不代表金鑰有效。
2. 先測試 `POST /analyze/text`，確認計費、模型與金鑰可用。
3. 再上傳 PDF 至 `POST /analyze/pdf`。
4. 人工比對 `findings`、`recommendations` 的 `source_pages` 與原報告。

```bash
curl --fail-with-body http://127.0.0.1:8000/health
curl --fail-with-body http://127.0.0.1:8000/analyze/text \
  -H 'Content-Type: application/json' \
  -d '{"text":"2025 年公司用電量為 100,000 kWh，尚未揭露再生能源占比。"}'
curl --fail-with-body http://127.0.0.1:8000/analyze/pdf \
  -F 'file=@report.pdf;type=application/pdf'
```

## 行為與限制

- PDF 上限 10 MB、300 頁、100,000 個擷取字元；掃描文件需先 OCR，加密文件不支援。
- 分段依序分析，多段時再整合。一次上傳可能產生多次計費 API 請求。
- 上傳文件不會寫入磁碟；擷取文字會傳至 OpenAI。`store=False` 關閉回應儲存，但不代表零資料保留；使用前須確認帳號資料政策及文件授權。
- 頁碼有效性有檢查，但內容與引用準確性仍需人工查核。輸出不是法規認證或經查核的永續揭露。
- 此版本是本機開發原型，尚未加入登入、速率限制與背景工作。正式公開部署前須加入這些機制，並評估敏感文件、並行量及成本。

## 測試

```bash
.venv/bin/python -m pytest -q
```

測試驗證 PDF 解析、頁碼、分段、錯誤處理與模型回傳的來源檢查；模擬模型回應不會呼叫付費 API。實際 API 成功與輸出品質須使用有效金鑰另行驗證。
