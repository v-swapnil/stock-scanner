import { TChangeGroupType, THighlights, TStockDataItem } from "./types";

export function toFixedNumber(value: number, fractionDigits = 2) {
  return value?.toFixed(fractionDigits);
}

export function toOneDecimalFixedNumber(value: number) {
  return Math.round(value * 10) / 10;
}

export function toFixedIntegerNumber(value: number) {
  return Math.round(value);
}

export function getChangeGroupTypeToDeltaType(
  changeGroupType: TChangeGroupType
) {
  switch (changeGroupType) {
    case "Crazy Selling":
      return "decrease";
    case "Heavy Selling":
      return "decrease";
    case "Moderate Selling":
      return "moderateDecrease";
    case "Neutral":
      return "unchanged";
    case "Moderate Buying":
      return "moderateIncrease";
    case "Heavy Buying":
      return "increase";
    case "Crazy Buying":
      return "increase";
    default:
      return "unchanged";
  }
}

// Change percentage lower and upper bounds
const lowerBound = 0.25;
const lowerUpperBound = 2.5;
const upperBound = 5;

export function getChangePercentageGroup(changeValue: string) {
  const changePercentage = parseFloat(changeValue);
  // [Crazy Selling] Change less than -upperBound%
  // [Heavy Selling] Change from -lowerUpperBound% to -upperBound%
  // [Moderate Selling] Change from -lowerBound% to -lowerUpperBound%
  // [Neutral] Change around 0%
  // [Moderate Buying] Change from lowerBound% to lowerUpperBound%
  // [Heavy Buying] Change from lowerUpperBound% to upperBound%
  // [Crazy Buying] Change greater than upperBound%
  if (changePercentage <= -upperBound) {
    return "Crazy Selling" as TChangeGroupType;
  } else if (
    changePercentage <= -lowerUpperBound &&
    changePercentage > -upperBound
  ) {
    return "Heavy Selling" as TChangeGroupType;
  } else if (
    changePercentage <= -lowerBound &&
    changePercentage > -lowerUpperBound
  ) {
    return "Moderate Selling" as TChangeGroupType;
  } else if (changePercentage < lowerBound && changePercentage > -lowerBound) {
    return "Neutral" as TChangeGroupType;
  } else if (
    changePercentage >= lowerBound &&
    changePercentage < lowerUpperBound
  ) {
    return "Moderate Buying" as TChangeGroupType;
  } else if (
    changePercentage >= lowerUpperBound &&
    changePercentage < upperBound
  ) {
    return "Heavy Buying" as TChangeGroupType;
  } else if (changePercentage >= upperBound) {
    return "Crazy Buying" as TChangeGroupType;
  }
  return "Neutral" as TChangeGroupType;
}

export function getDeltaTypeFromChangePercentage(changeValue: string) {
  const changePercentage = parseFloat(changeValue);
  // [Crazy Selling] Change less than -upperBound%
  // [Heavy Selling] Change from -lowerUpperBound% to -upperBound%
  // [Moderate Selling] Change from -lowerBound% to -lowerUpperBound%
  // [Neutral] Change around 0%
  // [Moderate Buying] Change from lowerBound% to lowerUpperBound%
  // [Heavy Buying] Change from lowerUpperBound% to upperBound%
  // [Crazy Buying] Change greater than upperBound%
  if (changePercentage <= -upperBound) {
    return "decrease";
  } else if (
    changePercentage <= -lowerUpperBound &&
    changePercentage > -upperBound
  ) {
    return "decrease";
  } else if (
    changePercentage <= -lowerBound &&
    changePercentage > -lowerUpperBound
  ) {
    return "moderateDecrease";
  } else if (changePercentage < lowerBound && changePercentage > -lowerBound) {
    return "unchanged";
  } else if (
    changePercentage >= lowerBound &&
    changePercentage < lowerUpperBound
  ) {
    return "moderateIncrease";
  } else if (
    changePercentage >= lowerUpperBound &&
    changePercentage < upperBound
  ) {
    return "increase";
  } else if (changePercentage >= upperBound) {
    return "increase";
  }
  return "unchanged";
}

export function getDiffOfPricesInPercentage(
  price1: number,
  price2: number,
  fractionDigits: number
) {
  if (fractionDigits === 0) {
    return toFixedIntegerNumber(((price1 - price2) / price1) * 100);
  } else if (fractionDigits === 1) {
    return toOneDecimalFixedNumber(((price1 - price2) / price1) * 100);
  }
  return toFixedNumber(((price1 - price2) / price1) * 100, fractionDigits);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(date));
}

export function getStockHighlights(stockDetails: TStockDataItem) {
  const upperBound = 2.5;
  const downFromSixMonthHighPoints =
    stockDetails.sixMonthHighExact - stockDetails.sixMonthLowExact;
  const highlights: Record<THighlights, boolean> = {
    "near-50-sma": stockDetails.fiftyDaySMADiff <= upperBound,
    "near-50-ema": stockDetails.fiftyDayEMADiff <= upperBound,
    "near-100-ema": stockDetails.hundredDayEMADiff <= upperBound,
    "near-200-ema": stockDetails.twoHundredDayEMADiff <= upperBound,
    "near-upperBound0-sma": stockDetails.fiftyDaySMADiff <= upperBound,
    "near-100-sma": stockDetails.hundredDaySMADiff <= upperBound,
    "near-200-sma": stockDetails.twoHundredDaySMADiff <= upperBound,
    "down-75-per-from-6m-high":
      stockDetails.currentPriceExact <=
      stockDetails.sixMonthHighExact - downFromSixMonthHighPoints * 0.75,
    "down-50-per-from-6m-high":
      stockDetails.currentPriceExact <=
      stockDetails.sixMonthHighExact - downFromSixMonthHighPoints * 0.5,
    "vol-inc-100-per-or-more":
      stockDetails.volumeExact / stockDetails.tenDayAverageVolumeExact >= 1.75,
    "high-gains-6m": stockDetails.sixMonthChangeExact >= 40,
    "low-gains-6m": stockDetails.sixMonthChangeExact <= 10,
  };
  return Object.keys(highlights).filter(
    (item) => highlights[item as THighlights]
  ) as Array<THighlights>;
}

export function getConsolidatedHighlights(highlights: Array<THighlights>) {
  const impHighlights = [];
  if (
    highlights.includes("near-200-ema") ||
    highlights.includes("near-200-sma")
  ) {
    impHighlights.push("200 MA");
  } else if (
    highlights.includes("near-100-ema") ||
    highlights.includes("near-100-sma")
  ) {
    impHighlights.push("100 MA");
  } else if (
    highlights.includes("near-50-ema") ||
    highlights.includes("near-50-sma")
  ) {
    impHighlights.push("50 MA");
  }
  if (
    highlights.includes("down-75-per-from-6m-high") ||
    highlights.includes("down-50-per-from-6m-high")
  ) {
    impHighlights.push("6M Low");
  }
  if (highlights.includes("vol-inc-100-per-or-more")) {
    impHighlights.push("Volume");
  }
  if (highlights.includes("high-gains-6m")) {
    impHighlights.push("High Gains");
  }
  if (highlights.includes("low-gains-6m")) {
    impHighlights.push("Low Gains");
  }
  return impHighlights;
}

export function getSearchTerms(stockDetails: TStockDataItem) {
  return `${stockDetails.name.toLowerCase()}:${stockDetails.description.toLowerCase()}:${stockDetails.sector.toLowerCase()}:${stockDetails.industry.toLowerCase()}`;
}

export function getStockRangeDetails(
  currentPrice: number,
  lowPrice: number,
  highPrice: number
) {
  const upFromLow = ((currentPrice - lowPrice) / lowPrice) * 100;
  const downFromHigh = ((highPrice - currentPrice) / highPrice) * 100;
  return { upFromLow, downFromHigh };
}
