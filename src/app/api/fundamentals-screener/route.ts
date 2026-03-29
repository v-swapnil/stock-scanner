import { FundamentalsStock } from "@/components/fundamentals/types";

const DEFAULT_MARKET_CAP_BILLIONS = 50;
const DEFAULT_LIMIT = 500;
const MAX_LIMIT = 1000;

// TradingView scanner columns for fundamentals data
// Using only columns that are known to work from the existing stocks-scanner
function getFundamentalsColumns() {
  return [
    // Basic Info
    "name",
    "description",
    "sector",
    "industry",
    "close",
    "market_cap_basic",

    // Valuation
    "earnings_per_share_diluted_ttm",
    "price_earnings_ttm",
    "non_gaap_price_to_earnings_per_share_forecast_next_fy",
    "price_sales_current",
    "price_book_ratio",
    "price_free_cash_flow_ttm",
    "price_earnings_growth_ttm",

    // Margins (FY = Fiscal Year)
    "gross_margin_fy",
    "net_margin_fy",

    // Returns
    "return_on_equity",
    "return_on_assets_fy",
    "return_on_invested_capital_fy",

    // Income Statement
    "total_revenue_ttm",

    // Growth
    "total_revenue_yoy_growth_ttm",
    "earnings_per_share_diluted_yoy_growth_ttm",

    // Debt
    "current_ratio_fq",
    "debt_to_equity_fq",

    // Performance
    "Perf.W",
    "Perf.1M",
    "Perf.3M",
    "Perf.6M",
    "Perf.Y",
    "Perf.5Y",
  ];
}

function validateQuery(searchParams: Record<string, string>) {
  const result: Record<string, string> = {};

  if (searchParams.market_cap_in_billions) {
    const val = searchParams.market_cap_in_billions;
    if (!/^\d+$/.test(val)) throw new Error("Invalid market_cap_in_billions");
    result.market_cap_in_billions = val;
  }

  if (searchParams.limit) {
    const val = searchParams.limit;
    if (!/^\d+$/.test(val)) throw new Error("Invalid limit");
    result.limit = val;
  }

  return result;
}

function getPayloadForRequest({
  marketCapInBillions,
  limit = 500,
}: {
  marketCapInBillions: number;
  limit?: number;
}) {
  const oneBillion = 1000000000;
  return {
    filter: [
      { left: "type", operation: "equal", right: "stock" },
      {
        left: "subtype",
        operation: "in_range",
        right: ["common", "foreign-issuer"],
      },
      { left: "exchange", operation: "equal", right: "NSE" },
      {
        left: "market_cap_basic",
        operation: "egreater",
        right: marketCapInBillions * oneBillion,
      },
      { left: "is_primary", operation: "equal", right: true },
      { left: "active_symbol", operation: "equal", right: true },
    ],
    options: { lang: "en" },
    markets: ["india"],
    symbols: { query: { types: [] }, tickers: [] },
    columns: getFundamentalsColumns(),
    sort: { sortBy: "market_cap_basic", sortOrder: "desc" },
    price_conversion: { to_symbol: false },
    range: [0, limit],
  };
}

function transformToFundamentalsStock(item: any): FundamentalsStock {
  const data = item.d;
  const columns = getFundamentalsColumns();

  // Create a mapping of column name to value
  const values: Record<string, any> = {};
  columns.forEach((col, idx) => {
    values[col] = data[idx];
  });

  const safeNumber = (val: any): number | null => {
    if (val === null || val === undefined || isNaN(val)) return null;
    return Number(val);
  };

  return {
    // Basic Info
    symbol: values["name"] || "",
    name: values["description"] || "",
    price: safeNumber(values["close"]) || 0,
    marketCap: safeNumber(values["market_cap_basic"]) || 0,
    sector: values["sector"] || "",
    industry: values["industry"] || "",

    // Valuation
    epsDilutedTTM: safeNumber(values["earnings_per_share_diluted_ttm"]),
    priceToEarnings: safeNumber(values["price_earnings_ttm"]),
    forwardPriceToEarnings: safeNumber(
      values["non_gaap_price_to_earnings_per_share_forecast_next_fy"]
    ),
    priceToSales: safeNumber(values["price_sales_current"]),
    priceToBook: safeNumber(values["price_book_ratio"]),
    priceToCash: safeNumber(values["price_free_cash_flow_ttm"]),
    pegTTM: safeNumber(values["price_earnings_growth_ttm"]),

    // Margins
    grossMargin: safeNumber(values["gross_margin_fy"]),
    operatingMargin: null, // Not available
    netMargin: safeNumber(values["net_margin_fy"]),

    // Returns
    roce: null, // Not available
    roa: safeNumber(values["return_on_assets_fy"]),
    roe: safeNumber(values["return_on_equity"]),
    roic: safeNumber(values["return_on_invested_capital_fy"]),

    // Income Statement
    revenueTTM: safeNumber(values["total_revenue_ttm"]),
    grossProfitTTM: null, // Not available
    operatingIncomeTTM: null, // Not available
    netIncomeTTM: null, // Not available

    // Balance Sheet
    totalAssets: null, // Not available
    totalLiabilities: null, // Not available
    totalDebt: safeNumber(values["debt_to_equity_fq"]), // Using debt to equity as proxy
    cashOnHand: null, // Not available

    // Growth
    revenueGrowthTTM: safeNumber(values["total_revenue_yoy_growth_ttm"]),
    grossProfitGrowthTTM: null, // Not available
    netIncomeGrowthTTM: safeNumber(values["earnings_per_share_diluted_yoy_growth_ttm"]),

    // Performance
    perf1W: safeNumber(values["Perf.W"]),
    perf1M: safeNumber(values["Perf.1M"]),
    perf3M: safeNumber(values["Perf.3M"]),
    perf6M: safeNumber(values["Perf.6M"]),
    perf1Y: safeNumber(values["Perf.Y"]),
    perf5Y: safeNumber(values["Perf.5Y"]),
  };
}

async function handler(searchParams: Record<string, string>) {
  const parsed = validateQuery(searchParams);

  const marketCapInBillions = parsed.market_cap_in_billions
    ? parseInt(parsed.market_cap_in_billions)
    : DEFAULT_MARKET_CAP_BILLIONS;

  const limitRaw = parsed.limit ? parseInt(parsed.limit) : DEFAULT_LIMIT;
  const limit = Math.min(Math.max(limitRaw, 1), MAX_LIMIT);

  const dataUrl = "https://scanner.tradingview.com/india/scan";
  const dataPayload = getPayloadForRequest({ marketCapInBillions, limit });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(dataUrl, {
      cache: "no-store",
      method: "POST",
      body: JSON.stringify(dataPayload),
      headers: { "content-type": "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`TradingView request failed: ${response.status}`);
    }

    const responseJson = await response.json();
    const dataItems = responseJson.data || [];
    const transformedItems = dataItems.map(transformToFundamentalsStock);

    return transformedItems as FundamentalsStock[];
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: Request) {
  try {
    const parsedUrl = new URL(request.url);
    const searchParams = Object.fromEntries(parsedUrl.searchParams.entries());
    const result = await handler(searchParams);
    return Response.json(result, { status: 200 });
  } catch (err: any) {
    console.error("Fundamentals screener error:", err);
    return Response.json(
      { type: "error", message: err.message },
      { status: 400 }
    );
  }
}
