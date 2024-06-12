export type TPageSearchParams = {
  market_cap_in_billions: string;
  expensive_stocks: string;
};

export type TChangeGroupType =
  | "Crazy Selling"
  | "Heavy Selling"
  | "Moderate Selling"
  | "Neutral"
  | "Moderate Buying"
  | "Heavy Buying"
  | "Crazy Buying";

export type THighlights =
  | "near-50-ema"
  | "near-100-ema"
  | "near-200-ema"
  | "near-upperBound0-sma"
  | "near-50-sma"
  | "near-100-sma"
  | "near-200-sma"
  | "down-75-per-from-6m-high"
  | "down-50-per-from-6m-high"
  | "vol-inc-100-per-or-more"
  | "high-gains-6m"
  | "low-gains-6m";

export type TConsolidatedHighlights =
  | "200 MA"
  | "100 MA"
  | "50 MA"
  | "6M Low"
  | "Volume"
  | "High Gains"
  | "Low Gains";

export type TStockDataItem = {
  name: string;
  description: string;
  sector: string;
  industry: string;
  currentPrice: string;
  currentPriceExact: number;
  dayChangeAbs: string;
  dayChange: string;
  oneWeekLow: string;
  oneWeekLowExact: number;
  oneWeekHigh: string;
  oneWeekHighExact: number;
  dayChangeExact: number;
  currentWeekChange: string;
  weekChange: string;
  weekChangeExact: number;
  currentMonthChange: string;
  monthChange: string;
  monthChangeExact: number;
  threeMonthChange: string;
  threeMonthChangeExact: number;
  sixMonthChange: string;
  sixMonthChangeExact: number;
  yearChange: string;
  yearChangeExact: number;
  fiveYearChange: string;
  fiveYearChangeExact: number;
  marketCap: string;
  marketCapExact: number;
  marketCapInBillions: number;
  dayChangeType: TChangeGroupType;
  currentWeekChangeType: TChangeGroupType;
  weekChangeType: TChangeGroupType;
  currentMonthChangeType: TChangeGroupType;
  monthChangeType: TChangeGroupType;
  yearChangeType: TChangeGroupType;
  sixMonthHigh: string;
  sixMonthHighExact: number;
  sixMonthLow: string;
  sixMonthLowExact: number;
  oneYearHigh: string;
  oneYearHighExact: number;
  oneYearLow: string;
  oneYearLowExact: number;
  allTimeHigh: string;
  allTimeLow: string;
  tenDayAverageVolume: string;
  tenDayAverageVolumeExact: number;
  thirtyDayAverageVolume: string;
  ninetyDayAverageVolume: string;
  volume: string;
  volumeExact: number;
  volumeDelta: number;
  open: number;
  close: number;
  high: number;
  low: number;
  changeFromOpen: string;
  preMarketChange: string;
  preMarketChangeExact: number;
  preMarketChangeType: TChangeGroupType;
  preMarketVolume: number;
  preMarketVolumeExact: number;
  tenDayEMA: number;
  twentyDayEMA: number;
  fiftyDayEMA: number;
  fiftyDayEMADiff: number;
  hundredDayEMA: number;
  hundredDayEMADiff: number;
  twoHundredDayEMA: number;
  twoHundredDayEMADiff: number;
  tenDaySMA: number;
  twentyDaySMA: number;
  fiftyDaySMA: number;
  fiftyDaySMADiff: number;
  hundredDaySMA: number;
  hundredDaySMADiff: number;
  twoHundredDaySMA: number;
  twoHundredDaySMADiff: number;
  priceEarningTTM: string;
  priceEarningTTMExact: number;
  priceBookTTM: string;
  priceBookTTMExact: number;
  earningPerShareTTM: string;
  earningPerShareTTMExact: number;
  earningPerShareTTMPer: string;
  earningPerShareTTMPerExact: number;
  dividendYield: string;
  dividendYieldExact: number;
  priceEarningGrowth: string;
  priceEarningGrowthExact: number;
  forwardPriceEarning: string;
  forwardPriceEarningExact: number;
  priceEarningDiff: string;
  priceEarningDiffExact: number;
  earningPerShareDilutedTTM: string;
  earningPerShareDilutedTTMExact: number;
  earningPerShareDilutedTTMPer: string;
  earningPerShareDilutedTTMGrowth: string;
  earningPerShareDilutedTTMGrowthExact: number;
  totalRevenueGrowthTTM: string;
  totalRevenueGrowthTTMExact: number;
  returnOnEquity: string;
  returnOnEquityExact: number;
  mCapType: string;
  upFromSixMonthLow: string;
  upFromSixMonthLowExact: number;
  downFromSixMonthHigh: string;
  downFromSixMonthHighExact: number;
  upFromOneYearLow: string;
  upFromOneYearLowExact: number;
  downFromOneYearHigh: string;
  downFromOneYearHighExact: number;
  highlightRed: boolean;
  highlight: boolean;
  volumeIncreasedBy: number;
  highlights: Array<THighlights>;
  dayChangeDeltaType: string;
  preMarketChangeDeltaType: string;
  weekChangeDeltaType: string;
  monthChangeDeltaType: string;
  threeMonthChangeDeltaType: string;
  sixMonthChangeDeltaType: string;
  yearChangeDeltaType: string;
  fiveYearChangeDeltaType: string;
  consolidatedHighlights: Array<TConsolidatedHighlights>;
  searchTerms: string;
  freeFloatSharesPer: string;
  freeFloatSharesPerExact: number;
  upFromDayLow: string;
  downFromDayHigh: string;
  // optional
  isStarred?: boolean;
  isFnO?: boolean;
  isIndex?: boolean;
};

export type TStockDataItems = Array<TStockDataItem>;

export type TStockDataMetricsItem = {
  name: TChangeGroupType;
  value: number;
  color: string;
};

export type TStockDataMetrics = {
  changeInsights: Array<TStockDataMetricsItem>;
  weekChangeInsights: Array<TStockDataMetricsItem>;
  monthChangeInsights: Array<TStockDataMetricsItem>;
  priceEarningBySector: Record<string, TSectorPriceEarningRatio>;
};

export type TFnOParticipantsOpenInterest = {
  clientType: string;
  futureIndexLong: string;
  futureIndexShort: string;
  futureStockLong: string;
  futureStockShort: string;
  optionIndexCallLong: string;
  optionIndexPutLong: string;
  optionIndexCallShort: string;
  optionIndexPutShort: string;
  optionStockCallLong: string;
  optionStockPutLong: string;
  optionStockCallShort: string;
  optionStockPutShort: string;
  totalLong: string;
  totalShort: string;
};

export type TForeignInstitutionsStats = {
  type: string;
  buyContracts: string;
  buyContractAmount: string;
  sellContracts: string;
  sellContractsAmount: string;
  netContracts: string;
  netContractsAmount: string;
  eodContacts: string;
  eodContactsAmount: string;
};

export type TSectorPriceEarningRatio = {
  industry: string;
  sector: string;
  stocks: Array<string>;
  priceEarningRatios: Array<number>;
  average: string | number;
};

export type TIndexDataContributorItem = {
  symbol: string;
  pointchange: number;
};

export type TIndexData = {
  niftyContributors: Array<TIndexDataContributorItem>;
  bankNiftyContributors: Array<TIndexDataContributorItem>;
  niftyPrice: number;
  bankNiftyPrice: number;
  niftyPointChanged: number;
  bankNiftyPointChange: number;
};

export type TAdvanceDeclineMetric = {
  marketAdvanceDecline: number | null;
  niftyAdvanceDecline: number | null;
  bankNiftyAdvanceDecline: number | null;
};

export type TConsolidatedContributorItem = {
  pointChangeSuffix?: string;
  // Positive Symbol
  positiveSymbol: string;
  positivePointChanged: string | number;
  // Negative Symbol
  negativeSymbol?: string;
  negativePointChanged?: string | number;
};

export type TConsolidatedContributors = Array<TConsolidatedContributorItem>;

export enum TCompareFn {
  LTE = "LTE", // Less than equal to
  EQ = "EQ", // Equal to
  GTE = "GTE", // Greater than equal to
}

export type TIndexMetric = {
  price?: string | number;
  contributors?: TConsolidatedContributors;
  pointChanged?: number;
  advanceDecline?: number;
};

export type TIndexDataItem = {
  dateTime: string;
  indexType: string;
  indexName: string;
  previousClose: string;
  previousCloseExact: number;
  open: string;
  openExact: number;
  last: string;
  lastExact: number;
  low: string;
  lowExact: number;
  high: string;
  highExact: number;
  percentageChange: number;
  pointChange: number;
  deltaType: string;
  pointUpFromLow: number;
  pointDownFromHigh: number;
};

export type TIndexDataItems = Array<TIndexDataItem>;
