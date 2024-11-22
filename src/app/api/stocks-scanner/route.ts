import {
  addStockInsights,
  getFormattedDataItems,
  getPayloadForRequest,
} from "@/lib/data-format";
import { TStockDataItems } from "@/lib/types";

async function handler(searchParams: Record<string, string>) {
  const marketCapInBillions = searchParams.market_cap_in_billions
    ? parseInt(searchParams.market_cap_in_billions) || 75
    : 75;
  const limit = searchParams.limit ? parseInt(searchParams.limit) : undefined;
  const dataUrl = "https://scanner.tradingview.com/india/scan";
  const dataPayload = getPayloadForRequest({ marketCapInBillions, limit });
  const response = await fetch(dataUrl, {
    cache: "no-store",
    method: "POST",
    body: JSON.stringify(dataPayload),
  });
  const responseJson = await response.json();
  const dataItems = responseJson.data;
  const formattedDataItems = getFormattedDataItems(dataItems);
  const filteredDataItems = formattedDataItems
    // Remove Expensive Stocks
    .filter(
      (item: any) =>
        searchParams.expensive_stocks === "true" ||
        item.currentPriceExact < 10000
    )
    .map((item: any) => addStockInsights(item));
  return filteredDataItems as TStockDataItems;
}

export async function GET(request: Request) {
  try {
    const parsedUrl = new URL(request.url);
    const searchParams = Object.fromEntries(parsedUrl.searchParams.entries());
    const result = await handler(searchParams);
    return Response.json(result);
  } catch (err: any) {
    return Response.json({ type: "error", message: err.message });
  }
}
