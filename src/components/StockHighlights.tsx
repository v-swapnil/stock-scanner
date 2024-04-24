import { ReactElement } from "react";
import { Badge, Flex } from "@tremor/react";
import { TConsolidatedHighlights } from "@/lib/types";

interface IStockHighlightsProps {
  highlights: Array<TConsolidatedHighlights>;
}

const StockHighlights = ({
  highlights,
}: IStockHighlightsProps): ReactElement => {
  const skip = ["Low Gains", "High Gains"];
  return (
    <Flex justifyContent="end" className="gap-2">
      {highlights.map((item: any) => {
        if (skip.includes(item)) {
          return null;
        }
        return (
          <Badge key={item} color="fuchsia">
            {item}
          </Badge>
        );
      })}
    </Flex>
  );
};

export default StockHighlights;
