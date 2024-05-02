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
};

async function handler(indexDataUrl: string) {
  const response = await fetch(indexDataUrl, { cache: "no-store" });
  const responseJson = await response.json();
  return Response.json(responseJson);
}

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const indexId = searchParams.get("indexId") || "nifty";
    const result = await handler(indexDataUrlMappings[indexId]);
    return result;
  } catch (err) {
    return Response.json({});
  }
}
