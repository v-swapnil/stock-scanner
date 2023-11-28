export function numberToText(number) {
  const billion = 1000000000;
  const million = 1000000;
  const thousand = 1000;
  if (number >= billion) {
    return (number / billion)?.toFixed(2) + "B";
  } else if (number >= million) {
    return (number / million)?.toFixed(2) + "M";
  } else if (number >= thousand) {
    return (number / thousand)?.toFixed(2) + "T";
  } else {
    return number;
  }
}

export function numberFormat(number) {
  const parsed = parseFloat(number?.toFixed(2));
  return new Intl.NumberFormat("en-IN").format(parsed);
}
