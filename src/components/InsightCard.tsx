"use client";

import { useState } from "react";
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

function InsightCard({ title, data }) {
  const [isSwitchOn, setIsSwitchOn] = useState(true);

  return (
    <Card className="max-w-sm mx-auto m-6">
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
        <BarList data={data} className="mt-4" />
      ) : (
        <List className="mt-4">
          {data.map((item: any) => (
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

export default InsightCard;
