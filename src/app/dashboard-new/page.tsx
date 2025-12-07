"use client";

import IndexCard from "@/components/market/IndexCard";
import InsightCard from "@/components/market/InsightCard";
import StockDataTableCard from "@/components/StockDataTableCard";
import {
  getFormattedIndices,
  getMetricsFromStockData,
} from "@/lib/data-format";
import { TIndexDataItems, TPageSearchParams } from "@/lib/types";
import { RiLoader5Line } from "@remixicon/react";
import { Flex } from "@tremor/react";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";

interface IHomePageProps {
  searchParams: TPageSearchParams;
}

export default function Home({ searchParams }: IHomePageProps) {
  const [isLoading, setLoading] = useState(true);
  const [stocksDataItems, setStocksDataItems] = useState([]);
  const [indexDataItems, setIndexDataItems] = useState<TIndexDataItems>([]);

  useEffect(() => {
    const getStockData = async () => {
      const response = await axios.get(
        "/api/stocks-scanner?" + new URLSearchParams(searchParams).toString(),
      );
      setStocksDataItems(response.data || []);
      setLoading(false);
    };
    getStockData();

    const getIndexData = async () => {
      const response = await axios.get("/api/indices");
      const formattedIndices = getFormattedIndices(response.data || []);
      setIndexDataItems(formattedIndices);
    };
    getIndexData();
  }, [searchParams]);

  const stocksMetrics = useMemo(() => {
    return getMetricsFromStockData(stocksDataItems || []);
  }, [stocksDataItems]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen">
        {/* <RiLoaderLine color="white" className="animate-spin" size={48} /> */}
        {/* <RiLoader2Line color="white" className="animate-spin" size={48} /> */}
        {/* <RiLoader3Line color="white" className="animate-spin" size={48} /> */}
        {/* <RiLoader4Line color="white" className="animate-spin" size={72} /> */}
        <RiLoader5Line color="white" className="animate-spin" size={48} />
      </div>
    );
  }
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
      <Flex className="gap-4 p-6 flex-wrap">
        {indexDataItems.map((item) => (
          <IndexCard key={item.indexName} item={item} showRangeBar={false} />
        ))}
      </Flex>
    </main>
  );
}
