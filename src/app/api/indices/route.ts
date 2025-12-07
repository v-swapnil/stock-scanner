async function handler() {
  const indicesWatchUrl =
    "https://iislliveblob.niftyindices.com/jsonfiles/LiveIndicesWatch.json";
  const response = await fetch(indicesWatchUrl, { cache: "no-store" });
  const responseJson = await response.json();

  const selectedIndices = [
    "NIFTY 50",
    "NIFTY NEXT 50",
    "NIFTY MIDCAP 150",
    "NIFTY SMLCAP 250",
    "NIFTY MICROCAP250",
    "NIFTY 500",
    "NIFTY TOTAL MKT",
    "NIFTY IT",
    "NIFTY BANK",
    "NIFTY AUTO",
    "NIFTY FIN SERVICE",
    "NIFTY MID SELECT",
    "NIFTY PHARMA",
    "NIFTY FMCG",
    "NIFTY METAL",
    "NIFTY CONSUMPTION",
  ];
  const indicesData = responseJson.data
    .filter((item: any) => selectedIndices.includes(item.indexName))
    .map((item: any) => item);

  return indicesData;
}

export async function GET() {
  try {
    const result = await handler();
    return Response.json(result);
  } catch (err) {
    return Response.json({});
  }
}
