import { SiteNav } from "../components/SiteNav";
import { ReportWorkspace } from "../components/ReportWorkspace";

export default function RecommendationsPage() {
  return (
    <main className="advice-page">
      <SiteNav active="recommendations" solid />
      <ReportWorkspace key="summary" purpose="summary" />
    </main>
  );
}
