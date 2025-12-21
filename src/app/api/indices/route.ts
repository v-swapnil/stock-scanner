const indicesWatchUrl =
  "https://iislliveblob.niftyindices.com/jsonfiles/LiveIndicesWatch.json";

async function handler() {
  const response = await fetch(indicesWatchUrl, {
    // Moderate revalidation is fine; upstream updates frequently.
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Indices fetch failed: ${response.status}`);
  }

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

  return (responseJson.data || []).filter((item: any) =>
    selectedIndices.includes(item.indexName),
  );
}

export async function GET() {
  try {
    const result = await handler();
    return Response.json(result, { status: 200 });
  } catch (err) {
    return Response.json({ type: "error", message: "Failed to fetch indices" }, { status: 502 });
  }
}
