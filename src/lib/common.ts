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
