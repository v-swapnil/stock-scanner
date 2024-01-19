async function handler() {
  const url = "https://www.nseindia.com/api/master-quote";
  const response = await fetch(url, { cache: "no-store" });
  const responseJson = await response.json();
  return Response.json({
    fnoStocks: responseJson,
  });
}

export async function GET() {
  try {
    const result = await handler();
    return result;
  } catch (err) {
    return Response.json({});
  }
}
