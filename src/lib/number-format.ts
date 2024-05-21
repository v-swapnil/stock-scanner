export function numberToText(value: number) {
  const billion = 1000000000;
  const million = 1000000;
  const thousand = 1000;
  if (value >= billion) {
    return (value / billion)?.toFixed(2) + "B";
  } else if (value >= million) {
    return (value / million)?.toFixed(2) + "M";
  } else if (value >= thousand) {
    return (value / thousand)?.toFixed(2) + "T";
  } else {
    return value;
  }
}

export function numberFormat(value: number) {
  const parsed = parseFloat(value?.toFixed(2));
  return new Intl.NumberFormat("en-IN").format(parsed);
}

export function textToNumber(value: string) {
  return parseFloat(value.replace(",", ""));
}
