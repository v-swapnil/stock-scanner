import {
  addStockInsights,
  getFormattedDataItems,
  getPayloadForRequest,
} from "@/lib/data-format";
import { TStockDataItems } from "@/lib/types";

const DEFAULT_MARKET_CAP_BILLIONS = 75;
const DEFAULT_LIMIT = 1000;
const MAX_LIMIT = 2000;

function validateQuery(searchParams: Record<string, string>) {
  const result: Record<string, string> = {};

  if (searchParams.market_cap_in_billions) {
    const val = searchParams.market_cap_in_billions;
    if (!/^\d+$/.test(val)) throw new Error("Invalid market_cap_in_billions");
    result.market_cap_in_billions = val;
  }

  if (searchParams.limit) {
    const val = searchParams.limit;
    if (!/^\d+$/.test(val)) throw new Error("Invalid limit");
    result.limit = val;
  }

  if (searchParams.expensive_stocks) {
    const val = searchParams.expensive_stocks;
    if (val !== "true" && val !== "false") {
      throw new Error("Invalid expensive_stocks");
    }
    result.expensive_stocks = val;
  }

  return result;
}

async function handler(searchParams: Record<string, string>) {
  const parsed = validateQuery(searchParams);

  const marketCapInBillions = parsed.market_cap_in_billions
    ? parseInt(parsed.market_cap_in_billions)
    : DEFAULT_MARKET_CAP_BILLIONS;

  const limitRaw = parsed.limit ? parseInt(parsed.limit) : DEFAULT_LIMIT;
  const limit = Math.min(Math.max(limitRaw, 1), MAX_LIMIT);

  const dataUrl = "https://scanner.tradingview.com/india/scan";
  const dataPayload = getPayloadForRequest({ marketCapInBillions, limit });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(dataUrl, {
      cache: "no-store",
      method: "POST",
      body: JSON.stringify(dataPayload),
      headers: { "content-type": "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`TradingView request failed: ${response.status}`);
    }

    const responseJson = await response.json();
    const dataItems = responseJson.data || [];
    const formattedDataItems = getFormattedDataItems(dataItems);
    const filteredDataItems = formattedDataItems
      .filter(
        (item: any) =>
          parsed.expensive_stocks === "true" || item.currentPriceExact < 10000,
      )
      .map((item: any) => addStockInsights(item));
    return filteredDataItems as TStockDataItems;
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: Request) {
  try {
    const parsedUrl = new URL(request.url);
    const searchParams = Object.fromEntries(parsedUrl.searchParams.entries());
    const result = await handler(searchParams);
    return Response.json(result, { status: 200 });
  } catch (err: any) {
    return Response.json({ type: "error", message: err.message }, { status: 400 });
  }
}
