import { RefreshIcon } from "@heroicons/react/outline";
import {
  BadgeDelta,
  Bold,
  Button,
  Card,
  CategoryBar,
  Flex,
  List,
  ListItem,
  Metric,
  Text,
} from "@tremor/react";

export default function IndexInsights({
  title,
  price,
  pointsChanged,
  contributors,
  advanceDecline,
  canRefresh,
  isRefreshing,
  onRefresh,
}) {
  return (
    <Card className="w-full m-6">
      <Flex alignItems="start">
        <Text>{title}</Text>
        {pointsChanged !== null && (
          <BadgeDelta
            deltaType={
              pointsChanged > 0
                ? "increase"
                : pointsChanged < 0
                ? "decrease"
                : "unchanged"
            }
          >
            {pointsChanged}
          </BadgeDelta>
        )}
        {canRefresh && (
          <Button
            variant="light"
            disabled={isRefreshing}
            icon={RefreshIcon}
            onClick={onRefresh}
            tooltip="Refresh Data"
          />
        )}
      </Flex>
      <Metric>{price}</Metric>
      <Flex className="mt-6">
        <Text>
          <Bold>Advance</Bold>
        </Text>
        <Text>
          <Bold>Decline</Bold>
        </Text>
      </Flex>
      <List className="mt-1">
        {contributors.map((item, index) => (
          <ListItem key={"item-" + index}>
            <Flex justifyContent="start" className="truncate space-x-2.5">
              {item.positiveSymbol ? (
                <>
                  <BadgeDelta deltaType="increase">
                    {item.positivePointChanged}
                  </BadgeDelta>
                  <Text className="truncate">{item.positiveSymbol}</Text>
                </>
              ) : (
                <div />
              )}
            </Flex>
            <Flex justifyContent="end" className="truncate space-x-2.5">
              {item.negativeSymbol ? (
                <>
                  <Text className="truncate">{item.negativeSymbol}</Text>
                  <BadgeDelta deltaType="decrease">
                    {item.negativePointChanged}
                  </BadgeDelta>
                </>
              ) : (
                <div />
              )}
            </Flex>
          </ListItem>
        ))}
      </List>
      {advanceDecline && (
        <>
          <CategoryBar
            values={[advanceDecline, 100 - advanceDecline]}
            colors={["emerald", "rose"]}
            className="mt-4"
          />
          {/* <Legend
            categories={["Advance", "Decline"]}
            colors={["emerald", "rose"]}
            className="mt-3"
          /> */}
        </>
      )}
    </Card>
  );
}
