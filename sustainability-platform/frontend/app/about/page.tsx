import { SiteNav } from "../components/SiteNav";

const pillars = [
  { short: "E", title: "環境", description: "能源、用水、排放與廢棄物。" },
  { short: "S", title: "社會", description: "員工、職場安全與供應鏈。" },
  { short: "G", title: "治理", description: "決策程序、風險管理與資訊揭露。" },
];

const reasons = [
  {
    title: "客戶與供應鏈",
    description: "客戶、金融機構或合作夥伴可能會詢問企業的用電、原料來源或運輸排放。平時整理相關資料，較容易回應合作需求，也能了解對方重視哪些資訊。實際內容仍依合作關係而定。",
  },
  {
    title: "揭露規範",
    description: "永續報告書常用來整理年度 ESG 資訊。上市櫃公司須依規定編製與申報，IFRS 永續揭露、溫室氣體盤查及碳費則各有適用條件和時程。",
  },
  {
    title: "了解營運現況",
    description: "用電、用水、原物料和排放資料常分散在不同部門。彙整後可比較年度變化，找出資料缺口和需要進一步確認的環節，作為後續管理討論的參考。改善方向仍要依企業現況評估。",
  },
];

const regulations = [
  {
    title: "永續報告書",
    audience: "上市櫃公司，依所屬交易所作業辦法",
    cueLabel: "申報時點",
    timing: "適用公司須於每年 8 月 31 日前申報前一年度永續報告書。",
    detail: "上市與上櫃公司分別依所屬交易所作業辦法編製和申報。特定產業另有揭露指標，部分公司也須依規定辦理溫室氣體資訊確信。",
    sources: [
      {
        label: "證交所：上市公司永續報告書作業辦法第 5 條",
        href: "https://twse-regulation.twse.com.tw/TW/law/DOC01_print.aspx?FLCODE=FL075209&FLNO=5",
      },
      {
        label: "櫃買中心：上櫃公司永續報告書規定",
        href: "https://portal.tpex.org.tw/inquiry/sustainabilityReport/regulation/361fdbde-87ed-48ab-8df3-adda6f1b2464",
      },
    ],
  },
  {
    title: "IFRS 永續揭露",
    audience: "上市櫃公司，依實收資本額分階段適用",
    cueLabel: "適用時程",
    timing: "2026、2027、2028 會計年度依序適用，首次申報在各適用年度的隔年。",
    detail: "實收資本額達 100 億元、50 億元至未達 100 億元、未達 50 億元的公司，依序自上述會計年度適用。範疇三排放資訊另有緩衝安排。無面額或非每股 10 元面額的公司，適用級距另依規定計算。",
    sources: [
      {
        label: "金管會：永續揭露準則分階段適用令",
        href: "https://law.fsc.gov.tw/LawContent.aspx?id=GL004194",
      },
    ],
  },
  {
    title: "溫室氣體盤查登錄",
    audience: "符合環境部公告條件的事業排放源",
    cueLabel: "登錄時點",
    timing: "適用對象須於每年 4 月 30 日前登錄前一年度資料。",
    detail: "是否納入盤查登錄及是否須查驗，依環境部公告與排放源條件判定。盤查登錄和第三方查驗是不同程序，公告要求查驗的排放源還須依規定完成查驗及上傳。",
    sources: [
      {
        label: "環境部：應盤查登錄對象與作業指引",
        href: "https://ghgregistry.moenv.gov.tw/epa_ghg/GuideAndCalculation/GuideAndCalculation_02.aspx",
      },
      {
        label: "環境部：盤查登錄及查驗管理辦法",
        href: "https://oaout.moenv.gov.tw/law/LawContent.aspx?id=GL005954",
      },
    ],
  },
  {
    title: "碳費",
    audience: "符合盤查查驗及排放量條件的電力、燃氣供應業與製造業",
    cueLabel: "關鍵門檻",
    timing: "全廠直接排放與用電間接排放合計達每年 2.5 萬公噸 CO₂e，是判斷條件之一。",
    detail: "達到排放量門檻，還須符合公告的排放源及行業條件。首次符合者的起繳時間另有規定。適用事業通常於每年 5 月底前申報繳納前一年度碳費。",
    sources: [
      {
        label: "環境部：碳費收費辦法第 3、3-1、4 條",
        href: "https://oaout.moenv.gov.tw/law/LawContent.aspx?id=GL007914",
      },
    ],
  },
];

const scopes = [
  {
    number: "1",
    title: "範疇一",
    english: "Scope 1",
    diagramLabel: "直接排放",
    description: "企業擁有或控制的設備與營運活動直接排放溫室氣體，常見來源包含燃料燃燒、製程反應與冷媒逸散。",
    example: "例：自有鍋爐燃燒天然氣、公司車加油，或空調設備冷媒逸散。",
  },
  {
    number: "2",
    title: "範疇二",
    english: "Scope 2",
    diagramLabel: "能源使用",
    description: "企業購買並使用的電力、蒸汽、熱能或冷能所產生的間接排放。排放發生在能源供應端，盤查時會依企業的能源使用量估算。",
    example: "例：辦公室使用外購電力，或工廠使用外購蒸汽。",
  },
  {
    number: "3",
    title: "範疇三",
    english: "Scope 3",
    diagramLabel: "價值鏈",
    description: "企業價值鏈中，範疇一和範疇二以外的其他間接排放，涵蓋上游採購與運輸，也可能包括售出產品的使用和處置等下游活動。",
    example: "例：採購鋼材在供應商製造時產生的排放、委外運輸，或售出產品使用期間的排放。",
  },
];

const standards = [
  {
    title: "GHG Protocol",
    description: "用來分類與計算溫室氣體排放。範疇一至三的定義也以這套架構為基礎。",
    source: "溫室氣體盤查議定書",
    href: "https://ghgprotocol.org/calculation-tools-faq",
  },
  {
    title: "GRI Standards",
    description: "聚焦組織對經濟、環境與人的重大影響，常用於永續報告。",
    source: "全球永續性報告協會",
    href: "https://www.globalreporting.org/standards/standards-development/universal-standards/",
  },
  {
    title: "IFRS S1／S2",
    description: "聚焦可能影響企業前景的永續相關風險與機會，以及氣候相關揭露。",
    source: "國際財務報導準則基金會",
    href: "https://www.ifrs.org/sustainability/knowledge-hub/introduction-to-issb-and-ifrs-sustainability-disclosure-standards/",
  },
];

export default function AboutPage() {
  return (
    <main className="about-page">
      <SiteNav active="about" solid />

      <header className="about-intro" id="intro">
        <div className="about-shell">
          <h1>什麼是企業永續？</h1>
          <p className="about-lead">
            企業永續關心經營活動對環境與人的影響，也關心企業如何做決策、管理風險。
            至於要揭露哪些資料，仍須看企業的身分與適用規定。
          </p>
          <p className="about-esg-definition">環境（E，Environmental）、社會（S，Social）與治理（G，Governance），常合稱 ESG。</p>
          <div className="about-pillars" aria-label="環境、社會與治理三個面向">
            {pillars.map((pillar) => (
              <article className="about-pillar" key={pillar.short}>
                <span aria-hidden="true">{pillar.short}</span>
                <h2>{pillar.title}</h2>
                <p>{pillar.description}</p>
              </article>
            ))}
          </div>
          <nav className="about-jump-nav" aria-label="本頁內容">
            <a href="#why">企業為什麼重視</a>
            <a href="#rules">臺灣規範</a>
            <a href="#scope">排放範疇</a>
            <a href="#standards">常見準則</a>
          </nav>
        </div>
      </header>

      <section className="about-section about-why" id="why" aria-labelledby="why-title">
        <div className="about-shell">
          <h2 id="why-title">企業為什麼開始重視永續？</h2>
          <p className="about-section-lead">企業各有不同的考量，常見原因包括：</p>
          <div className="about-reasons">
            {reasons.map((reason) => (
              <article className="about-reason" key={reason.title}>
                <h3>{reason.title}</h3>
                <p>{reason.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section about-rules" id="rules" aria-labelledby="rules-title">
        <div className="about-shell">
          <h2 id="rules-title">臺灣有哪些揭露與盤查要求？</h2>
          <p className="about-section-lead">
            企業常透過年度永續報告書整理環境、社會與治理資訊。臺灣上市櫃公司的編製與申報依交易所規定辦理，IFRS 永續揭露、溫室氣體盤查與碳費也各有適用條件。企業是否須辦理，應依相關法規與主管機關公告判斷。
          </p>
          <div className="about-rule-list">
            {regulations.map((regulation) => (
              <article className="about-rule" key={regulation.title}>
                <div className="about-rule-heading">
                  <h3>{regulation.title}</h3>
                  <p><strong>適用對象</strong>{regulation.audience}</p>
                </div>
                <p className="about-rule-timing"><strong>{regulation.cueLabel}</strong>{regulation.timing}</p>
                <details>
                  <summary>查看適用提醒與官方來源</summary>
                  <div className="about-rule-detail">
                    <p>{regulation.detail}</p>
                    <ul>
                      {regulation.sources.map((source) => (
                        <li key={source.href}><a href={source.href}>{source.label} ↗</a></li>
                      ))}
                    </ul>
                  </div>
                </details>
              </article>
            ))}
          </div>
          <p className="about-rule-note">
            本頁為入門導覽，不能取代法規原文或個案判斷。資料查核日期：2026 年 9 月 23 日。正式申報前，請再核對主管機關最新公告。
          </p>
        </div>
      </section>

      <section className="about-section about-scopes" id="scope" aria-labelledby="scope-title">
        <div className="about-shell">
          <h2 id="scope-title">大家常說的範疇一、二、三，又是什麼意思？</h2>
          <div className="about-scope-layout">
            <div className="about-scope-definitions">
              {scopes.map((scope) => (
                <article className="about-scope" key={scope.number}>
                  <div className="about-scope-heading">
                    <h3>{scope.title}</h3>
                    <span>{scope.english}</span>
                  </div>
                  <p>{scope.description}</p>
                  <p className="about-scope-example">{scope.example}</p>
                </article>
              ))}
            </div>
            <div className="about-scope-diagram" role="img" aria-label="範疇一直接排放置於上方，範疇二能源使用和範疇三價值鏈排放並列於下方">
              {scopes.map((scope) => (
                <div className="about-scope-diagram-card" key={scope.number}>
                  <strong>{scope.number}</strong>
                  <span>{scope.diagramLabel}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="about-source-note">
            定義參考 <a href="https://ghgprotocol.org/calculation-tools-faq">GHG Protocol 官方說明 ↗</a>。各範疇的盤查及揭露義務，仍依適用制度判斷。
          </p>
        </div>
      </section>

      <section className="about-section about-standards" id="standards" aria-labelledby="standards-title">
        <div className="about-shell">
          <h2 id="standards-title">問題來了，這些準則是在負責什麼？</h2>
          <div className="about-standard-list">
            {standards.map((standard) => (
              <article className="about-standard" key={standard.title}>
                <h3>{standard.title}</h3>
                <p>{standard.description}</p>
                <a href={standard.href}>{standard.source} ↗</a>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
