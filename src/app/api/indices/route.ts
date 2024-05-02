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
    "NIFTY IT",
    "NIFTY BANK",
    "NIFTY AUTO",
    "NIFTY FIN SERVICE",
    "NIFTY MID SELECT",
    "NIFTY PHARMA",
  ];
  const indicesData = responseJson.data.filter((item: any) => {
    return selectedIndices.includes(item.indexName);
  });

  return Response.json(indicesData);
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
