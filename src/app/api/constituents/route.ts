const indexDataUrlMappings: Record<string, string> = {
  nifty:
    "https://iislliveblob.niftyindices.com/jsonfiles/Heatmap/FinalHeatMapNIFTY%2050.json",
  niftyJunior:
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20NEXT%2050.json",
  niftyBank:
    "https://iislliveblob.niftyindices.com/jsonfiles/Heatmap/FinalHeatMapNIFTY%20BANK.json",
  niftyFinServices:
    "https://iislliveblob.niftyindices.com/jsonfiles/Heatmap/FinalHeatMapNIFTY%20FINANCIAL%20SERVICES.json",
  niftyMidCap:
    "https://iislliveblob.niftyindices.com/jsonfiles/Heatmap/FinalHeatMapNIFTY%20MIDCAP%20SELECT.json",
  niftyPublicSectorEnterprises:
    "https://iislliveblob.niftyindices.com/jsonfiles/Heatmap/FinalHeatMapNIFTY%20PSE.json",
};

async function getIndexConstituents(indexDataUrl: string) {
  const response = await fetch(indexDataUrl, { cache: "no-store" });
  const responseJson: Array<{
    symbol: string;
  }> = await response.json();
  return responseJson.map((item) => item.symbol);
}

async function handler() {
  const indexKeys = Object.keys(indexDataUrlMappings);
  const promises = indexKeys.map((key) => {
    return getIndexConstituents(indexDataUrlMappings[key]);
  });

  const promiseResult = await Promise.all(promises);
  const result: Record<string, any> = {};
  promiseResult.forEach((item, index) => {
    result[indexKeys[index]] = item;
  });

  // FnO Stocks
  const fnoStocksUrl = "https://www.nseindia.com/api/master-quote";
  const response = await fetch(fnoStocksUrl, { cache: "no-store" });
  const responseJson = await response.json();
  result.futureAndOptions = responseJson;

  return Response.json(result);
}

export async function GET() {
  try {
    const result = await handler();
    return result;
  } catch (err) {
    console.error(err);
    return Response.json({});
  }
}
