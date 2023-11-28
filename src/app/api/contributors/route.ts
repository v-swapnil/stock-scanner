export const niftyUrl =
  "https://iislliveblob.niftyindices.com/jsonfiles/Heatmap/FinalHeatMapNIFTY%2050.json";
export const bankNiftyUrl =
  "https://iislliveblob.niftyindices.com/jsonfiles/Heatmap/FinalHeatMapNIFTY%20BANK.json";

export async function GET() {
  // Nifty Index Contributors
  const niftyResponse = await fetch(niftyUrl, { cache: "no-store" });
  const niftyResponseJson = await niftyResponse.json();

  // Bank Nifty Index Contributors
  const bankNiftyResponse = await fetch(bankNiftyUrl, { cache: "no-store" });
  const bankNiftyResponseJson = await bankNiftyResponse.json();

  const niftyPointChanged = niftyResponseJson.reduce(
    (prev, item) => prev + item.pointchange,
    0
  );
  const bankNiftyPointChange = bankNiftyResponseJson.reduce(
    (prev, item) => prev + item.pointchange,
    0
  );

  return Response.json({
    niftyPointChanged: parseFloat(niftyPointChanged?.toFixed(2)),
    bankNiftyPointChange: parseFloat(bankNiftyPointChange?.toFixed(2)),
    niftyContributorSymbols: niftyResponseJson.map((item) => item.symbol),
    bankNiftyContributorSymbols: bankNiftyResponseJson.map(
      (item) => item.symbol
    ),
    niftyContributors: niftyResponseJson,
    bankNiftyContributors: bankNiftyResponseJson,
  });
}
