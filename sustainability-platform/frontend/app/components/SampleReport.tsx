"use client";

import { useState } from "react";
import { demoEmissionTrend, demoReport, demoScopes } from "../demo-data";

type ChartMode = "line" | "bar" | "pie";

const chartModes: { id: ChartMode; label: string }[] = [
  { id: "line", label: "折線圖" },
  { id: "bar", label: "長條圖" },
  { id: "pie", label: "圓餅圖" },
];

function LineChart() {
  const chartPoints = demoEmissionTrend.map((point, pointIndex) => ({
    ...point,
    x: 112 + pointIndex * 190,
    verticalPosition: 204 - ((point.value - 260) / 80) * 150,
  }));

  return (
    <svg
      className="demo-line-chart"
      viewBox="0 0 760 260"
      preserveAspectRatio="none"
      role="img"
      aria-label="2022 至 2025 年溫室氣體排放總量分別為 277、298、312 和 318 噸二氧化碳當量"
    >
      {[260, 300, 340].map((level) => {
        const verticalPosition = 204 - ((level - 260) / 80) * 150;
        return (
          <g key={level}>
            <line x1="88" x2="716" y1={verticalPosition} y2={verticalPosition} />
          </g>
        );
      })}
      <polyline points={chartPoints.map(({ x, verticalPosition }) => `${x},${verticalPosition}`).join(" ")} />
      {chartPoints.map((point) => (
        <circle key={point.year} cx={point.x} cy={point.verticalPosition} r="6" />
      ))}
    </svg>
  );
}

function BarChart() {
  const maxValue = Math.max(...demoScopes.map((scope) => scope.value));

  return (
    <div
      className="demo-bar-chart"
      role="img"
      aria-label="2025 年排放量：範疇一 48、範疇二 183、範疇三 87 噸二氧化碳當量"
    >
      {demoScopes.map((scope) => (
        <div className={`demo-bar-column demo-scope-${scope.tone}`} key={scope.number}>
          <span className="demo-bar-value">{scope.value}</span>
          <div className="demo-bar-track" aria-hidden="true">
            <span style={{ height: `${(scope.value / maxValue) * 100}%` }} />
          </div>
          <span className="demo-bar-label">{scope.label}</span>
        </div>
      ))}
    </div>
  );
}

function PieChart() {
  const pieSegments = demoScopes.reduce<{ end: number; stops: string[] }>(
    (result, scope) => {
      const end = result.end + scope.share;
      return {
        end,
        stops: [...result.stops, `var(--demo-scope-${scope.tone}) ${result.end}% ${end}%`],
      };
    },
    { end: 0, stops: [] },
  );

  return (
    <div className="demo-pie-layout">
      <div
        className="demo-pie-chart"
        role="img"
        aria-label="2025 年排放組成：範疇一 15%、範疇二 58%、範疇三 27%"
        style={{ background: `conic-gradient(from -90deg, ${pieSegments.stops.join(", ")})` }}
      />
      <ul className="demo-pie-legend" aria-label="排放組成圖例">
        {demoScopes.map((scope) => (
          <li className={`demo-scope-${scope.tone}`} key={scope.number}>
            <span className="demo-legend-name"><i aria-hidden="true" />{scope.label}</span>
            <strong>{scope.share}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SampleReport() {
  const [chartMode, setChartMode] = useState<ChartMode>("line");
  const chartTitles: Record<ChartMode, string> = {
    line: "年度排放趨勢",
    bar: "2025 年各範疇排放量",
    pie: "2025 年排放組成",
  };

  return (
    <section className="demo-report-card" aria-label="永續資料報表預覽">
      <header className="demo-report-heading">
        <div>
          <h2>{demoReport.company}</h2>
          <p>{demoReport.period} 永續資料</p>
        </div>
        <p className="demo-report-notice">排放趨勢以 tCO₂e 呈現，年度指標保留各自單位。切換圖表後，可對照排放總量的年度變化，以及範疇一至三的占比。</p>
      </header>

      <div className="demo-kpis" aria-label={`${demoReport.year} 年資料摘要`}>
        {demoReport.indicators.map((indicator) => (
          <article className="demo-kpi" key={indicator.label}>
            <h3>{indicator.label}</h3>
            <p><strong>{indicator.value}</strong><span>{indicator.unit}</span></p>
          </article>
        ))}
      </div>

      <div className="demo-report-grid">
        <section className="demo-chart-panel" aria-labelledby="demo-chart-title">
          <header className="demo-panel-heading">
            <div>
              <h3 id="demo-chart-title">{chartTitles[chartMode]}</h3>
              <p>溫室氣體排放｜單位：tCO₂e</p>
            </div>
            <div className="demo-chart-switch" role="group" aria-label="選擇圖表呈現方式">
              {chartModes.map((mode) => (
                <button
                  aria-pressed={chartMode === mode.id}
                  className={chartMode === mode.id ? "is-selected" : ""}
                  key={mode.id}
                  onClick={() => setChartMode(mode.id)}
                  type="button"
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </header>

          <figure className="demo-chart-figure">
            <div className="demo-chart-stage" key={chartMode}>
              {chartMode === "line" ? <LineChart /> : chartMode === "bar" ? <BarChart /> : <PieChart />}
              {chartMode === "line" && (
                <div className="demo-trend-values" role="list" aria-label="各年度總排放量，單位為 tCO₂e">
                  {demoEmissionTrend.map((point) => (
                    <div key={point.year} role="listitem"><span>{point.year}</span><strong>{point.value}</strong></div>
                  ))}
                </div>
              )}
            </div>
            <figcaption aria-live="polite">
              {chartMode === "line" && "年度總量由 2022 年的 277 增至 2025 年的 318 tCO₂e。"}
              {chartMode === "bar" && "長條圖用來比較 2025 年各範疇的排放量。"}
              {chartMode === "pie" && "圓餅圖呈現 2025 年各範疇占總排放量的比例。"}
            </figcaption>
          </figure>

          <details className="demo-data-details">
            <summary>查看各年度數值</summary>
            <div className="demo-table-wrap">
              <table>
                <caption>各年度溫室氣體排放量，單位為 tCO₂e</caption>
                <thead>
                  <tr><th scope="col">年度</th><th scope="col">範疇一</th><th scope="col">範疇二</th><th scope="col">範疇三</th><th scope="col">合計</th></tr>
                </thead>
                <tbody>
                  {demoEmissionTrend.map((point, pointIndex) => {
                    const scopeValues = [42, 45, 47, 48][pointIndex];
                    const scopeTwoValues = [160, 171, 176, 183][pointIndex];
                    const scopeThreeValues = [75, 82, 89, 87][pointIndex];
                    return (
                      <tr key={point.year}>
                        <th scope="row">{point.year}</th>
                        <td>{scopeValues}</td><td>{scopeTwoValues}</td><td>{scopeThreeValues}</td><td>{point.value}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </details>
        </section>

        <aside className="demo-scope-panel" aria-labelledby="demo-scope-title">
          <h3 id="demo-scope-title">2025 年排放範疇</h3>
          <p>各範疇合計 {demoScopes.reduce((total, scope) => total + scope.value, 0)} tCO₂e</p>
          <ul>
            {demoScopes.map((scope) => (
              <li className={`demo-scope-row demo-scope-${scope.tone}`} key={scope.number}>
                <div><strong>{scope.label}</strong><span>{scope.value} tCO₂e</span></div>
                <div className="demo-scope-track" aria-hidden="true"><span style={{ width: `${scope.share}%` }} /></div>
                <span className="demo-scope-share">占總量 {scope.share}%</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
