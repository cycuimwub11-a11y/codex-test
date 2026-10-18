# 企業永續專題平台

本儲存庫保留團隊提供的前端網頁，以及已串接的報告摘要與未來永續方針建議 API。

完整專案在 **[sustainability-platform](sustainability-platform/)**。原先獨立的 Node.js 串接示範已移除。

## Windows 使用

1. 下載並解壓縮後，進入 `sustainability-platform`。
2. 安裝 Python 3.12 或更新版本，執行 `setup.bat`。
3. 編輯 `.env`，在 `SUSTAINABILITY_API_KEY=` 後填入 OpenAI API 金鑰。
4. 執行 `start.bat`，依命令視窗提示開啟網頁。

詳細步驟請見 [開始使用](sustainability-platform/開始使用.md)。

前端保留團隊原有的首頁、永續簡介、資料上傳、報告摘要及未來方針建議頁面。本次接入 API 的功能是摘要與建議方針，CSV／XLSX 圖表頁仍維持原本展示。

金鑰只留在自己的 `.env`，不要提交到 GitHub。真實 AI 生成需有可用的 OpenAI API 金鑰與額度。
