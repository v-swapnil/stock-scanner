export async function GET() {
  // Get Market News
  const newsUrl =
    "https://newsapi.org/v2/top-headlines?country=in&category=business&apiKey=adafeceb1ef6489b909fb586e919b43c";
  const newsResponse = await fetch(newsUrl, { cache: "no-store" });
  const newsResponseJson = await newsResponse.json();
  return Response.json({
    marketNews: newsResponseJson.articles,
  });
}
