export async function GET() {
  const url = "https://www.nseindia.com/api/master-quote";
  const response = await fetch(url, { cache: "no-store" });
  const responseJson = await response.json();
  return Response.json({
    fnoStocks: responseJson,
  });
}
