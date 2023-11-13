export async function GET() {
  const url = "https://www.nseindia.com/api/master-quote";
  const response = await fetch(url);
  const responseJson = await response.json();
  // Get Market News
  // const newsUrl =
  //   "https://newsapi.org/v2/top-headlines?country=in&category=business&apiKey=adafeceb1ef6489b909fb586e919b43c";
  // const newsResponse = await fetch(newsUrl);
  // const newsResponseJson = await newsResponse.json();
  const newsResponseJson = { articles: [] };
  return Response.json({
    fnoStocks: responseJson,
    marketNews: newsResponseJson.articles,
  });
}
