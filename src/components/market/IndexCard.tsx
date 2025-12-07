import {
  Card,
  Text,
  Flex,
  BadgeDelta,
  Metric,
  Badge,
  Divider,
} from "@tremor/react";
import StockRangeBar from "../stock/StockRangeBar";
import { TIndexDataItem } from "@/lib/types";
import { memo } from "react";

interface IIndexCardProps {
  item: TIndexDataItem;
  showRangeBar: boolean;
}

function IndexCard({ item, showRangeBar = false }: IIndexCardProps) {
  return (
    <Card key={item.indexName} className="w-[320px]">
      <Flex className="mb-0">
        <Text>{item.indexName}</Text>
        <BadgeDelta deltaType={item.deltaType}>
          {item.percentageChange}%
        </BadgeDelta>
      </Flex>
      <Metric>{item.last}</Metric>
      <Flex className="gap-2 mt-4" justifyContent="start">
        <Badge color={item.pointChange >= 0 ? "emerald" : "rose"}>
          {item.pointChange >= 0 ? "+" : ""}
          {item.pointChange}
        </Badge>
        <BadgeDelta deltaType="increase">{item.pointUpFromLow}</BadgeDelta>
        <BadgeDelta deltaType="decrease">{item.pointDownFromHigh}</BadgeDelta>
      </Flex>
      {showRangeBar && <Divider />}
      {showRangeBar && (
        <StockRangeBar
          low={item.lowExact}
          high={item.highExact}
          current={item.lastExact}
        />
      )}
    </Card>
  );
}

export default memo(IndexCard);
