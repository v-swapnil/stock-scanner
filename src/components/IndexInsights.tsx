import {
  Card,
  Metric,
  Text,
  List,
  ListItem,
  BadgeDelta,
  Flex,
  Bold,
} from "@tremor/react";

export default function IndexInsights({
  title,
  price,
  pointsChanged,
  contributors,
}) {
  return (
    <Card className="w-full m-6">
      <Flex alignItems="start">
        <Text>{title}</Text>
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
        {contributors.map((item) => (
          <ListItem key={item.symbol}>
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
    </Card>
  );
}
