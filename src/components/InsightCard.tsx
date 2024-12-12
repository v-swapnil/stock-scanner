"use client";

import { memo, useState } from "react";
import {
  Flex,
  Text,
  Metric,
  BarList,
  Card,
  BadgeDelta,
  List,
  ListItem,
  Bold,
  Switch,
} from "@tremor/react";
import { getChangeGroupTypeToDeltaType } from "@/lib/common";
import { TStockDataMetricsItem } from "@/lib/types";

interface IInsightCardProps {
  title: string;
  data: Array<TStockDataMetricsItem>;
}

function InsightCard({ title, data }: IInsightCardProps) {
  const [isSwitchOn, setIsSwitchOn] = useState(true);

  return (
    <Card className="m-4 w-full">
      <Flex>
        <Metric>{title}</Metric>
        <Switch
          id="switch"
          name="switch"
          checked={isSwitchOn}
          onChange={setIsSwitchOn}
        />
      </Flex>
      {isSwitchOn ? (
        <BarList data={data} className="mt-4" sortOrder="none" />
      ) : (
        <List className="mt-4">
          {data.map((item) => (
            <ListItem key={item.name}>
              <Flex justifyContent="start" className="truncate space-x-2.5">
                <BadgeDelta
                  deltaType={getChangeGroupTypeToDeltaType(item.name)}
                />
                <Text className="truncate">{item.name}</Text>
              </Flex>
              <Text>{item.value}</Text>
            </ListItem>
          ))}
        </List>
      )}
    </Card>
  );
}

export default memo(InsightCard);
