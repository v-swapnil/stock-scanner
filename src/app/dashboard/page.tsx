"use client";

import ETFDataTableCard from "@/components/ETFDataTableCard";
import InsightCard from "@/components/InsightCard";
import MarketIndicesAnalysis from "@/components/MarketIndicesAnalysis";
import StockDataTableCard from "@/components/StockDataTableCard";
import {
  addStockInsights,
  getFormattedDataItems,
  getFormattedIndices,
  getMetricsFromStockData,
  getPayloadForRequest,
} from "@/lib/data-format";
import {
  TIndexDataItems,
  TPageSearchParams,
  TStockDataItems,
} from "@/lib/types";
import { Flex } from "@tremor/react";
import axios from "axios";
import { useState, useEffect, useMemo } from "react";

async function getStockData(searchParams: TPageSearchParams) {
  const marketCapInBillions = searchParams.market_cap_in_billions
    ? parseInt(searchParams.market_cap_in_billions) || 75
    : 75;
  const dataUrl = "https://scanner.tradingview.com/india/scan";
  const dataPayload = getPayloadForRequest(marketCapInBillions);
  try {
    const response = await axios.post(dataUrl, dataPayload);
    const dataItems = response.data.data;
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
  } catch (error: any) {
    if (error.response) {
      console.error("Error getting stock data from TradingView.");
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("error.response", error.response.data);
      console.error("error.response", error.response.status);
      console.error("error.response", error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.error("error.request", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error", error.message);
    }
    console.error("error.config", error.config);
    return [];
  }
}

interface IHomePageProps {
  searchParams: TPageSearchParams;
}

function Home({ searchParams }: IHomePageProps) {
  const [isLoading, setLoading] = useState(true);
  const [stocksDataItems, setStocksDataItems] = useState([]);

  useEffect(() => {
    const getStockData = async () => {
      const response = await axios.get(
        "/api/stocks-scanner?" + new URLSearchParams(searchParams).toString()
      );
      setStocksDataItems(response.data || []);
      setLoading(false);
    };
    getStockData();
  }, [searchParams]);

  const stocksMetrics = useMemo(() => {
    return getMetricsFromStockData(stocksDataItems || []);
  }, [stocksDataItems]);

  // const stocksDataItems = await getStockData(searchParams);
  // const stocksMetrics = getMetricsFromStockData(stocksDataItems || []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Flex className="px-2">
        <InsightCard title="Day Change" data={stocksMetrics.changeInsights} />
        <InsightCard
          title="Week Change"
          data={stocksMetrics.weekChangeInsights}
        />
        <InsightCard
          title="Month Change"
          data={stocksMetrics.monthChangeInsights}
        />
      </Flex>
      <StockDataTableCard
        data={stocksDataItems}
        priceEarningBySector={stocksMetrics.priceEarningBySector}
      />
      <ETFDataTableCard />
      <MarketIndicesAnalysis />
    </main>
  );
}

export default Home;
