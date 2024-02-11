async function handler() {
  const params = {
    from: "21-12-2023",
    to: "21-01-2024",
    optionType: "CE",
    strikePrice: "21500.00",
    expiryDate: "25-Jan-2024",
    instrumentType: "OPTIDX",
    symbol: "NIFTY",
  };
  const urlSearchParams = new URLSearchParams(params);
  const url =
    "https://www.nseindia.com/api/historical/fo/derivatives?" +
    urlSearchParams.toString();
  const response = await fetch(url, { cache: "no-store" });
  const responseJson = await response.json();
  return Response.json({
    fnoOptions: responseJson,
  });
}

export async function GET() {
  try {
    const result = await handler();
    return result;
  } catch (err) {
    console.log(err);
    return Response.json({});
  }
}
