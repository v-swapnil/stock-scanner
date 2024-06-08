"use client";

import { Flex } from "@tremor/react";
import IndexCard from "./IndexCard";
import { TIndexDataItems } from "@/lib/types";
import { memo, useEffect, useState } from "react";
import { getFormattedIndices } from "@/lib/data-format";
import axios from "axios";

function MarketIndicesAnalysis() {
  const [indexDataItems, setIndexDataItems] = useState<TIndexDataItems>([]);

  useEffect(() => {
    const getIndexData = async () => {
      const response = await axios.get("/api/indices");
      const formattedIndices = getFormattedIndices(response.data || []);
      setIndexDataItems(formattedIndices);
    };
    getIndexData();
  }, []);

  return (
    <Flex className="gap-4 p-6 flex-wrap">
      {indexDataItems.map((item) => (
        <IndexCard key={item.indexName} item={item} showRangeBar={false} />
      ))}
    </Flex>
  );
}

export default memo(MarketIndicesAnalysis);
