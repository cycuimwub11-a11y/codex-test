export type AnalysisResult = {
  summary_markdown: string;
  recommendations_markdown: string;
  extraction_warnings: string[];
  source_sha256: string;
  source_kind: "original_report" | "secondary_summary";
};

// Public backend URL only. An OpenAI key must never appear in frontend variables.
const configuredBase = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";
export const apiBase = configuredBase.replace(/\/+$/, "");
export const storageKey = `sustainability:last-analysis:v1:${apiBase}`;

export function isAnalysisResult(value: unknown): value is AnalysisResult {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return typeof data.summary_markdown === "string" && !!data.summary_markdown.trim()
    && typeof data.recommendations_markdown === "string" && !!data.recommendations_markdown.trim()
    && typeof data.source_sha256 === "string" && /^[a-f0-9]{64}$/.test(data.source_sha256)
    && Array.isArray(data.extraction_warnings) && data.extraction_warnings.every((item) => typeof item === "string")
    && (data.source_kind === "original_report" || data.source_kind === "secondary_summary");
}

export async function analyzePdf(file: File, sourceKind: AnalysisResult["source_kind"], signal: AbortSignal): Promise<AnalysisResult> {
  if (window.location.protocol === "file:" && !apiBase) {
    throw new Error("請透過後端提供的網頁使用分析功能，或先設定 API 網址後重新建置。");
  }
  const form = new FormData();
  form.append("file", file);
  form.append("source_kind", sourceKind);
  let response: Response;
  try {
    response = await fetch(`${apiBase}/analyze/pdf`, { method: "POST", body: form, signal });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error("無法連線分析服務，請確認後端已啟動及 API 網址設定正確。");
  }
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data && typeof data === "object" && "detail" in data ? data.detail : undefined;
    throw new Error(typeof detail === "string" ? detail : `分析服務暫時無法處理請求（HTTP ${response.status}），請稍後重試。`);
  }
  if (!isAnalysisResult(data)) throw new Error("分析服務回傳的文件不完整，請重試。");
  return data;
}

export function downloadMarkdown(content: string, sourceName: string, label: string) {
  const name = sourceName.replace(/\.pdf$/i, "").replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_") || "永續報告";
  const url = URL.createObjectURL(new Blob([content], { type: "text/markdown;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}_${label}.md`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
