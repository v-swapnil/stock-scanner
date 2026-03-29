export interface FundamentalsStock {
  // Basic Info
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  sector: string;
  industry: string;

  // Valuation
  epsDilutedTTM: number | null;
  priceToEarnings: number | null;
  forwardPriceToEarnings: number | null;
  priceToSales: number | null;
  priceToBook: number | null;
  priceToCash: number | null;
  pegTTM: number | null;

  // Margins
  grossMargin: number | null;
  operatingMargin: number | null;
  netMargin: number | null;

  // Returns
  roce: number | null;
  roa: number | null;
  roe: number | null;
  roic: number | null;

  // Income Statement
  revenueTTM: number | null;
  grossProfitTTM: number | null;
  operatingIncomeTTM: number | null;
  netIncomeTTM: number | null;

  // Balance Sheet
  totalAssets: number | null;
  totalLiabilities: number | null;
  totalDebt: number | null;
  cashOnHand: number | null;

  // Growth
  revenueGrowthTTM: number | null;
  grossProfitGrowthTTM: number | null;
  netIncomeGrowthTTM: number | null;

  // Performance
  perf1W: number | null;
  perf1M: number | null;
  perf3M: number | null;
  perf6M: number | null;
  perf1Y: number | null;
  perf5Y: number | null;
}

export type ColumnGroup =
  | "basic"
  | "valuation"
  | "margins"
  | "returns"
  | "income"
  | "balanceSheet"
  | "growth"
  | "performance";

export interface ColumnGroupConfig {
  id: ColumnGroup;
  label: string;
  columns: string[];
}

export const COLUMN_GROUPS: ColumnGroupConfig[] = [
  {
    id: "basic",
    label: "Basic Info",
    columns: ["symbol", "price", "marketCap", "sector"],
  },
  {
    id: "valuation",
    label: "Valuation",
    columns: [
      "epsDilutedTTM",
      "priceToEarnings",
      "forwardPriceToEarnings",
      "priceToSales",
      "priceToBook",
      "priceToCash",
      "pegTTM",
    ],
  },
  {
    id: "margins",
    label: "Margins",
    columns: ["grossMargin", "operatingMargin", "netMargin"],
  },
  {
    id: "returns",
    label: "Returns",
    columns: ["roce", "roa", "roe", "roic"],
  },
  {
    id: "income",
    label: "Income",
    columns: [
      "revenueTTM",
      "grossProfitTTM",
      "operatingIncomeTTM",
      "netIncomeTTM",
    ],
  },
  {
    id: "balanceSheet",
    label: "Balance Sheet",
    columns: ["totalAssets", "totalLiabilities", "totalDebt", "cashOnHand"],
  },
  {
    id: "growth",
    label: "Growth",
    columns: ["revenueGrowthTTM", "grossProfitGrowthTTM", "netIncomeGrowthTTM"],
  },
  {
    id: "performance",
    label: "Performance",
    columns: ["perf1W", "perf1M", "perf3M", "perf6M", "perf1Y", "perf5Y"],
  },
];

export interface FilterState {
  search: string;
  sectors: string[];
  marketCapMin: number | null;
  marketCapMax: number | null;
  peMin: number | null;
  peMax: number | null;
  roeMin: number | null;
  roeMax: number | null;
}

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  sectors: [],
  marketCapMin: null,
  marketCapMax: null,
  peMin: null,
  peMax: null,
  roeMin: null,
  roeMax: null,
};

export const MARKET_CAP_PRESETS = [
  { label: "All", min: null, max: null },
  { label: "Large Cap (>20K Cr)", min: 200000000000, max: null },
  { label: "Mid Cap (5K-20K Cr)", min: 50000000000, max: 200000000000 },
  { label: "Small Cap (<5K Cr)", min: null, max: 50000000000 },
];
