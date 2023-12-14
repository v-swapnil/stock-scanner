"use client";

import { toFixedNumber } from "@/lib/common";
import { Flex, Text, MarkerBar } from "@tremor/react";

function StockRangeBar({ low, high, current }) {
  const lowParsed = toFixedNumber(low);
  const highParsed = toFixedNumber(high);
  const markerValue = ((current - low) / (high - low)) * 100;
  return (
    <>
      <Flex className="w-[200px]">
        <Text className="font-size">{lowParsed}</Text>
        <Text>{highParsed}</Text>
      </Flex>
      <MarkerBar value={markerValue} color="slate" className="mt-2 bg-range" />
    </>
  );
}

export default StockRangeBar;
