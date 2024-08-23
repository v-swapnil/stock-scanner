"use client";

import { toFixedNumber } from "@/lib/common";
import { Flex, Text, MarkerBar } from "@tremor/react";
import { memo } from "react";

interface IStockRangeBarProps {
  low: number;
  high: number;
  current: number;
  lowParsed?: string;
  highParsed?: string;
  currentValueInPercent?: number;
  fixedWidth?: boolean;
}

function StockRangeBar({
  low,
  high,
  current,
  lowParsed,
  highParsed,
  currentValueInPercent,
  fixedWidth,
}: IStockRangeBarProps) {
  const markerValue =
    typeof currentValueInPercent !== "undefined"
      ? currentValueInPercent
      : ((current - low) / (high - low)) * 100;
  return (
    <>
      <Flex className={fixedWidth ? "w-[200px]" : "w-full"}>
        <Text>{lowParsed || toFixedNumber(low)}</Text>
        <Text>{highParsed || toFixedNumber(high)}</Text>
      </Flex>
      <MarkerBar value={markerValue} color="slate" className="mt-2 bg-range" />
    </>
  );
}

export default memo(StockRangeBar);
