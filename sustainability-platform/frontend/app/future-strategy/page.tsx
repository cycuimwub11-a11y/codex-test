import { SiteNav } from "../components/SiteNav";
import { ReportWorkspace } from "../components/ReportWorkspace";

export default function FutureStrategyPage() {
  return (
    <main className="advice-page">
      <SiteNav active="future-strategy" solid />
      <ReportWorkspace key="future-strategy" purpose="future-strategy" />
    </main>
  );
}
