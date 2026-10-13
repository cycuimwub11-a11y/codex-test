import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import OpenAI from "openai";
import { createApp } from "../app.mjs";

const analysis = {
  summary: "50 份回覆中，操作流程是主要改善方向。",
  key_points: ["30 人認為操作流程太複雜。"],
  recommendations: [{ action: "簡化操作流程", reason: "30 人反映流程複雜。" }],
};
const completed = { status: "completed", output_parsed: analysis };

async function start(t, options) {
  const server = createApp(options).listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve) => {
    server.close(resolve);
    server.closeAllConnections();
  }));
  const base = `http://127.0.0.1:${server.address().port}`;
  return {
    get: (path) => fetch(base + path),
    post: (body) => fetch(base + "/api/analyze", {
      method: "POST", headers: { "Content-Type": "application/json" }, body,
    }),
  };
}

test("頁面可載入，未設定金鑰時明確回報，且不暴露設定檔", async (t) => {
  const app = await start(t);
  assert.deepEqual(await (await app.get("/api/health")).json(), { status: "ok", ai_configured: false });
  const page = await app.get("/");
  assert.equal(page.status, 200);
  assert.match(await page.text(), /整理重點，找到下一步/);
  assert.equal((await app.get("/app.js")).status, 200);
  assert.equal((await app.get("/style.css")).status, 200);
  assert.equal((await app.get("/.env")).status, 404);
  assert.equal((await app.post(JSON.stringify({ text: "問卷資料" }))).status, 503);
});

test("無效、空白、過長輸入及不合法 JSON 不會呼叫 AI", async (t) => {
  let calls = 0;
  const app = await start(t, { client: { responses: { parse: () => { calls++; } } } });
  for (const body of [{}, { text: 42 }, { text: "  " }, { text: "a".repeat(10001) }]) {
    assert.equal((await app.post(JSON.stringify(body))).status, 400);
  }
  assert.equal((await app.post("{invalid")).status, 400);
  assert.equal((await app.post(JSON.stringify({ text: "a".repeat(110000) }))).status, 413);
  assert.equal(calls, 0);
});

test("使用真實 OpenAI SDK 組合 Responses API 請求並解析結構化結果（模擬網路）", async (t) => {
  let calls = 0;
  const client = new OpenAI({
    apiKey: "test-only-not-a-real-key", maxRetries: 0,
    fetch: async (url, options) => {
      calls++;
      assert.equal(String(url), "https://api.openai.com/v1/responses");
      const payload = JSON.parse(options.body);
      assert.equal(payload.input, "問卷內容");
      assert.equal(payload.store, false);
      assert.equal(payload.model, "gpt-4.1-mini");
      assert.equal(payload.text.format.type, "json_schema");
      assert.equal(payload.text.format.strict, true);
      return new Response(JSON.stringify({
        id: "resp_test", object: "response", created_at: 1, status: "completed",
        model: payload.model,
        output: [{ id: "msg_test", type: "message", role: "assistant", status: "completed",
          content: [{ type: "output_text", text: JSON.stringify(analysis), annotations: [] }] }],
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    },
  });
  const app = await start(t, { client });
  const response = await app.post(JSON.stringify({ text: "  問卷內容  " }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), analysis);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(calls, 1);
});

test("不完整、拒絕分析或格式錯誤的 AI 結果不會被當作成功", async (t) => {
  for (const output of [
    { status: "incomplete", output_parsed: analysis },
    { status: "completed", output_parsed: null },
    { status: "completed", output_parsed: { summary: "缺少欄位" } },
  ]) {
    const app = await start(t, { client: { responses: { parse: async () => output } } });
    assert.equal((await app.post(JSON.stringify({ text: "資料" }))).status, 502);
  }
});

test("上游金鑰、額度及連線錯誤有明確訊息，且不洩漏上游內容", async (t) => {
  for (const [status, expected, message] of [[401, 502, /金鑰/], [429, 429, /額度/], [undefined, 502, /暫時/]]) {
    const app = await start(t, { client: { responses: { parse: async () => {
      throw Object.assign(new Error("sensitive-upstream-content"), { status });
    } } } });
    const response = await app.post(JSON.stringify({ text: "資料" }));
    assert.equal(response.status, expected);
    const body = await response.json();
    assert.match(body.error, message);
    assert.doesNotMatch(body.error, /sensitive-upstream-content/);
  }
});

test("同時分析超過三筆時限制請求，完成後可再次使用", async (t) => {
  const releases = [];
  let allStarted;
  const ready = new Promise((resolve) => { allStarted = resolve; });
  let instant = false;
  const app = await start(t, { client: { responses: { parse: async () => {
    if (instant) return completed;
    return new Promise((resolve) => {
      releases.push(() => resolve(completed));
      if (releases.length === 3) allStarted();
    });
  } } } });
  const running = Array.from({ length: 3 }, () => app.post(JSON.stringify({ text: "資料" })));
  try {
    await ready;
    assert.equal((await app.post(JSON.stringify({ text: "第四筆" }))).status, 429);
  } finally {
    releases.forEach((release) => release());
    await Promise.all(running);
  }
  instant = true;
  assert.equal((await app.post(JSON.stringify({ text: "新資料" }))).status, 200);
});
