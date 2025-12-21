import IndexCard from "@/components/market/IndexCard";
import InsightCard from "@/components/market/InsightCard";
import StockDataTableCard from "@/components/StockDataTableCard";
import {
  addStockInsights,
  getFormattedDataItems,
  getFormattedIndices,
  getMetricsFromStockData,
  getPayloadForRequest,
} from "@/lib/data-format";
import { TIndexDataItems, TPageSearchParams, TStockDataItems } from "@/lib/types";
import { Flex } from "@tremor/react";

const tradingViewScanUrl = "https://scanner.tradingview.com/india/scan";
const indicesWatchUrl = "https://iislliveblob.niftyindices.com/jsonfiles/LiveIndicesWatch.json";

async function fetchStocks(searchParams: TPageSearchParams): Promise<TStockDataItems> {
  const marketCapInBillions = searchParams.market_cap_in_billions
    ? parseInt(searchParams.market_cap_in_billions) || 75
    : 75;
  const limit = searchParams.limit ? parseInt(searchParams.limit) : undefined;
  const payload = getPayloadForRequest({ marketCapInBillions, limit });

  try {
    const response = await fetch(tradingViewScanUrl, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "content-type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`TradingView scan failed: ${response.status}`);
    }

    const responseJson = await response.json();
    const dataItems = responseJson.data || [];
    const formattedDataItems = getFormattedDataItems(dataItems);
    const filteredDataItems = formattedDataItems
      .filter(
        (item: any) =>
          searchParams.expensive_stocks === "true" || item.currentPriceExact < 10000,
      )
      .map((item: any) => addStockInsights(item));

    return filteredDataItems as TStockDataItems;
  } catch (error) {
    console.error("Failed to fetch stocks", error);
    return [] as TStockDataItems;
  }
}

async function fetchIndices(): Promise<TIndexDataItems> {
  try {
    const response = await fetch(indicesWatchUrl, {
      next: { revalidate: 60 },
    });
    if (!response.ok) {
      throw new Error(`Indices fetch failed: ${response.status}`);
    }
    const responseJson = await response.json();
    const formatted = getFormattedIndices(responseJson.data || []);
    return formatted;
  } catch (error) {
    console.error("Failed to fetch indices", error);
    return [] as TIndexDataItems;
  }
}

interface IHomePageProps {
  searchParams: TPageSearchParams;
}

export default async function Home({ searchParams }: IHomePageProps) {
  const [stocksDataItems, indexDataItems] = await Promise.all([
    fetchStocks(searchParams),
    fetchIndices(),
  ]);

  const stocksMetrics = getMetricsFromStockData(stocksDataItems || []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Flex className="px-2">
        <InsightCard title="Day Change" data={stocksMetrics.changeInsights} />
        <InsightCard title="Week Change" data={stocksMetrics.weekChangeInsights} />
        <InsightCard title="Month Change" data={stocksMetrics.monthChangeInsights} />
      </Flex>
      <StockDataTableCard
        data={stocksDataItems}
        priceEarningBySector={stocksMetrics.priceEarningBySector}
      />
      <Flex className="gap-4 p-6 flex-wrap">
        {indexDataItems.map((item) => (
          <IndexCard key={item.indexName} item={item} showRangeBar={false} />
        ))}
      </Flex>
    </main>
  );
}
