import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { downloadMarkdown, type AnalysisResult } from "../lib/report-api";
import { siteHref } from "../lib/site-path";

export function ReportResults({ result, purpose, fileName, restored, onClear }: {
  result: AnalysisResult;
  purpose: "summary" | "future-strategy";
  fileName: string;
  restored: boolean;
  onClear: () => void;
}) {
  const isSummary = purpose === "summary";
  return <div className="report-results-content">
    <p className="report-source-label">來源文件：{fileName}</p>
    {restored && <p role="status">已載入本分頁上次完成的分析，沒有再次呼叫 AI。</p>}
    <div className="report-downloads">
      <button type="button" onClick={() => downloadMarkdown(result.summary_markdown, fileName, "完整報告摘要")}>下載報告摘要（Markdown）</button>
      <button type="button" onClick={() => downloadMarkdown(result.recommendations_markdown, fileName, "未來永續方針建議")}>下載建議方針（Markdown）</button>
      <a href={siteHref(isSummary ? "/future-strategy" : "/recommendations")}>{isSummary ? "查看未來方針建議" : "查看報告摘要"} →</a>
      <button className="report-clear" type="button" onClick={onClear}>清除結果</button>
    </div>
    {result.extraction_warnings.length > 0 && <aside className="report-warnings" role="status"><strong>內容讀取提醒</strong><ul>{result.extraction_warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul></aside>}
    <p className="report-review-note">AI 內容需人工核閱。來源頁碼指實際上傳文件；建議方針不代表企業已採納或承諾。</p>
    <article className="report-markdown" aria-label={isSummary ? "完整報告摘要內容" : "未來方針建議內容"}>
      <Markdown remarkPlugins={[remarkGfm]} skipHtml components={{
        a: ({ children }) => <span>{children}</span>,
        img: () => null,
      }}>{isSummary ? result.summary_markdown : result.recommendations_markdown}</Markdown>
    </article>
  </div>;
}
