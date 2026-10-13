# 畢業專題：OpenAI 摘要與建議

Node.js 後端呼叫 OpenAI Responses API，網頁可輸入文字並顯示摘要、重點及行動建議。API Key 只由後端讀取，瀏覽器不會取得金鑰。

## 啟動

需要 Node.js 22 以上，建議使用 Node.js 24 LTS。

```bash
cd /workspace/codex-test
npm ci
```

本機已有空白 `.env`，填入自己的設定即可。從 GitHub 下載專案時，可先複製 `.env.example` 為 `.env`（保留既有 `.env`，不要覆蓋）。

```dotenv
AI_API_KEY=你的OpenAI_API_Key
AI_MODEL=gpt-4.1-mini
PORT=3000
```

API Key 可在 OpenAI API 平台建立：https://platform.openai.com/api-keys 。ChatGPT 訂閱與 API 使用費用分開計算。

Codex 雲端環境也可在環境設定中安全填入 `AI_API_KEY`，HTTPS 目的地為 `api.openai.com`。不要把金鑰貼到聊天、寫入前端、提交至 GitHub 或記錄到日誌。既有 `OPENAI_API_KEY` 綁定也可由後端使用。

```bash
npm start
```

服務預設只監聽本機的 3000 埠。一般本機開發可用瀏覽器輸入 `http://127.0.0.1:3000`；Codex 雲端 onboarding 不提供此本機位址的網頁預覽。沒有金鑰也能啟動網頁及檢查健康狀態，但分析請求會明確回報缺少金鑰。

修改環境變數後請重新啟動。開發時可用 `npm run dev` 自動重啟程式。

## 串接你們的系統

由前端送出同來源的 `POST /api/analyze`：

```js
const response = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: '你要分析的資料' }),
});
const data = await response.json();
if (!response.ok) throw new Error(data.error);
// 使用 data.summary、data.key_points、data.recommendations 更新畫面。
```

成功結果：

```json
{
  "summary": "整體摘要",
  "key_points": ["重點一", "重點二"],
  "recommendations": [{ "action": "建議採取的行動", "reason": "建議的資料依據" }]
}
```

前後端分開部署時，優先由你們的後端反向代理此路由；不要在瀏覽器直接呼叫 OpenAI。這是本機專題開發版本，正式對外部署前需要登入驗證、每位使用者的請求限制和費用控管，目前的三筆並行限制只保護單一程序。

分析內容上限 10000 字（依 JavaScript 字串長度計算）。送出前請移除不必要的個人資料。程式使用 `store: false`，但這不等同於 OpenAI 的零資料保留方案。AI 建議應由人確認。

## 驗證

```bash
npm test
curl http://127.0.0.1:3000/api/health
curl http://127.0.0.1:3000/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{"text":"本次問卷共50份，30人覺得操作流程複雜，15人希望增加提醒，5人沒有建議。"}'
```

健康檢查的 `ai_configured` 只表示後端有讀取到金鑰，不代表金鑰有效或有足夠額度。實際分析成功才證明當次 API 串接有效。

自動測試使用模擬的 OpenAI 回應，不消耗 API 額度；包含 SDK 請求格式與結構化解析、輸入驗證、缺少金鑰、未完成結果、上游錯誤及並行限制。真實分析需有效金鑰、API 額度及網路權限。若模型不存在或無權限，將 `AI_MODEL` 改成你的 OpenAI 專案支援結構化輸出的模型。

## 檔案

- `server.mjs`：載入設定並啟動服務。
- `app.mjs`：分析接口、結構化輸出及錯誤處理。
- `public/`：輸入與結果頁面。
- `.env.example`：不含金鑰的設定範本。
- `test/app.test.mjs`：不需金鑰的接口測試。

`.env` 與 `node_modules/` 不會提交至 GitHub；下載專案後請自行設定金鑰並安裝相依套件。
