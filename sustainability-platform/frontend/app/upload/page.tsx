import { SiteNav } from "../components/SiteNav";
import { SampleReport } from "../components/SampleReport";
import { ReportWorkspace } from "../components/ReportWorkspace";

export default function UploadPage() {
  return (
    <main className="advice-page demo-upload-page">
      <SiteNav active="upload" solid />
      <ReportWorkspace key="charts" purpose="charts">
        <section className="advice-results" aria-labelledby="upload-charts-title">
          <h2 id="upload-charts-title">圖表總覽</h2>
          <p className="upload-chart-status">下方圖表尚未與上方選擇的檔案連動。</p>
          <SampleReport />
        </section>
      </ReportWorkspace>
    </main>
  );
}
