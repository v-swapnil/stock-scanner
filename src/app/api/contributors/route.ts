const niftyUrl =
  "https://iislliveblob.niftyindices.com/jsonfiles/Heatmap/FinalHeatMapNIFTY%2050.json";
const bankNiftyUrl =
  "https://iislliveblob.niftyindices.com/jsonfiles/Heatmap/FinalHeatMapNIFTY%20BANK.json";
const finNiftyUrl =
  "https://iislliveblob.niftyindices.com/jsonfiles/Heatmap/FinalHeatMapNIFTY%20FINANCIAL%20SERVICES.json";
const midCapNiftyUrl =
  "https://iislliveblob.niftyindices.com/jsonfiles/Heatmap/FinalHeatMapNIFTY%20MIDCAP%20SELECT.json";

function getIndexPrice(data, pointChange) {
  return parseFloat((data[0].NewIndexValue + pointChange)?.toFixed(2));
}

async function handler() {
  // Nifty Index Contributors
  const niftyResponse = await fetch(niftyUrl, { cache: "no-store" });
  const niftyResponseJson = await niftyResponse.json();

  // Bank Nifty Index Contributors
  const bankNiftyResponse = await fetch(bankNiftyUrl, { cache: "no-store" });
  const bankNiftyResponseJson = await bankNiftyResponse.json();

  // Fin Nifty Index Contributors
  const finNiftyResponse = await fetch(finNiftyUrl, { cache: "no-store" });
  const finNiftyResponseJson = await finNiftyResponse.json();

  // MidCap Nifty Index Contributors
  const midCapNiftyResponse = await fetch(midCapNiftyUrl, {
    cache: "no-store",
  });
  const midCapNiftyResponseJson = await midCapNiftyResponse.json();

  const niftyPointChanged = niftyResponseJson.reduce(
    (prev, item) => prev + item.pointchange,
    0
  );
  const bankNiftyPointChange = bankNiftyResponseJson.reduce(
    (prev, item) => prev + item.pointchange,
    0
  );
  const finNiftyPointChange = finNiftyResponseJson.reduce(
    (prev, item) => prev + item.pointchange,
    0
  );
  const midCapNiftyPointChange = midCapNiftyResponseJson.reduce(
    (prev, item) => prev + item.pointchange,
    0
  );

  return Response.json({
    // Price
    niftyPrice: getIndexPrice(niftyResponseJson, niftyPointChanged),
    bankNiftyPrice: getIndexPrice(bankNiftyResponseJson, bankNiftyPointChange),
    finNiftyPrice: getIndexPrice(finNiftyResponseJson, finNiftyPointChange),
    midCapNiftyPrice: getIndexPrice(
      midCapNiftyResponseJson,
      midCapNiftyPointChange
    ),
    // Points Changed
    niftyPointChanged: parseFloat(niftyPointChanged?.toFixed(2)),
    bankNiftyPointChange: parseFloat(bankNiftyPointChange?.toFixed(2)),
    finNiftyPointChange: parseFloat(finNiftyPointChange?.toFixed(2)),
    midCapNiftyPointChange: parseFloat(midCapNiftyPointChange?.toFixed(2)),
    // Constituent
    niftyConstituent: niftyResponseJson.map((item) => item.symbol),
    bankNiftyConstituent: bankNiftyResponseJson.map((item) => item.symbol),
    finNiftyConstituent: finNiftyResponseJson.map((item) => item.symbol),
    midCapNiftyConstituent: midCapNiftyResponseJson.map((item) => item.symbol),
    // Contributions
    niftyContributors: niftyResponseJson,
    bankNiftyContributors: bankNiftyResponseJson,
    finNiftyContributors: finNiftyResponseJson,
    midCapNiftyContributors: midCapNiftyResponseJson,
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
