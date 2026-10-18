export const demoReport = {
  company: "富榜金控",
  period: "2022–2025",
  year: 2025,
  emissionsUnit: "tCO₂e",
  indicators: [
    { label: "溫室氣體排放", value: "318", unit: "噸 CO₂e" },
    { label: "用電量", value: "426,000", unit: "kWh" },
    { label: "廢棄物回收率", value: "61", unit: "%" },
  ],
} as const;

export const demoEmissionTrend = [
  { year: 2022, value: 277 },
  { year: 2023, value: 298 },
  { year: 2024, value: 312 },
  { year: 2025, value: 318 },
] as const;

export const demoScopes = [
  { number: "1", label: "範疇一", value: 48, share: 15, tone: "one" },
  { number: "2", label: "範疇二", value: 183, share: 58, tone: "two" },
  { number: "3", label: "範疇三", value: 87, share: 27, tone: "three" },
] as const;

export const demoActions = [
  {
    title: "整理每月用電與營運紀錄",
    basis: "2025 年範疇二為 183 tCO₂e，約占總量 58%。",
    description: "可按月彙整電費帳單、電表讀值與用電期間，並記錄主要設備、營運時段及異常停機情況。資料依廠區或部門分類後，較容易比較不同月份的變化，找出用電較集中的設備或時段。若後續採取節能措施，也可沿用相同口徑記錄前後用電量，作為檢視成效的參考。",
  },
  {
    title: "補上主要採購項目的來源資訊",
    basis: "2025 年範疇三為 87 tCO₂e，約占總量 27%。",
    description: "可從金額或用量較高的採購品項開始，記錄供應商、產品規格、採購數量、資料期間與計算方式。若供應商提供碳排資料，建議一併保留盤查邊界及資料年份，方便日後比對。暫時取得不到的項目可註記待補，並與估算值分開管理，避免不同來源的數字被當成同一口徑。",
  },
  {
    title: "集中保留燃料與設備活動紀錄",
    basis: "2025 年範疇一為 48 tCO₂e，約占總量 15%。",
    description: "若營運涉及公務車、鍋爐、發電機或冷媒設備，可按月份保留油料、燃料、里程、設備運轉及冷媒補充或維修紀錄。每筆資料註明來源文件、所屬單位、數量與期間，後續較容易確認排放源，也能降低跨年度漏記或重複計算的情況。排放範圍、係數與計算方式仍須依採用的盤查準則及設備狀況確認。",
  },
] as const;
