import OpenAI from "openai";
import { createApp } from "./app.mjs";

const apiKey = process.env.AI_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim();
const client = apiKey ? new OpenAI({ apiKey, timeout: 60000, maxRetries: 1 }) : undefined;
const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT 必須是 1～65535 的整數。");
}
const server = createApp({ client, model: process.env.AI_MODEL || "gpt-4.1-mini" })
  .listen(port, "127.0.0.1", () => {
    console.log(`分析服務已啟動，port ${port}。`);
    if (!client) console.log("尚未設定 AI_API_KEY，頁面可使用，但 AI 分析需要金鑰。");
  });
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close());
}
