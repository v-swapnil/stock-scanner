import {
  getChangeGroupTypeToDeltaType,
  getChangePercentageGroup,
  getConsolidatedHighlights,
  getDeltaTypeFromChangePercentage,
  getDiffOfPricesInPercentage,
  getSearchTerms,
  getStockHighlights,
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
    price_earnings_ttm: "priceEarningTTMExact",
    non_gaap_price_to_earnings_per_share_forecast_next_fy:
      "forwardPriceEarningExact",
    price_book_ratio: "priceBookTTMExact",
    price_earnings_growth_ttm: "priceEarningGrowthExact",
    dividend_yield_recent: "dividendYieldExact",
    earnings_per_share_basic_ttm: "earningPerShareTTMExact",
    earnings_per_share_diluted_ttm: "earningPerShareDilutedTTMExact",
    earnings_per_share_diluted_yoy_growth_ttm:
      "earningPerShareDilutedTTMGrowthExact",
    total_revenue_yoy_growth_ttm: "totalRevenueGrowthTTMExact",
    return_on_equity: "returnOnEquityExact",
    float_shares_percent_current: "freeFloatSharesPerExact",
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
    "name",
    "description",
    "industry", // "sector",
    "close",
    "change_abs",
    "change",
    "change|1W",
    "change|1M",
    "Perf.3M",
    "Perf.6M",
    "Perf.Y",
    "Perf.5Y",
    "market_cap_basic",
    // High / Lows
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
    "price_book_ratio",
    "earnings_per_share_basic_ttm",
    "dividend_yield_recent",
    "sector",
    "price_earnings_growth_ttm",
    "earnings_per_share_diluted_ttm",
    "earnings_per_share_diluted_yoy_growth_ttm",
    "total_revenue_yoy_growth_ttm",
    "return_on_equity",
    "float_shares_percent_current",
    "logoid",
    "non_gaap_price_to_earnings_per_share_forecast_next_fy",
    "Perf.W",
    "Perf.1M",
  ];
}

export function getPayloadForRequest(marketCapInBillions: number) {
  const availableColumns = [
    "logoId",
    "submarket",
    "Perf.3M",
    "Perf.5Y",
    "Perf.6M",
    "Perf.All",
    "change",
    "change_abs",
    "change.1M",
    "change.1W",
    "market_cap_basic",
    "premarket_change",
    "premarket_volume",
    "close",
    "sector",
    "volume",
    "Value.Traded",
    "Perf.Y",
    "Perf.YTD",
    "High.1M",
    "Low.1M",
    "beta_1_year",
    "High.3M",
    "Low.3M",
    "High.6M",
    "Low.6M",
    "price_52_week_high",
    "price_52_week_low",
    "High.All",
    "Low.All",
    "Aroon.Down",
    "Aroon.Up",
    "ADR",
    "ADX",
    "ATR",
    "average_volume_10d_calc",
    "average_volume_30d_calc",
    "average_volume_60d_calc",
    "average_volume_90d_calc",
    "AO",
    "basic_eps_net_income",
    "earnings_per_share_basic_ttm",
    "BB.lower",
    "BB.upper",
    "BBPower",
    "cash_n_short_term_invest_fy",
    "cash_n_short_term_invest_fq",
    "cash_n_equivalents_fy",
    "cash_n_equivalents_fq",
    "ChaikinMoneyFlow",
    "change.60",
    "change_abs.60",
    "change.1",
    "change_abs.1",
    "change_abs.1M",
    "change_abs.1W",
    "change.240",
    "change_abs.240",
    "change.5",
    "change_abs.5",
    "change.15",
    "change_abs.15",
    "change_from_open",
    "change_from_open_abs",
    "CCI20",
    "country",
    "current_ratio",
    "debt_to_equity",
    "dividends_paid",
    "dps_common_stock_prim_issue_yoy_growth_fy",
    "dps_common_stock_prim_issue_fy",
    "dividends_per_share_fq",
    "dividend_yield_recent",
    "DonchCh20.Lower",
    "DonchCh20.Upper",
    "ebitda_yoy_growth_fy",
    "ebitda_qoq_growth_fq",
    "ebitda_yoy_growth_fq",
    "ebitda",
    "ebitda_yoy_growth_ttm",
    "enterprise_value_ebitda_ttm",
    "enterprise_value_fq",
    "earnings_per_share_diluted_yoy_growth_fy",
    "last_annual_eps",
    "earnings_per_share_fq",
    "earnings_per_share_diluted_qoq_growth_fq",
    "earnings_per_share_diluted_yoy_growth_fq",
    "earnings_per_share_diluted_ttm",
    "earnings_per_share_diluted_yoy_growth_ttm",
    "earnings_per_share_forecast_next_fq",
    "exchange",
    "EMA5",
    "EMA10",
    "EMA20",
    "EMA30",
    "EMA50",
    "EMA100",
    "EMA200",
    "free_cash_flow_yoy_growth_fy",
    "free_cash_flow_margin_fy",
    "free_cash_flow_margin_ttm",
    "free_cash_flow_qoq_growth_fq",
    "free_cash_flow_yoy_growth_fq",
    "free_cash_flow_yoy_growth_ttm",
    "gap",
    "goodwill",
    "gross_profit_margin_fy",
    "gross_margin",
    "gross_profit_yoy_growth_fy",
    "gross_profit",
    "gross_profit_fq",
    "gross_profit_qoq_growth_fq",
    "gross_profit_yoy_growth_fq",
    "gross_profit_yoy_growth_ttm",
    "high",
    "HullMA9",
    "Ichimoku.BLine",
    "Ichimoku.CLine",
    "Ichimoku.Lead1",
    "Ichimoku.Lead2",
    "industry",
    "KltChnl.lower",
    "KltChnl.upper",
    "last_annual_revenue",
    "low",
    "MACD.macd",
    "MACD.signal",
    "Mom",
    "MoneyFlow",
    "Perf.1M",
    "Recommend.MA",
    "ADX-DI",
    "net_debt",
    "net_income_yoy_growth_fy",
    "net_income",
    "net_income_qoq_growth_fq",
    "net_income_yoy_growth_fq",
    "net_income_yoy_growth_ttm",
    "net_income_bef_disc_oper_margin_fy",
    "after_tax_margin",
    "number_of_employees",
    "number_of_shareholders",
    "open",
    "oper_income_margin_fy",
    "operating_margin",
    "Recommend.Other",
    "P.SAR",
    "candlestick",
    "Pivot.M.Camarilla.Middle",
    "Pivot.M.Camarilla.R1",
    "Pivot.M.Camarilla.R2",
    "Pivot.M.Camarilla.R3",
    "Pivot.M.Camarilla.S1",
    "Pivot.M.Camarilla.S2",
    "Pivot.M.Camarilla.S3",
    "Pivot.M.Classic.Middle",
    "Pivot.M.Classic.R1",
    "Pivot.M.Classic.R2",
    "Pivot.M.Classic.R3",
    "Pivot.M.Classic.S1",
    "Pivot.M.Classic.S2",
    "Pivot.M.Classic.S3",
    "Pivot.M.Demark.Middle",
    "Pivot.M.Demark.R1",
    "Pivot.M.Demark.S1",
    "Pivot.M.Fibonacci.Middle",
    "Pivot.M.Fibonacci.R1",
    "Pivot.M.Fibonacci.R2",
    "Pivot.M.Fibonacci.R3",
    "Pivot.M.Fibonacci.S1",
    "Pivot.M.Fibonacci.S2",
    "Pivot.M.Fibonacci.S3",
    "Pivot.M.Woodie.Middle",
    "Pivot.M.Woodie.R1",
    "Pivot.M.Woodie.R2",
    "Pivot.M.Woodie.R3",
    "Pivot.M.Woodie.S1",
    "Pivot.M.Woodie.S2",
    "Pivot.M.Woodie.S3",
    "ADX+DI",
    "postmarket_change",
    "postmarket_change_abs",
    "postmarket_close",
    "postmarket_high",
    "postmarket_low",
    "postmarket_open",
    "postmarket_volume",
    "premarket_change_abs",
    "premarket_change_from_open",
    "premarket_change_from_open_abs",
    "premarket_close",
    "premarket_gap",
    "premarket_high",
    "premarket_low",
    "premarket_open",
    "pre_tax_margin",
    "price_book_ratio",
    "price_book_fq",
    "price_earnings_ttm",
    "price_free_cash_flow_ttm",
    "price_revenue_ttm",
    "price_sales_ratio",
    "quick_ratio",
    "ROC",
    "earnings_release_date",
    "RSI7",
    "RSI",
    "relative_volume_10d_calc",
    "relative_volume_intraday.5",
    "research_and_dev_ratio_fy",
    "research_and_dev_ratio_ttm",
    "return_on_assets",
    "return_on_equity",
    "return_on_invested_capital",
    "total_revenue_yoy_growth_fy",
    "revenue_per_employee",
    "total_revenue_qoq_growth_fq",
    "total_revenue_yoy_growth_fq",
    "total_revenue_yoy_growth_ttm",
    "sell_gen_admin_exp_other_ratio_fy",
    "sell_gen_admin_exp_other_ratio_ttm",
    "float_shares_outstanding",
    "float_shares_percent_current",
    "SMA5",
    "SMA10",
    "SMA20",
    "SMA30",
    "SMA50",
    "SMA100",
    "SMA200",
    "Stoch.D",
    "Stoch.K",
    "Stoch.RSI.K",
    "Stoch.RSI.D",
    "Recommend.All",
    "total_assets_yoy_growth_fy",
    "total_assets",
    "total_assets_qoq_growth_fq",
    "total_assets_yoy_growth_fq",
    "total_current_assets",
    "total_debt_yoy_growth_fy",
    "total_debt",
    "total_debt_qoq_growth_fq",
    "total_debt_yoy_growth_fq",
    "total_liabilities_fy",
    "total_liabilities_fq",
    "total_revenue",
    "total_shares_outstanding_fundamental",
    "UO",
    "earnings_release_next_date",
    "Volatility.D",
    "Volatility.M",
    "Volatility.W",
    "VWAP",
    "VWMA",
    "Perf.W",
    "W.R",
  ];
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
    range: [0, 1000],
  };
}

export function getFormattedDataItems(dataItems: Array<any>) {
  if (false) {
    const dataItemColumns = getStockDataItemColumns();
    const formattedDataItems = dataItems
      .map((item) => getDataWithColumnIds(dataItemColumns, item.d))
      .map((item) => ({
        ...item,
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
        priceEarningTTM: toFixedNumber(item.priceEarningTTMExact),
        forwardPriceEarning: item.priceEarningTTMExact
          ? toFixedNumber(item.forwardPriceEarningExact)
          : "",
        priceEarningDiff: toFixedNumber(
          item.forwardPriceEarningExact - item.priceEarningTTMExact
        ),
        priceEarningDiffExact:
          item.forwardPriceEarningExact - item.priceEarningTTMExact,
        priceBookTTM: toFixedNumber(item.priceBookTTMExact),
        dividendYield: toFixedNumber(item.dividendYieldExact),
        priceEarningGrowth: toFixedNumber(item.priceEarningGrowthExact),
        earningPerShareDilutedTTM: toFixedNumber(
          item.earningPerShareDilutedTTMExact
        ),
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
      }));
    return formattedDataItems;
  }
  const formattedDataItems = dataItems.map((item) => ({
    logoId: item.d[51],
    name: item.d[0],
    description: item.d[1],
    sector: item.d[44],
    industry: item.d[2],
    currentPrice: toFixedNumber(item.d[3]),
    currentPriceExact: item.d[3],
    dayChangeAbs: toFixedNumber(item.d[4]),
    dayChange: toFixedNumber(item.d[5]),
    dayChangeExact: item.d[5],
    weekChange: toFixedNumber(item.d[6]),
    weekChangeExact: item.d[6],
    monthChange: toFixedNumber(item.d[7]),
    monthChangeExact: item.d[7],
    threeMonthChange: toFixedNumber(item.d[8]),
    threeMonthChangeExact: item.d[8],
    sixMonthChange: toFixedNumber(item.d[9]),
    sixMonthChangeExact: item.d[9],
    yearChange: toFixedNumber(item.d[10]),
    yearChangeExact: item.d[10],
    fiveYearChange: toFixedNumber(item.d[11]),
    fiveYearChangeExact: item.d[11],
    marketCap: numberToText(item.d[12]),
    marketCapExact: item.d[12],
    marketCapInBillions: item.d[12] / 1000000000,
    dayChangeType: null,
    weekChangeType: null,
    monthChangeType: null,
    // Others
    sixMonthHigh: toFixedNumber(item.d[13]),
    sixMonthHighExact: item.d[13],
    sixMonthLow: toFixedNumber(item.d[14]),
    sixMonthLowExact: item.d[14],
    oneYearHigh: toFixedNumber(item.d[15]),
    oneYearHighExact: item.d[15],
    oneYearLow: toFixedNumber(item.d[16]),
    oneYearLowExact: item.d[16],
    allTimeHigh: toFixedNumber(item.d[17]),
    allTimeLow: toFixedNumber(item.d[18]),
    tenDayAverageVolume: numberToText(item.d[19]),
    tenDayAverageVolumeExact: item.d[19],
    thirtyDayAverageVolume: numberToText(item.d[20]),
    ninetyDayAverageVolume: numberToText(item.d[21]),
    volume: numberToText(item.d[22]),
    volumeExact: item.d[22],
    volumeDelta: item.d[19] - item.d[22],
    open: item.d[23],
    close: item.d[24],
    high: item.d[25],
    low: item.d[26],
    changeFromOpen: toFixedNumber(item.d[27]),
    preMarketChange: toFixedNumber(item.d[28]),
    preMarketChangeExact: item.d[28],
    preMarketChangeType: null,
    preMarketVolume: numberToText(item.d[29]),
    preMarketVolumeExact: item.d[29],
    tenDayEMA: toFixedIntegerNumber(item.d[30]),
    twentyDayEMA: toFixedIntegerNumber(item.d[31]),
    fiftyDayEMA: toFixedIntegerNumber(item.d[32]),
    fiftyDayEMADiff: getDiffOfPricesInPercentage(item.d[3], item.d[32], 1),
    hundredDayEMA: toFixedIntegerNumber(item.d[33]),
    hundredDayEMADiff: getDiffOfPricesInPercentage(item.d[3], item.d[33], 1),
    twoHundredDayEMA: toFixedIntegerNumber(item.d[34]),
    twoHundredDayEMADiff: getDiffOfPricesInPercentage(item.d[3], item.d[34], 1),
    tenDaySMA: toFixedIntegerNumber(item.d[35]),
    twentyDaySMA: toFixedIntegerNumber(item.d[36]),
    fiftyDaySMA: toFixedIntegerNumber(item.d[37]),
    fiftyDaySMADiff: getDiffOfPricesInPercentage(item.d[3], item.d[37], 1),
    hundredDaySMA: toFixedIntegerNumber(item.d[38]),
    hundredDaySMADiff: getDiffOfPricesInPercentage(item.d[3], item.d[38], 1),
    twoHundredDaySMA: toFixedIntegerNumber(item.d[39]),
    twoHundredDaySMADiff: getDiffOfPricesInPercentage(item.d[3], item.d[39], 1),
    priceEarningTTM: toFixedNumber(item.d[40]),
    priceEarningTTMExact: item.d[40],
    forwardPriceEarning: item.d[40] ? toFixedNumber(item.d[52]) : "",
    forwardPriceEarningExact: item.d[40] ? item.d[52] : 0,
    priceEarningDiff:
      item.d[40] && item.d[52] ? toFixedNumber(item.d[52] - item.d[40]) : "",
    priceEarningDiffExact:
      item.d[40] && item.d[52] ? item.d[52] - item.d[40] : 0,
    priceBookTTM: toFixedNumber(item.d[41]),
    priceBookTTMExact: item.d[41],
    earningPerShareTTM: toFixedNumber(item.d[42]),
    earningPerShareTTMExact: item.d[42],
    earningPerShareTTMPer: toFixedNumber((item.d[42] / item.d[3]) * 100, 1),
    earningPerShareTTMPerExact: (item.d[42] / item.d[3]) * 100,
    dividendYield: toFixedNumber(item.d[43]),
    dividendYieldExact: item.d[43],
    priceEarningGrowth: toFixedNumber(item.d[45]),
    priceEarningGrowthExact: item.d[45],
    earningPerShareDilutedTTM: toFixedNumber(item.d[46]),
    earningPerShareDilutedTTMExact: item.d[46],
    earningPerShareDilutedTTMPer: item.d[46]
      ? toFixedNumber((item.d[46] / item.d[3]) * 100)
      : "",
    earningPerShareDilutedTTMGrowth: toFixedNumber(item.d[47]),
    earningPerShareDilutedTTMGrowthExact: item.d[47],
    totalRevenueGrowthTTM: toFixedNumber(item.d[48]),
    totalRevenueGrowthTTMExact: item.d[48],
    returnOnEquity: toFixedNumber(item.d[49]),
    returnOnEquityExact: item.d[49],
    freeFloatSharesPer: toFixedNumber(item.d[50]),
    freeFloatSharesPerExact: item.d[50],
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
    preMarketChangeType: getChangePercentageGroup(stockDetails.preMarketChange),
    dayChangeType: getChangePercentageGroup(stockDetails.dayChange),
    weekChangeType: getChangePercentageGroup(stockDetails.weekChange),
    monthChangeType: getChangePercentageGroup(stockDetails.monthChange),
    highlights: getStockHighlights(stockDetails),
    upFromDayLow: "",
    upFromDayLowExact: 0,
    downFromDayHigh: "",
    downFromDayHighExact: 0,
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
  const volume = stockDetails.volumeExact;
  const tenDayAverageVolume = stockDetails.tenDayAverageVolumeExact;
  if (volume > tenDayAverageVolume) {
    const delta = (volume - tenDayAverageVolume) / tenDayAverageVolume;
    if (delta > 0.25) {
      metrics.volumeIncreasedBy = toFixedIntegerNumber(delta * 100);
    }
  }
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
    "Crazy Selling": [0, 0, 0],
    "Heavy Selling": [0, 0, 0],
    "Moderate Selling": [0, 0, 0],
    Neutral: [0, 0, 0],
    "Moderate Buying": [0, 0, 0],
    "Heavy Buying": [0, 0, 0],
    "Crazy Buying": [0, 0, 0],
  };
  const priceEarningBySector: Record<string, TSectorPriceEarningRatio> = {};

  stocksDataItems.forEach((item) => {
    // Current Day
    if (item.dayChangeType) {
      changeInsights[item.dayChangeType][0] += 1;
    }
    // Current Week
    if (item.weekChangeType) {
      changeInsights[item.weekChangeType][1] += 1;
    }
    // Current Month
    if (item.monthChangeType) {
      changeInsights[item.monthChangeType][2] += 1;
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
        item.priceEarningTTMExact
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
