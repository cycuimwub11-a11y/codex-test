"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { hasPdfSignature, reportFileError, spreadsheetContentError } from "./report-file.mjs";
import { BambooFlow } from "./BambooFlow";
import { siteAsset } from "../lib/site-path";
import { analyzePdf, isAnalysisResult, storageKey, type AnalysisResult } from "../lib/report-api";
import { ReportResults } from "./ReportResults";

type FileState = "empty" | "reading" | "loaded" | "error";
type IconName = "question" | "file-text" | "upload-simple" | "sparkle" | "circle" | "check-circle";

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return <span aria-hidden="true" className={`advice-icon ${className}`} style={{ maskImage: `url(${siteAsset(`/images/icons/advice-${name}.svg`)})` }} />;
}

function keepDialogFocus(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== "Tab") return;
  const controls = event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled), a[href]");
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (first && (event.shiftKey ? document.activeElement === first : document.activeElement === last)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  }
}

type WorkspacePurpose = "charts" | "summary" | "future-strategy";

export function ReportWorkspace({ purpose, children }: { purpose: WorkspacePurpose; children?: ReactNode }) {
  const isChartWorkspace = purpose === "charts";
  const pageTitle = isChartWorkspace ? "資料上傳" : purpose === "summary" ? "報告摘要" : "未來方針建議";
  const resultTitle = purpose === "summary" ? "報告摘要" : "未來方針建議";
  const resultNoun = purpose === "summary" ? "摘要" : "建議";
  const actionLabel = purpose === "summary" ? "一鍵生成摘要" : "一鍵生成建議";
  const fileKind = isChartWorkspace ? "試算表" : "報告";
  const selectFileLabel = isChartWorkspace ? "選擇 CSV 或 XLSX 檔案" : "選擇 PDF 報告";
  const inputRef = useRef<HTMLInputElement>(null);
  const readerRef = useRef<FileReader | null>(null);
  const fileRef = useRef<File | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const helpRef = useRef<HTMLDialogElement>(null);
  const helpButtonRef = useRef<HTMLButtonElement>(null);
  const previewRef = useRef<HTMLDialogElement>(null);
  const previewButtonRef = useRef<HTMLButtonElement>(null);
  const [state, setState] = useState<FileState>("empty");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [animationPreview, setAnimationPreview] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sourceKind, setSourceKind] = useState<AnalysisResult["source_kind"]>("original_report");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [resultFileName, setResultFileName] = useState("");
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    if (isChartWorkspace) return;
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? "null");
      if (saved && typeof saved.fileName === "string" && isAnalysisResult(saved.result)) {
        setResult(saved.result);
        setResultFileName(saved.fileName);
        setRestored(true);
      }
    } catch {
      // Storage may be unavailable in private browsing; generation still works.
    }
  }, [isChartWorkspace]);

  useEffect(() => () => {
    const reader = readerRef.current;
    readerRef.current = null;
    if (reader?.readyState === FileReader.LOADING) reader.abort();
    requestRef.current?.abort();
    requestRef.current = null;
  }, []);

  function cancelAnalysis() {
    requestRef.current?.abort();
    requestRef.current = null;
    setIsAnalyzing(false);
    setAnimationPreview(false);
  }

  function clearResult() {
    setResult(null);
    setResultFileName("");
    setRestored(false);
    if (!isChartWorkspace) {
      try { sessionStorage.removeItem(storageKey); } catch { /* Optional browser storage. */ }
    }
  }

  function removeFile() {
    cancelAnalysis();
    clearResult();
    fileRef.current = null;
    setAnimationPreview(false);
    const reader = readerRef.current;
    readerRef.current = null;
    if (reader?.readyState === FileReader.LOADING) reader.abort();
    previewRef.current?.close();
    setState("empty");
    setFileName("");
    setFileSize(0);
    setProgress(0);
    setError("");
  }

  function loadFile(file: File | undefined) {
    if (!file) return;
    removeFile();
    setFileName(file.name);
    setFileSize(file.size);
    const fileError = reportFileError(file, isChartWorkspace);
    if (fileError) {
      setState("error");
      setError(fileError);
      return;
    }

    const reader = new FileReader();
    readerRef.current = reader;
    setState("reading");
    reader.onprogress = (event) => {
      if (readerRef.current === reader && event.lengthComputable && event.total > 0) {
        setProgress(Math.min(100, Math.floor(event.loaded / event.total * 100)));
      }
    };
    reader.onerror = () => {
      if (readerRef.current !== reader) return;
      readerRef.current = null;
      setState("error");
      setError(isChartWorkspace ? "無法載入這份檔案，請重新選擇或改用其他 CSV、XLSX 檔案。" : "無法載入這份檔案，請重新選擇或改用其他 PDF。");
    };
    reader.onload = () => {
      if (readerRef.current !== reader) return;
      readerRef.current = null;
      const bytes = new Uint8Array(reader.result as ArrayBuffer);
      const contentError = isChartWorkspace ? spreadsheetContentError(file.name, bytes) : hasPdfSignature(bytes) ? "" : "這份檔案不像 PDF，請確認檔案格式後重新選擇。";
      if (contentError) {
        setState("error");
        setError(contentError);
        return;
      }
      setProgress(100);
      fileRef.current = file;
      setState("loaded");
    };
    reader.readAsArrayBuffer(file);
  }

  async function generate() {
    const file = fileRef.current;
    if (!file || requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    clearResult();
    setError("");
    setIsAnalyzing(true);
    setAnimationPreview(true);
    try {
      const analysis = await analyzePdf(file, sourceKind, controller.signal);
      if (requestRef.current !== controller) return;
      setResult(analysis);
      setResultFileName(file.name);
      try { sessionStorage.setItem(storageKey, JSON.stringify({ fileName: file.name, result: analysis })); } catch { /* Downloads remain available. */ }
    } catch (cause) {
      if (requestRef.current === controller && !controller.signal.aborted) {
        setError(cause instanceof Error ? cause.message : "分析失敗，請重試。");
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setIsAnalyzing(false);
        setAnimationPreview(false);
      }
    }
  }

  const isReading = state === "reading";
  const isLoaded = state === "loaded";
  const documentTitle = fileName.replace(isChartWorkspace ? /\.(csv|xlsx)$/i : /\.pdf$/i, "");
  const status = isAnalyzing ? "正在讀取報告並生成兩份文件，請稍候" : result ? "摘要與建議方針已完成" : state === "empty" ? `等待選擇${fileKind}` : isReading ? "正在載入檔案" : isLoaded ? "檔案已載入此頁" : "檔案未能載入";

  return (
    <div className="advice-shell">
      <header className="advice-heading">
        <h1>{pageTitle}</h1>
        <button ref={helpButtonRef} className="advice-help-button" type="button" aria-label={`如何使用${pageTitle}`} aria-haspopup="dialog" onClick={() => helpRef.current?.showModal()}>
          <Icon name="question" />
        </button>
      </header>

      <section className="advice-preparation" aria-labelledby="advice-preparation-title" aria-busy={isReading || isAnalyzing}>
        <div className="advice-document">
          <div className={`advice-cover ${isLoaded ? "has-file" : ""}`}>
            <Icon name="file-text" />
            <span>{isChartWorkspace ? "永續資料試算表" : fileName ? "PDF 報告" : "永續報告書"}</span>
            <strong>{fileName ? documentTitle : isChartWorkspace ? "選擇要轉成圖表的資料" : "你的報告，從這裡開始"}</strong>
            {isLoaded && <button ref={previewButtonRef} className="advice-cover-preview" type="button" onClick={() => previewRef.current?.showModal()}>檔案資訊</button>}
          </div>
          <p className="advice-file-caption">{fileName || "尚未選擇檔案"}</p>
          <div className="advice-file-controls">
            <button type="button" className="advice-select-file" disabled={isReading || isAnalyzing} onClick={() => inputRef.current?.click()}>
              <Icon name="upload-simple" />{fileName ? "更換檔案" : selectFileLabel}
            </button>
            {fileName && <button className="advice-remove-file" type="button" onClick={removeFile}>{isReading ? "取消載入" : "移除"}</button>}
          </div>
          <input ref={inputRef} className="advice-file-input" type="file" accept={isChartWorkspace ? ".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : ".pdf,application/pdf"} aria-label={selectFileLabel} tabIndex={-1} onChange={(event) => { loadFile(event.target.files?.[0]); event.target.value = ""; }} />
          {!fileName && <p className="advice-file-format">{isChartWorkspace ? "CSV、XLSX，單一檔案上限 25 MB" : "文字型 PDF，上限 10 MB、300 頁、100,000 字元"}</p>}
          {!isChartWorkspace && <label className="report-source-kind">文件種類
            <select value={sourceKind} disabled={isAnalyzing} onChange={(event) => { setSourceKind(event.target.value as AnalysisResult["source_kind"]); clearResult(); }}>
              <option value="original_report">原始永續報告書</option>
              <option value="secondary_summary">已整理的摘要或建議文件</option>
            </select>
          </label>}
        </div>

        <div className="advice-processing">
          <h2 id="advice-preparation-title">{isChartWorkspace ? "資料處理狀態" : "報告處理狀態"}</h2>
          <div className="advice-current-file">
            <Icon name="file-text" />
            <div><strong>{fileName || `選擇要處理的${fileKind}`}</strong><span>{fileName ? `${(fileSize / 1024 / 1024).toFixed(2)} MB` : "檔案名稱與處理狀態會顯示在這裡"}</span></div>
          </div>
          <div className="advice-status" role="status" aria-atomic="true">
            <span>{status}</span>
            {isReading && <strong>{progress}<small>%</small></strong>}
            {isLoaded && <Icon name="check-circle" />}
          </div>
          {isReading && <div className="advice-sr-only" role="progressbar" aria-label={`將${fileKind}載入此頁的進度`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} />}

          <BambooFlow active={animationPreview && isLoaded} />

          <ol className="advice-steps" aria-label={`${fileKind}準備流程`}>
            <li className={isLoaded ? "is-complete" : "is-current"} aria-current={!isLoaded ? "step" : undefined}>
              <Icon name={isLoaded ? "check-circle" : "circle"} /><span>{isLoaded ? "檔案已載入" : isReading ? `正在載入${fileKind}` : `載入${fileKind}檔案`}</span>
            </li>
            <li className={result ? "is-complete" : isAnalyzing ? "is-current" : ""}><Icon name={result ? "check-circle" : "circle"} /><span>{isChartWorkspace ? "辨識工作表與欄位" : "讀取報告文字"}</span></li>
            <li className={result ? "is-complete" : ""}><Icon name={result ? "check-circle" : "circle"} /><span>{isChartWorkspace ? "整理圖表資料" : "生成摘要與建議方針"}</span></li>
          </ol>

          {error && <p className="advice-error" role="alert">{error}</p>}
          <div className="advice-generation">
            <p id="advice-generation-note">{isChartWorkspace
              ? "按鈕目前可預覽流水動態，試算表解析尚未串接，下方圖表維持原有資料。"
              : "按下生成後，報告文字會傳至 AI 分析服務，一次產生摘要與建議方針兩份文件。長報告可能需要數分鐘，請保持此頁開啟。"}</p>
            <button className="advice-generate-button" type="button" disabled={!isLoaded || isAnalyzing} aria-describedby="advice-generation-note" onClick={() => { if (isChartWorkspace) setAnimationPreview((playing) => !playing); else void generate(); }}><Icon name="sparkle" />{isAnalyzing ? "分析中…" : isChartWorkspace ? animationPreview ? "停止動態預覽" : "準備圖表資料" : result ? "重新分析報告" : actionLabel}</button>
            {isAnalyzing && <button type="button" className="advice-remove-file" onClick={cancelAnalysis}>停止等待</button>}
            <span className="advice-motion-status" role="status">{isAnalyzing ? "AI 正在分析，動畫不代表實際完成百分比。" : isChartWorkspace && animationPreview ? "流水動態預覽中" : ""}</span>
          </div>
        </div>
      </section>

      {isChartWorkspace ? children : <section className="advice-results" aria-labelledby="advice-results-title">
        <h2 id="advice-results-title">{resultTitle}</h2>
        {result ? <ReportResults result={result} purpose={purpose} fileName={resultFileName} restored={restored} onClear={clearResult} /> : <div className="advice-empty-results">
          <Icon name="file-text" />
          <div><h3>{isAnalyzing ? "正在生成文件" : isLoaded ? "報告已準備好" : "等待報告準備完成"}</h3><p>{isAnalyzing ? `分析完成後會在此顯示${resultNoun}，並提供兩份文件下載。` : isLoaded ? `點選「${actionLabel}」開始讀取這份報告，完成後可核閱與下載。` : `選擇報告後，可在上方確認檔案。${resultTitle}會在報告內容讀取與分析完成後顯示。`}</p></div>
        </div>}
      </section>}

      <dialog ref={helpRef} className="advice-dialog advice-help-dialog" aria-labelledby="advice-help-title" onKeyDown={keepDialogFocus} onClose={() => helpButtonRef.current?.focus()}>
        <div className="advice-dialog-heading"><h2 id="advice-help-title">如何使用{pageTitle}</h2><form method="dialog"><button className="advice-dialog-close" autoFocus>關閉</button></form></div>
        <ol className="advice-help-steps">
          <li><strong>選擇{fileKind}</strong><p>{isChartWorkspace ? "選擇 CSV 或 Excel 的 XLSX 檔案，檔名會顯示在資料準備區。單一檔案上限為 25 MB。" : "選擇要處理的 PDF，檔案名稱會顯示在報告準備區。"}更換檔案時，原本的檔案會從此頁移除。</p></li>
          <li><strong>確認檔案</strong><p>載入完成後，可點選「檔案資訊」確認檔名與大小。{isChartWorkspace ? "要核對欄位、單位與數值，請開啟原始試算表。" : "要核對報告內容，請開啟原始 PDF。"}百分比只代表檔案載入此頁的進度，不代表內容已分析完成。</p></li>
          <li><strong>查看處理狀態</strong><p>{isChartWorkspace ? "工作表辨識、欄位讀取與圖表資料整理尚未串接；檔案不會傳送到伺服器。" : "點選生成才會上傳 PDF 至後端，擷取文字並傳送至 OpenAI 分析。上限為 10 MB、300 頁、100,000 字元；掃描 PDF 需先 OCR。請確認文件可提供給分析服務。"}</p></li>
          <li><strong>{isChartWorkspace ? "啟動流水動態" : "生成兩份文件"}</strong><p>{isChartWorkspace ? "點選準備圖表資料可預覽流水動態，此階段不會產生新的圖表。" : "同一次分析會產生完整摘要及未來方針建議；完成後可切換另一頁查看，無需再次生成。結果暫存在目前瀏覽器分頁，清除結果可移除暫存。停止等待不保證後端停止或免除已發生的 API 費用。"}若系統設定為減少動態效果，畫面會保持靜止。</p></li>
          <li><strong>{isChartWorkspace ? "查看圖表" : `產生與核對${resultNoun}`}</strong><p>{isChartWorkspace
            ? "此頁預計將試算表資料轉成圖表，供你切換長條圖、圓餅圖或折線圖查看。下方圖表尚未連動本次選擇的檔案，Power BI 連線也尚未設定。檔案載入完成不代表欄位、數值或圖表已經核對。"
            : purpose === "summary"
              ? "摘要需回到原始報告核對數字、資料年度、來源頁碼與限制，不代表所有揭露均已收錄或經外部確信。可下載完整報告摘要 Markdown。"
              : "未來方針是平台分析建議，不代表企業已採納或承諾。請依報告事實及企業實際情況判斷，可下載獨立的建議方針 Markdown。"}</p></li>
        </ol>
      </dialog>

      <dialog ref={previewRef} className="advice-dialog advice-preview-dialog" aria-labelledby="advice-preview-title" onKeyDown={keepDialogFocus} onClose={() => previewButtonRef.current?.focus()}>
        <div className="advice-dialog-heading"><h2 id="advice-preview-title">檔案資訊</h2><form method="dialog"><button className="advice-dialog-close" autoFocus>關閉</button></form></div>
        {isLoaded && <>
          <p className="advice-preview-filename">{fileName}</p>
          <p className="advice-preview-unavailable">{isChartWorkspace ? fileName.split(".").pop()?.toUpperCase() : "PDF"} · {(fileSize / 1024 / 1024).toFixed(2)} MB<br />{isChartWorkspace ? "檔案已載入此頁，尚未讀取工作表、欄位與數值。要核對資料，請開啟原始試算表。" : "檔案已載入此頁，按下生成才會上傳分析。要核對全文，請開啟原始 PDF。"}</p>
        </>}
      </dialog>
    </div>
  );
}
