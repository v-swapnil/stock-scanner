import {
  getChangeGroupTypeToDeltaType,
  getChangePercentageGroup,
  getConsolidatedHighlights,
  getDeltaTypeFromChangePercentage,
  getDiffOfPricesInPercentage,
  getSearchTerms,
  getStockHighlights,
  getStockRangeDetails,
  toFixedIntegerNumber,
  toFixedNumber,
} from "./common";
import { numberToText, textToNumber } from "./number-format";
import {
  TChangeGroupType,
  TIndexDataItems,
  TSectorPriceEarningRatio,
  TStockDataItem,
  TStockDataItems,
  TStockDataMetrics,
} from "./types";

function getColumnAlias(columnId: string) {
  const columns: Record<string, string> = {
    // Basic Details
    "indexes.tr": "indexes",
    logoId: "logoId",
    name: "name",
    description: "description",
    sector: "sector",
    industry: "industry",
    market_cap_basic: "marketCapExact",

    // Price Details
    volume: "volume",
    open: "open",
    high: "high",
    low: "low",
    close: "close",
    change_from_open: "changeFromOpen",

    // Pre Market
    premarket_change: "preMarketChangeExact",
    premarket_volume: "preMarketVolumeExact",

    // Change
    change_abs: "dayChangeAbsoluteExact",
    change: "dayChangeExact",
    "change|1W": "currentWeekChangeExact", // Change within current week
    "change|1M": "currentMonthChangeExact", // Change within current month

    // Performance
    "Perf.W": "weekChangeExact",
    "Perf.1M": "monthChangeExact",
    "Perf.3M": "threeMonthChangeExact",
    "Perf.6M": "sixMonthChangeExact",
    "Perf.Y": "yearChangeExact",
    "Perf.5Y": "fiveYearChangeExact",

    // Funds
    "asset_class.tr": "assetClassType",
    "fund_flows.1M": "monthFundFlowsExact",
    "fund_flows.3M": "threeMonthFundFlowsExact",

    // Average Volume
    average_volume_10d_calc: "tenDayAverageVolumeExact",
    average_volume_30d_calc: "thirtyDayAverageVolumeExact",
    average_volume_90d_calc: "ninetyDayAverageVolumeExact",

    // High / Lows
    "High.6M": "sixMonthHighExact",
    "Low.6M": "sixMonthLowExact",
    price_52_week_high: "oneYearHighExact",
    price_52_week_low: "oneYearLowExact",
    "High.All": "allTimeHighExact",
    "Low.All": "allTimeLowExact",
    "low|1W": "currentWeekLowExact",
    "high|1W": "currentWeekHighExact",
    "low|1M": "currentMonthLowExact",
    "high|1M": "currentMonthHighExact",
    "Low.3M": "threeMonthLowExact",
    "High.3M": "threeMonthHighExact",

    // Moving Averages
    EMA10: "tenDayEMAExact",
    EMA20: "twentyDayEMAExact",
    EMA50: "fiftyDayEMAExact",
    EMA100: "hundredDayEMAExact",
    EMA200: "twoHundredDayEMAExact",
    SMA10: "tenDaySMAExact",
    SMA20: "twentyDaySMAExact",
    SMA50: "fiftyDaySMAExact",
    SMA100: "hundredDaySMAExact",
    SMA200: "twoHundredDaySMAExact",

    // Fundamentals
    price_earnings_ttm: "priceToEarningsExact",
    non_gaap_price_to_earnings_per_share_forecast_next_fy:
      "forwardPriceToEarningsExact",
    price_book_ratio: "priceBookTTMExact",
    dividend_yield_recent: "dividendYieldExact",
    earnings_per_share_basic_ttm: "earningPerShareTTMExact",
    earnings_per_share_diluted_ttm: "earningPerShareDilutedTTMExact",
    return_on_equity: "returnOnEquityExact",
    float_shares_percent_current: "freeFloatSharesPerExact",
    current_ratio_fq: "currentRatioExact",
    debt_to_equity_fq: "debtToEquityRatioExact",
    return_on_invested_capital_fq: "returnOnInvestedCapitalExact",
    price_free_cash_flow_ttm: "priceToFreeCashFlowExact",
    enterprise_value_ebitda_ttm: "enterpriseValueToEBITDAExact", // EV / EBITDA
    price_sales_current: "priceToSalesExact", // Price per Share / Revenue per Share
    gross_margin_fy: "grossMarginPercentageFYExact",
    net_margin_fy: "netMarginPercentageFYExact",
    return_on_equity_fy: "returnOnEquityFYExact",
    return_on_assets_fy: "returnOnAssetsFYExact",
    return_on_invested_capital_fy: "returnOnInvestedCapitalFYExact",
    // Growth
    price_earnings_growth_ttm: "priceEarningGrowthExact",
    total_revenue_yoy_growth_ttm: "totalRevenueGrowthTTMExact",
    earnings_per_share_diluted_yoy_growth_ttm:
      "earningPerShareDilutedTTMGrowthExact",
  };
  return columns[columnId] || columnId;
}

function getDataWithColumnIds(columns: string[], dataItems: any[]) {
  const result: Record<string, any> = {};
  columns.forEach((elem, index) => {
    result[getColumnAlias(elem)] = dataItems[index];
  });
  return result;
}

function getStockDataItemColumns() {
  return [
    "indexes.tr",
    "logoid",
    "name",
    "description",
    "sector",
    "industry",
    "market_cap_basic",
    "float_shares_percent_current",
    "close",
    "change_abs",
    "change",
    "change|1W", // current week
    "change|1M", // current month
    // Performance
    "Perf.W",
    "Perf.1M",
    "Perf.3M",
    "Perf.6M",
    "Perf.Y",
    "Perf.5Y",
    // High / Lows
    "high|1W",
    "low|1W",
    "high|1M",
    "low|1M",
    "High.3M",
    "Low.3M",
    "High.6M",
    "Low.6M",
    "price_52_week_high",
    "price_52_week_low",
    "High.All",
    "Low.All",
    // Average Volume
    "average_volume_10d_calc",
    "average_volume_30d_calc",
    "average_volume_90d_calc",
    // IntraDay Volume, Open, Close, High and Low
    "volume",
    "open",
    "close",
    "high",
    "low",
    "change_from_open",
    // Pre Market
    "premarket_change",
    "premarket_volume",
    // Moving Averages
    "EMA10",
    "EMA20",
    "EMA50",
    "EMA100",
    "EMA200",
    "SMA10",
    "SMA20",
    "SMA50",
    "SMA100",
    "SMA200",
    // Fundamentals
    "price_earnings_ttm",
    "price_earnings_growth_ttm",
    "price_book_ratio", // price_book_fq
    "earnings_per_share_basic_ttm",
    "earnings_per_share_diluted_ttm",
    "earnings_per_share_diluted_yoy_growth_ttm",
    "earnings_per_share_forecast_next_fq",
    "dividend_yield_recent", // dividends_yield_current
    "total_revenue_ttm",
    "total_revenue_yoy_growth_ttm",
    "return_on_equity", // return_on_equity_fq
    "current_ratio_fq",
    "debt_to_equity_fq",
    "non_gaap_price_to_earnings_per_share_forecast_next_fy",
    "return_on_invested_capital_fq",
    "price_free_cash_flow_ttm",
    "enterprise_value_ebitda_ttm",
    // Rations
    "price_sales_current",
    "gross_margin_fy",
    "net_margin_fy",
    "return_on_equity_fy",
    "return_on_assets_fy",
    "return_on_invested_capital_fy",
  ];
}

export function getPayloadForRequest({
  marketCapInBillions,
  limit = 1000,
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
    columns: getStockDataItemColumns(),
    sort: { sortBy: "market_cap_basic", sortOrder: "desc" },
    price_conversion: { to_symbol: false },
    range: [0, limit],
  };
}

export function getFormattedDataItems(dataItems: Array<any>) {
  const dataItemColumns = getStockDataItemColumns();
  const formattedDataItems = dataItems
    .map((item) => getDataWithColumnIds(dataItemColumns, item.d))
    .map((item) => ({
      ...item,
      indexes: item.indexes || [],
      lowParsed: toFixedNumber(item.low),
      highParsed: toFixedNumber(item.high),
      volume: numberToText(item.volume),
      volumeExact: item.volume,
      volumeDelta: item.tenDayAverageVolumeExact - item.volume,
      currentPrice: toFixedNumber(item.close),
      currentPriceExact: item.close,
      dayChangeAbsolute: toFixedNumber(item.dayChangeAbsoluteExact),
      dayChange: toFixedNumber(item.dayChangeExact),
      currentWeekChange: toFixedNumber(item.currentWeekChangeExact),
      currentMonthChange: toFixedNumber(item.currentMonthChangeExact),
      weekChange: toFixedNumber(item.weekChangeExact),
      monthChange: toFixedNumber(item.monthChangeExact),
      threeMonthChange: toFixedNumber(item.threeMonthChangeExact),
      sixMonthChange: toFixedNumber(item.sixMonthChangeExact),
      yearChange: toFixedNumber(item.yearChangeExact),
      fiveYearChange: toFixedNumber(item.fiveYearChangeExact),
      marketCap: numberToText(item.marketCapExact),
      marketCapInBillions: item.marketCapExact / 1000000000,
      sixMonthHigh: toFixedNumber(item.sixMonthHighExact),
      sixMonthLow: toFixedNumber(item.sixMonthLowExact),
      oneYearHigh: toFixedNumber(item.oneYearHighExact),
      oneYearLow: toFixedNumber(item.oneYearLowExact),
      allTimeHigh: toFixedNumber(item.allTimeHighExact),
      allTimeLow: toFixedNumber(item.allTimeLowExact),
      tenDayAverageVolume: numberToText(item.tenDayAverageVolumeExact),
      thirtyDayAverageVolume: numberToText(item.thirtyDayAverageVolumeExact),
      ninetyDayAverageVolume: numberToText(item.ninetyDayAverageVolumeExact),
      preMarketChange: toFixedNumber(item.preMarketChangeExact),
      preMarketVolume: numberToText(item.preMarketVolumeExact),
      tenDayEMA: toFixedNumber(item.tenDayEMAExact),
      twentyDayEMA: toFixedNumber(item.twentyDayEMAExact),
      fiftyDayEMA: toFixedNumber(item.fiftyDayEMAExact),
      hundredDayEMA: toFixedNumber(item.hundredDayEMAExact),
      twoHundredDayEMA: toFixedNumber(item.twoHundredDayEMAExact),
      fiftyDayEMADiff: getDiffOfPricesInPercentage(
        item.close,
        item.fiftyDayEMAExact,
        1
      ),
      hundredDayEMADiff: getDiffOfPricesInPercentage(
        item.close,
        item.hundredDayEMAExact,
        1
      ),
      twoHundredDayEMADiff: getDiffOfPricesInPercentage(
        item.close,
        item.twoHundredDayEMAExact,
        1
      ),
      tenDaySMA: toFixedNumber(item.tenDaySMAExact),
      twentyDaySMA: toFixedNumber(item.twentyDaySMAExact),
      fiftyDaySMA: toFixedNumber(item.fiftyDaySMAExact),
      hundredDaySMA: toFixedNumber(item.hundredDaySMAExact),
      twoHundredDaySMA: toFixedNumber(item.twoHundredDaySMAExact),
      fiftyDaySMADiff: getDiffOfPricesInPercentage(
        item.close,
        item.fiftyDaySMAExact,
        1
      ),
      hundredDaySMADiff: getDiffOfPricesInPercentage(
        item.close,
        item.hundredDaySMAExact,
        1
      ),
      twoHundredDaySMADiff: getDiffOfPricesInPercentage(
        item.close,
        item.twoHundredDaySMAExact,
        1
      ),
      priceEarningTTM: toFixedNumber(item.priceToEarningsExact),
      forwardPriceEarning: toFixedNumber(item.forwardPriceToEarningsExact),
      priceEarningDiff: toFixedNumber(
        item.forwardPriceToEarningsExact - item.priceToEarningsExact
      ),
      priceEarningDiffExact:
        item.forwardPriceToEarningsExact - item.priceToEarningsExact,
      priceBookTTM: toFixedNumber(item.priceBookTTMExact),
      priceToSales: toFixedNumber(item.priceToSalesExact),
      dividendYield: toFixedNumber(item.dividendYieldExact),
      priceEarningGrowth: toFixedNumber(item.priceEarningGrowthExact),
      earningPerShareDilutedTTM: toFixedNumber(
        item.earningPerShareDilutedTTMExact
      ),
      earningPerShareDilutedTTMPerExact: item.earningPerShareDilutedTTMExact
        ? item.earningPerShareDilutedTTMExact / item.close
        : 0,
      earningPerShareDilutedTTMPer: item.earningPerShareDilutedTTMExact
        ? toFixedNumber(
            (item.earningPerShareDilutedTTMExact / item.close) * 100
          )
        : "",
      earningPerShareDilutedTTMGrowth: toFixedNumber(
        item.earningPerShareDilutedTTMGrowthExact
      ),
      totalRevenueGrowthTTM: toFixedNumber(item.totalRevenueGrowthTTMExact),
      returnOnEquity: toFixedNumber(item.returnOnEquityExact),
      freeFloatSharesPer: toFixedNumber(item.freeFloatSharesPerExact),
      currentRatio: toFixedNumber(item.currentRatioExact),
      debtToEquityRatio: toFixedNumber(item.debtToEquityRatioExact),
      priceToFreeCashFlow: toFixedNumber(item.priceToFreeCashFlowExact),
      enterpriseValueToEBITDA: toFixedNumber(item.enterpriseValueToEBITDAExact),
    }));
  return formattedDataItems;
}

export function addStockInsights(stockDetails: TStockDataItem) {
  const metrics = {
    mCapType:
      stockDetails.marketCapInBillions > 1000
        ? "Large"
        : stockDetails.marketCapInBillions > 500
        ? "Mid"
        : "Small",
    upFromSixMonthLow: "0",
    upFromSixMonthLowExact: 0,
    downFromSixMonthHigh: "0",
    downFromSixMonthHighExact: 0,
    upFromOneYearLow: "0",
    upFromOneYearLowExact: 0,
    downFromOneYearHigh: "0",
    downFromOneYearHighExact: 0,
    highlightRed: false,
    highlight: false,
    volumeIncreasedBy: 0,
    volumeDecreasedBy: 0,
    volumeChangedBy: 0,
    preMarketChangeType: getChangePercentageGroup(stockDetails.preMarketChange),
    dayChangeType: getChangePercentageGroup(stockDetails.dayChange),
    weekChangeType: getChangePercentageGroup(stockDetails.weekChange),
    monthChangeType: getChangePercentageGroup(stockDetails.monthChange),
    currentWeekChangeType: getChangePercentageGroup(
      stockDetails.currentWeekChange
    ),
    threeMonthChangeType: getChangePercentageGroup(
      stockDetails.threeMonthChange
    ),
    sixMonthChangeType: getChangePercentageGroup(stockDetails.sixMonthChange),
    currentMonthChangeType: getChangePercentageGroup(
      stockDetails.currentMonthChange
    ),
    highlights: getStockHighlights(stockDetails),
    upFromDayLow: "",
    upFromDayLowExact: 0,
    downFromDayHigh: "",
    downFromDayHighExact: 0,
    upFromCurrentWeekLow: "",
    upFromCurrentWeekLowExact: 0,
    downFromCurrentWeekHigh: "",
    downFromCurrentWeekHighExact: 0,
    upFromCurrentMonthLow: "",
    upFromCurrentMonthLowExact: 0,
    downFromCurrentMonthHigh: "",
    downFromCurrentMonthHighExact: 0,
    upFromThreeMonthLow: "",
    upFromThreeMonthLowExact: 0,
    downFromThreeMonthHigh: "",
    downFromThreeMonthHighExact: 0,
    currentDayRangeValueInPercent: 0,
  };
  const currentPrice = stockDetails.currentPriceExact;
  if (stockDetails.low && stockDetails.high) {
    const upFromDayLow =
      ((currentPrice - stockDetails.low) / stockDetails.low) * 100;
    const downFromHigh =
      ((stockDetails.high - currentPrice) / stockDetails.high) * 100;
    metrics.upFromDayLowExact = upFromDayLow;
    metrics.downFromDayHighExact = downFromHigh;
    metrics.upFromDayLow = toFixedNumber(upFromDayLow);
    metrics.downFromDayHigh = toFixedNumber(downFromHigh);
  }
  const sixMonthHigh = stockDetails.sixMonthHighExact;
  const sixMonthLow = stockDetails.sixMonthLowExact;
  if (currentPrice < sixMonthHigh && currentPrice > sixMonthLow) {
    const upFromLow = ((currentPrice - sixMonthLow) / sixMonthLow) * 100;
    const downFromHigh = ((sixMonthHigh - currentPrice) / sixMonthHigh) * 100;
    metrics.upFromSixMonthLow = toFixedNumber(upFromLow);
    metrics.upFromSixMonthLowExact = upFromLow;
    metrics.downFromSixMonthHigh = toFixedNumber(downFromHigh);
    metrics.downFromSixMonthHighExact = downFromHigh;
    metrics.highlightRed =
      currentPrice <= sixMonthHigh - (sixMonthHigh - sixMonthLow) * 0.75;
    metrics.highlight =
      currentPrice <= sixMonthHigh - (sixMonthHigh - sixMonthLow) * 0.5;
  }
  const oneYearHigh = stockDetails.oneYearHighExact;
  const oneYearLow = stockDetails.oneYearLowExact;
  if (currentPrice < oneYearHigh && currentPrice > oneYearLow) {
    const upFromLow = ((currentPrice - oneYearLow) / oneYearLow) * 100;
    const downFromHigh = ((oneYearHigh - currentPrice) / oneYearHigh) * 100;
    metrics.upFromOneYearLow = toFixedNumber(upFromLow);
    metrics.upFromOneYearLowExact = upFromLow;
    metrics.downFromOneYearHigh = toFixedNumber(downFromHigh);
    metrics.downFromOneYearHighExact = downFromHigh;
  }

  // TODO: DO BETTER
  const { upFromLow, downFromHigh } = getStockRangeDetails(
    currentPrice,
    stockDetails.currentWeekLowExact,
    stockDetails.currentWeekHighExact
  );
  metrics.upFromCurrentWeekLow = toFixedNumber(upFromLow);
  metrics.upFromCurrentWeekLowExact = upFromLow;
  metrics.downFromCurrentWeekHigh = toFixedNumber(downFromHigh);
  metrics.downFromCurrentWeekHighExact = downFromHigh;

  // TODO: DO BETTER
  const { upFromLow: upFromMLow, downFromHigh: downFromMHigh } =
    getStockRangeDetails(
      currentPrice,
      stockDetails.currentMonthLowExact,
      stockDetails.currentMonthHighExact
    );
  metrics.upFromCurrentMonthLow = toFixedNumber(upFromMLow);
  metrics.upFromCurrentMonthLowExact = upFromMLow;
  metrics.downFromCurrentMonthHigh = toFixedNumber(downFromMHigh);
  metrics.downFromCurrentMonthHighExact = downFromMHigh;

  // TODO: DO BETTER
  const { upFromLow: upFrom3MLow, downFromHigh: downFrom3MHigh } =
    getStockRangeDetails(
      currentPrice,
      stockDetails.threeMonthLowExact,
      stockDetails.threeMonthHighExact
    );
  metrics.upFromThreeMonthLow = toFixedNumber(upFrom3MLow);
  metrics.upFromThreeMonthLowExact = upFrom3MLow;
  metrics.downFromThreeMonthHigh = toFixedNumber(downFrom3MHigh);
  metrics.downFromThreeMonthHighExact = downFrom3MHigh;

  const volume = stockDetails.volumeExact;
  const tenDayAverageVolume = stockDetails.tenDayAverageVolumeExact;
  if (volume > tenDayAverageVolume) {
    const delta = (volume - tenDayAverageVolume) / tenDayAverageVolume;
    if (delta > 0.25) {
      metrics.volumeIncreasedBy = toFixedIntegerNumber(delta * 100);
      metrics.volumeChangedBy = metrics.volumeIncreasedBy;
    }
  } else if (volume < tenDayAverageVolume) {
    const delta = (tenDayAverageVolume - volume) / tenDayAverageVolume;
    if (delta > 0.25) {
      metrics.volumeDecreasedBy = toFixedIntegerNumber(delta * 100);
      metrics.volumeChangedBy = -metrics.volumeDecreasedBy;
    }
  }

  metrics.currentDayRangeValueInPercent =
    ((stockDetails.currentPriceExact - stockDetails.low) /
      (stockDetails.high - stockDetails.low)) *
    100;

  return {
    ...stockDetails,
    ...metrics,
    dayChangeDeltaType: getChangeGroupTypeToDeltaType(metrics.dayChangeType),
    preMarketChangeDeltaType: getChangeGroupTypeToDeltaType(
      metrics.preMarketChangeType
    ),
    weekChangeDeltaType: getChangeGroupTypeToDeltaType(metrics.weekChangeType),
    monthChangeDeltaType: getChangeGroupTypeToDeltaType(
      metrics.monthChangeType
    ),
    threeMonthChangeDeltaType: getDeltaTypeFromChangePercentage(
      stockDetails.threeMonthChange
    ),
    sixMonthChangeDeltaType: getDeltaTypeFromChangePercentage(
      stockDetails.sixMonthChange
    ),
    yearChangeDeltaType: getDeltaTypeFromChangePercentage(
      stockDetails.yearChange
    ),
    fiveYearChangeDeltaType: getDeltaTypeFromChangePercentage(
      stockDetails.fiveYearChange
    ),
    consolidatedHighlights: getConsolidatedHighlights(metrics.highlights),
    searchTerms: getSearchTerms(stockDetails),
  };
}

export function getMetricsFromStockData(stocksDataItems: TStockDataItems) {
  const changeInsights: Record<TChangeGroupType, Array<number>> = {
    "Crazy Selling": [0, 0, 0, 0, 0],
    "Heavy Selling": [0, 0, 0, 0, 0],
    "Moderate Selling": [0, 0, 0, 0, 0],
    Neutral: [0, 0, 0, 0, 0],
    "Moderate Buying": [0, 0, 0, 0, 0],
    "Heavy Buying": [0, 0, 0, 0, 0],
    "Crazy Buying": [0, 0, 0, 0, 0],
  };
  const priceEarningBySector: Record<string, TSectorPriceEarningRatio> = {};

  stocksDataItems.forEach((item) => {
    // Current Day
    if (item.dayChangeType) {
      changeInsights[item.dayChangeType][0] += 1;
    }
    // Current Week
    if (item.currentWeekChangeType) {
      changeInsights[item.currentWeekChangeType][1] += 1;
    }
    // Current Month
    if (item.currentMonthChangeType) {
      changeInsights[item.currentMonthChangeType][2] += 1;
    }
    if (item.threeMonthChangeType) {
      changeInsights[item.threeMonthChangeType][3] += 1;
    }
    if (item.sixMonthChangeType) {
      changeInsights[item.sixMonthChangeType][4] += 1;
    }
    // Price Earning Ratios
    if (item.industry && item.priceEarningTTM) {
      if (!priceEarningBySector[item.industry]) {
        priceEarningBySector[item.industry] = {
          industry: item.industry,
          sector: item.sector,
          stocks: [],
          priceEarningRatios: [],
          average: 0,
        };
      }
      priceEarningBySector[item.industry].stocks.push(item.name);
      priceEarningBySector[item.industry].priceEarningRatios.push(
        item.priceToEarningsExact
      );
    }
  });
  const keyNames = Object.keys(changeInsights);
  const colors = [
    "red",
    "orange",
    "amber",
    "yellow",
    "lime",
    "green",
    "emerald",
  ];
  const sectors = Object.keys(priceEarningBySector);
  sectors.forEach((key) => {
    priceEarningBySector[key].average = toFixedNumber(
      priceEarningBySector[key].priceEarningRatios.reduce((a, v) => a + v, 0) /
        priceEarningBySector[key].priceEarningRatios.length
    );
  });

  return {
    changeInsights: keyNames.map((item, index) => ({
      name: item,
      value: changeInsights[item as TChangeGroupType][0],
      color: colors[index],
    })),
    weekChangeInsights: keyNames.map((item, index) => ({
      name: item,
      value: changeInsights[item as TChangeGroupType][1],
      color: colors[index],
    })),
    monthChangeInsights: keyNames.map((item, index) => ({
      name: item,
      value: changeInsights[item as TChangeGroupType][2],
      color: colors[index],
    })),
    threeMonthChangeInsights: keyNames.map((item, index) => ({
      name: item,
      value: changeInsights[item as TChangeGroupType][3],
      color: colors[index],
    })),
    sixMonthChangeInsights: keyNames.map((item, index) => ({
      name: item,
      value: changeInsights[item as TChangeGroupType][4],
      color: colors[index],
    })),
    priceEarningBySector: priceEarningBySector,
  } as TStockDataMetrics;
}

function getETFDataItemColumns() {
  return [
    "name",
    "description",
    "logoid",
    "update_mode",
    "type",
    "typespecs",
    "close",
    "pricescale",
    "minmov",
    "fractional",
    "minmove2",
    "currency",
    "change",
    "Value.Traded",
    "relative_volume_10d_calc",
    "aum",
    "fundamental_currency_code",
    "nav_total_return.5Y",
    "expense_ratio",
    "asset_class.tr",
    "focus.tr",
    "holds_derivatives_flag.tr",
    "weight_top_10",
    "currency_hedged_flag.tr",
    "index_provider.tr",
    "transparent_holding_flag.tr",
    "nav",
    "fund_flows.1M",
    "fund_flows.3M",
    "BBPower",
    "average_volume_10d_calc",
    "average_volume_30d_calc",
    "average_volume_90d_calc",
    "nav_discount_premium",
    "Perf.W",
    "Perf.1M",
    "Perf.3M",
    "Perf.6M",
    "Perf.Y",
    "category.tr",
    "strategy.tr",
    "exchange",
  ];
}

export function getPayloadForETFRequest() {
  return {
    columns: getETFDataItemColumns(),
    filter: [
      { left: "type", operation: "equal", right: "fund" },
      { left: "typespecs", operation: "has", right: ["etf"] },
      { left: "exchange", operation: "in_range", right: ["NSE"] },
    ],
    ignore_unknown_fields: false,
    options: { lang: "en" },
    range: [0, 500],
    sort: { sortBy: "aum", sortOrder: "desc" },
    symbols: {},
    markets: ["india"],
  };
}

export function getFormattedETFDataItems(dataItems: Array<any>) {
  const dataItemColumns = getETFDataItemColumns();
  const formattedDataItems = dataItems
    .map((item) => getDataWithColumnIds(dataItemColumns, item.d))
    .map((item) => ({
      ...item,
      currentPrice: toFixedNumber(item.currentPriceExact),
      dayChange: toFixedNumber(item.dayChangeExact),
      dayChangeDeltaType: getDeltaTypeFromChangePercentage(item.dayChangeExact),
      weekChange: toFixedNumber(item.weekChangeExact),
      weekChangeDeltaType: getDeltaTypeFromChangePercentage(
        item.weekChangeExact
      ),
      monthChange: toFixedNumber(item.monthChangeExact),
      monthChangeDeltaType: getDeltaTypeFromChangePercentage(
        item.monthChangeExact
      ),
      threeMonthChange: toFixedNumber(item.threeMonthChangeExact),
      threeMonthChangeDeltaType: getDeltaTypeFromChangePercentage(
        item.threeMonthChangeExact
      ),
      assetsUnderManagementExact: item.aum,
      assetsUnderManagement: numberToText(item.aum),
      expenseRatioExact: item.expense_ratio,
      expenseRatio: toFixedNumber(item.expense_ratio),
      monthFundFlows: numberToText(item.monthFundFlowsExact),
      threeMonthFundFlows: numberToText(item.threeMonthFundFlowsExact),
    }));
  return formattedDataItems;
}

export function getIndexNameMappings() {
  return {
    "NIFTY 50": "Nifty 50",
    "NIFTY BANK": "Nifty Bank",
    "NIFTY MID SELECT": "Nifty MidCap",
    "NIFTY FIN SERVICE": "Nifty Finance",
    "NIFTY NEXT 50": "Nifty Next 50",
    "NIFTY IT": "Nifty IT",
    "NIFTY AUTO": "Nifty Auto",
    "NIFTY PHARMA": "Nifty Pharma",
    "NIFTY REALTY": "Nifty Realty",
    "NIFTY MIDCAP 150": "Nifty MidCap 150",
    "NIFTY SMLCAP 250": "Nifty SmallCap 250",
    "NIFTY TOTAL MARKET": "Nifty Total Market",
    "NIFTY MICROCAP250": "Nifty MicroCap 250",
    "NIFTY 500": "Nifty 500",
    "NIFTY TOTAL MKT": "Nifty Total Market",
    "NIFTY FMCG": "Nifty FMCG",
    "NIFTY METAL": "Nifty Metal",
    "NIFTY CONSUMPTION": "Nifty Consumption",
  };
}

export function getIndexChangeDeltaType(percentageChange: number) {
  if (percentageChange <= -1) {
    return "decrease";
  } else if (percentageChange <= -0.25 && percentageChange > -1) {
    return "moderateDecrease";
  } else if (percentageChange > -0.25 && percentageChange < 0.25) {
    return "unchanged";
  } else if (percentageChange >= 0.25 && percentageChange < 1) {
    return "moderateIncrease";
  } else if (percentageChange >= 1) {
    return "increase";
  }
}

export function getFormattedIndices(indexDataItems: Array<any>) {
  const indexNameMappings: Record<string, string> = getIndexNameMappings();
  const formattedIndices = indexDataItems
    .map((item) => ({
      dateTime: item.timeVal,
      indexType: item.indexType,
      indexName: indexNameMappings[item.indexName] || item.indexName,
      previousClose: item.previousClose,
      previousCloseExact: textToNumber(item.previousClose),
      open: item.open,
      openExact: textToNumber(item.open),
      last: item.last,
      lastExact: textToNumber(item.last),
      low: item.low,
      lowExact: textToNumber(item.low),
      high: item.high,
      highExact: textToNumber(item.high),
      percentageChange: parseFloat(item.percChange),
    }))
    .map((item) => ({
      ...item,
      deltaType: getIndexChangeDeltaType(item.percentageChange),
      pointChange: parseFloat(
        (item.lastExact - item.previousCloseExact).toFixed(2)
      ),
      pointUpFromLow: parseFloat((item.lastExact - item.lowExact).toFixed(2)),
      pointDownFromHigh: parseFloat(
        (item.highExact - item.lastExact).toFixed(2)
      ),
    }));
  return formattedIndices as TIndexDataItems;
}

export function getPayloadForOptionsRequest(symbol: string) {
  return {
    columns: [
      "ask",
      "bid",
      "delta",
      "expiration",
      "gamma",
      "iv",
      "name",
      "option-type",
      "rho",
      "root",
      "strike",
      "theoPrice",
      "theta",
      "vega",
    ],
    filter: [{ left: "type", operation: "equal", right: "option" }],
    ignore_unknown_fields: false,
    index_filters: [{ name: "underlying_symbol", values: ["NSE:" + symbol] }],
  };
}

export function getGoodStocks(stockSataItems: TStockDataItems) {
  return stockSataItems.filter((item) =>
    Boolean(
      item.priceToEarningsExact &&
        item.priceEarningGrowthExact &&
        item.priceToFreeCashFlowExact &&
        item.enterpriseValueToEBITDAExact &&
        item.priceToEarningsExact < 24 &&
        item.priceEarningGrowthExact < 1 &&
        item.priceToFreeCashFlowExact < 10 &&
        item.enterpriseValueToEBITDAExact < 10
    )
  );
}
