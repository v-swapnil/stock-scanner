export function toFixedNumber(number, fractionDigits = 2) {
  return number?.toFixed(fractionDigits);
}

export function toOneDecimalFixedNumber(number) {
  return Math.round(number * 10) / 10;
}

export function toFixedIntegerNumber(number) {
  return Math.round(number);
}

export function getChangeGroupTypeToDeltaType(changeGroupType) {
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

export function getChangePercentageGroup(changeValue) {
  const lowerBound = 0.25;
  const lowerUpperBound = 2.5;
  const upperBound = 5;
  const changePercentage = parseFloat(changeValue);
  // [Crazy Selling] Change less than -upperBound%
  // [Heavy Selling] Change from -lowerUpperBound% to -upperBound%
  // [Moderate Selling] Change from -lowerBound% to -lowerUpperBound%
  // [Neutral] Change around 0%
  // [Moderate Buying] Change from lowerBound% to lowerUpperBound%
  // [Heavy Buying] Change from lowerUpperBound% to upperBound%
  // [Crazy Buying] Change greater than upperBound%
  if (changePercentage <= -upperBound) {
    return "Crazy Selling";
  } else if (
    changePercentage <= -lowerUpperBound &&
    changePercentage > -upperBound
  ) {
    return "Heavy Selling";
  } else if (
    changePercentage <= -lowerBound &&
    changePercentage > -lowerUpperBound
  ) {
    return "Moderate Selling";
  } else if (changePercentage < lowerBound && changePercentage > -lowerBound) {
    return "Neutral";
  } else if (
    changePercentage >= lowerBound &&
    changePercentage < lowerUpperBound
  ) {
    return "Moderate Buying";
  } else if (
    changePercentage >= lowerUpperBound &&
    changePercentage < upperBound
  ) {
    return "Heavy Buying";
  } else if (changePercentage >= upperBound) {
    return "Crazy Buying";
  }
}

export function getDiffOfPricesInPercentage(price1, price2, fractionDigits) {
  if (fractionDigits === 0) {
    return toFixedIntegerNumber(((price1 - price2) / price1) * 100);
  } else if (fractionDigits === 1) {
    return toOneDecimalFixedNumber(((price1 - price2) / price1) * 100);
  }
  return toFixedNumber(((price1 - price2) / price1) * 100, fractionDigits);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(date));
}

export function getStockHighlights(stockDetails) {
  const upperBound = 2.5;
  const downFromSixMonthHighPoints =
    stockDetails.sixMonthHighExact - stockDetails.sixMonthLowExact;
  const highlights = {
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
      stockDetails.volumeExact / stockDetails.tenDayAverageVolumeExact >= 2,
  };
  return Object.keys(highlights).filter((item) => highlights[item]);
}

export function getConsolidatedHighlights(highlights) {
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
  return impHighlights;
}
