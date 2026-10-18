# 企業永續專題前端

已將上傳的 React／Vite 網頁接到專案 FastAPI 後端，保留原始版面與導覽。

## 兩個功能

- 「報告摘要」：上傳 PDF，顯示完整摘要，下載 `原檔名_完整報告摘要.md`。
- 「未來方針建議」：顯示策略支柱、行動、追蹤指標與路線圖，下載 `原檔名_未來永續方針建議.md`。

同一次 `POST /analyze/pdf` 會產生兩份文件。分析完成後可切換另一頁查看，無需再次呼叫 AI。只有按下生成才上傳 PDF；只選擇檔案不會呼叫 API。

## 建置與啟動

需要 Node.js >=22.12、Python >=3.12。使用現有 checkout，無需另建 Git worktree。

從 `frontend` 目錄：

```bash
npm ci
npm run typecheck
npm run build
```

從專案根目錄啟動後端：

```bash
.venv/bin/uvicorn app:app --host 127.0.0.1 --port 8000
```

前端由後端的 `/site/` 路徑提供，根路徑 `/` 會導向前端。原有 `/health`、`/docs`、`/analyze/text`、`/analyze/pdf` 保留。請使用 HTTP 服務開啟網頁；直接雙擊 HTML 不會自動啟動後端。

開發時在 `frontend` 執行 `npm run dev`，Vite 將 `/analyze` 與 `/health` 轉送到後端 8000 埠。

## API 網址

預設呼叫相同網域的 `/analyze/pdf`，因此前端與 API 部署在同一個服務時無需填網址。

如果前端與後端使用不同網域，複製 `.env.example` 為 `.env.local`，填寫 **API 基底網址**（例如 `https://your-api.example.com`，不要包含 `/analyze/pdf`），然後重新建置：

```dotenv
VITE_API_BASE_URL=https://your-api.example.com
```

後端另設 `CORS_ALLOW_ORIGINS` 為實際前端 origin，多個以逗號分隔，例如 `https://your-web.example.com`。同網域部署不需要 CORS 設定。

OpenAI 金鑰只放在後端的 `SUSTAINABILITY_API_KEY`，不可填進任何 `VITE_` 變數。未設定金鑰時，前端會顯示後端 HTTP 503 的提示，不會偽造成功結果。

## 文件與結果

支援文字型 PDF，上限 10 MB、300 頁、100,000 擷取字元。掃描文件需先 OCR。若上傳的是摘要或建議範本，文件種類選「已整理的摘要或建議文件」，避免誤稱已核對原始報告。

結果暫存在瀏覽器 `sessionStorage`，不儲存原始 PDF。暫存只供目前分頁切換兩種結果，按「清除結果」或移除／更換檔案會清除。瀏覽器若禁止儲存，當頁生成及下載仍可使用，但跨頁結果不會保留。

停止等待會取消瀏覽器等待，不保證後端取消模型工作或免除已發生的費用。重新生成會再次呼叫 API。

「資料上傳」頁的 CSV／XLSX 圖表解析保持原有展示狀態，本次串接範圍是報告摘要與未來方針建議。

## 驗證

```bash
npm run typecheck
npm run build
```

可選的真實瀏覽器整合測試：從專案根目錄執行 `python3 frontend/tests/smoke.py`。執行該 Python 的環境需有 Playwright 及 Chromium，可用 `CHROMIUM_EXECUTABLE` 指定現有瀏覽器。測試啟動獨立測試後端，僅替換付費模型邊界，驗證實際 PDF 解析、頁碼、顯示、錯誤重試、兩份文件下載、切頁不重複請求及行動版版面。它不代表真實 OpenAI 生成已通過。

正式公開前，請完成後端登入與速率限制。此專案目前沒有替使用者部署或建立公開網址。
