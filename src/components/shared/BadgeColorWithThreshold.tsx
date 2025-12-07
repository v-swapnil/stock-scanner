import { ReactElement, ReactNode, useEffect, useState } from "react";
import { Badge } from "@tremor/react";
import { TCompareFn } from "@/lib/types";

type BadgeColorWithThresholdProps = {
  className?: string;
  children?: ReactNode;
  value: number | string;
  positiveThreshold?: number | string;
  neutralThreshold?: number | string;
  negativeThreshold?: number | string;
  compareFn?: TCompareFn;
};

const compareFnMapping: Record<string, (v1: any, v2?: any) => boolean> = {
  [TCompareFn.EQ]: (value1, value2) => value1 === value2,
  [TCompareFn.LTE]: (value1, value2) => value1 <= value2,
  [TCompareFn.GTE]: (value1, value2) => value1 >= value2,
};

const notUndefinedOrNull = (v: any) => v !== undefined && v !== null;

const BadgeColorWithThreshold = ({
  className,
  value,
  positiveThreshold,
  negativeThreshold,
  neutralThreshold,
  compareFn = TCompareFn.EQ,
  children,
}: BadgeColorWithThresholdProps): ReactElement => {
  const [color, setColor] = useState("gray");

  useEffect(() => {
    const comparator = compareFnMapping[compareFn];
    if (
      notUndefinedOrNull(positiveThreshold) &&
      comparator(value, positiveThreshold)
    ) {
      setColor("emerald");
    } else if (
      notUndefinedOrNull(neutralThreshold) &&
      comparator(value, neutralThreshold)
    ) {
      setColor("orange");
    } else if (
      notUndefinedOrNull(negativeThreshold) &&
      comparator(value, negativeThreshold)
    ) {
      setColor("rose");
    } else {
      setColor(notUndefinedOrNull(negativeThreshold) ? "gray" : "rose");
    }
  }, [
    value,
    positiveThreshold,
    negativeThreshold,
    neutralThreshold,
    compareFn,
  ]);

  return (
    <Badge className={className} color={color}>
      {children}
    </Badge>
  );
};

export default BadgeColorWithThreshold;
