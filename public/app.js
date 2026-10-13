const form = document.querySelector("#analysis-form");
const input = document.querySelector("#text");
const button = form.querySelector("button");
const status = document.querySelector("#status");
const result = document.querySelector("#result");

input.addEventListener("input", () => {
  document.querySelector("#count").textContent = `${input.value.length} / 10000 字`;
});

fetch("/api/health")
  .then((response) => response.json())
  .then((health) => {
    if (!health.ai_configured) {
      document.querySelector("#setup").textContent = "尚未設定 API Key，請先在後端設定 AI_API_KEY 並重新啟動。";
    }
  })
  .catch(() => {
    document.querySelector("#setup").textContent = "目前無法連線至後端，請確認服務已啟動。";
  });

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!input.value.trim()) {
    status.textContent = "請輸入要分析的內容。";
    return;
  }
  button.disabled = true;
  button.textContent = "分析中…";
  form.setAttribute("aria-busy", "true");
  result.hidden = true;
  status.textContent = "正在整理摘要與建議，請稍候。";
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input.value }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "分析失敗，請稍後再試。");
    document.querySelector("#summary").textContent = data.summary;
    document.querySelector("#key-points").replaceChildren(...data.key_points.map((point) => {
      const item = document.createElement("li");
      item.textContent = point;
      return item;
    }));
    document.querySelector("#recommendations").replaceChildren(...data.recommendations.map((recommendation) => {
      const item = document.createElement("li");
      const action = document.createElement("strong");
      const reason = document.createElement("p");
      action.textContent = recommendation.action;
      reason.textContent = recommendation.reason;
      item.append(action, reason);
      return item;
    }));
    result.hidden = false;
    status.textContent = "分析完成。";
  } catch (error) {
    status.textContent = error instanceof TypeError ? "連線失敗，請確認後端服務與網路。" : error.message;
  } finally {
    button.disabled = false;
    button.textContent = "AI 分析";
    form.removeAttribute("aria-busy");
  }
});
