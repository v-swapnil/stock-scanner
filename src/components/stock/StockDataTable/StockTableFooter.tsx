import {
  BadgeDelta,
  Flex,
  TableFoot,
  TableFooterCell,
  TableRow,
} from "@tremor/react";
import BadgeColorWithThreshold from "../../shared/BadgeColorWithThreshold";
import { TCompareFn } from "@/lib/types";
import { memo } from "react";

interface IStockTableFooterProps {
  insights: {
    avgPriceEarningRatio: string;
    avgPriceEarningRatioExact: number;
    avgForwardPriceEarningRatio: string;
    avgForwardPriceEarningRatioExact: number;
    avgPreMarketChange: string;
    avgPreMarketChangeDeltaType: "increase" | "decrease" | "unchanged";
    avgDayChange: string;
    avgDayChangeDeltaType: "increase" | "decrease" | "unchanged";
    avgWeekChange: string;
    avgWeekChangeDeltaType: "increase" | "decrease" | "unchanged";
    avgMonthChange: string;
    avgMonthChangeDeltaType: "increase" | "decrease" | "unchanged";
    avgThreeMonthChange: string;
    avgThreeMonthChangeDeltaType: "increase" | "decrease" | "unchanged";
    avgSixMonthChange: string;
    avgSixMonthChangeDeltaType: "increase" | "decrease" | "unchanged";
    avgOneYearChange: string;
    avgOneYearChangeDeltaType: "increase" | "decrease" | "unchanged";
    avgFiveYearChange: string;
    avgFiveYearChangeDeltaType: "increase" | "decrease" | "unchanged";
    avgUDLChange: string;
    avgUDLChangeDeltaType: "increase" | "decrease" | "unchanged";
    avgDDHChange: string;
    avgDDHChangeDeltaType: "increase" | "decrease" | "unchanged";
  };
  showFundamentals: boolean;
  showYearlyChange: boolean;
  showMovingAverages: boolean;
  showCurrentWeekMonthRange: boolean;
}

function StockTableFooter({
  insights,
  showFundamentals,
  showYearlyChange,
  showMovingAverages,
  showCurrentWeekMonthRange,
}: IStockTableFooterProps) {
  return (
    <TableFoot>
      <TableRow className="bg-tremor-background-muted dark:bg-dark-tremor-background-muted">
        <TableFooterCell className="text-left">Average</TableFooterCell>
        <TableFooterCell className="text-right"></TableFooterCell>
        <TableFooterCell className="text-right">
          <BadgeColorWithThreshold
            value={insights.avgPriceEarningRatioExact}
            positiveThreshold={25}
            neutralThreshold={75}
            compareFn={TCompareFn.LTE}
          >
            {insights.avgPriceEarningRatio}
          </BadgeColorWithThreshold>
        </TableFooterCell>
        <TableFooterCell className="text-right">
          <BadgeColorWithThreshold
            value={insights.avgForwardPriceEarningRatioExact}
            positiveThreshold={25}
            neutralThreshold={75}
            compareFn={TCompareFn.LTE}
          >
            {insights.avgForwardPriceEarningRatio}
          </BadgeColorWithThreshold>
        </TableFooterCell>
        {showFundamentals && (
          <>
            <TableFooterCell className="text-left"></TableFooterCell>
            <TableFooterCell className="text-right"></TableFooterCell>
            <TableFooterCell className="text-right"></TableFooterCell>
            <TableFooterCell className="text-right"></TableFooterCell>
            <TableFooterCell className="text-right"></TableFooterCell>
            <TableFooterCell className="text-right"></TableFooterCell>
            <TableFooterCell className="text-right"></TableFooterCell>
            <TableFooterCell className="text-right"></TableFooterCell>
            <TableFooterCell className="text-right"></TableFooterCell>
          </>
        )}
        <TableFooterCell className="text-right">
          <BadgeDelta deltaType={insights.avgPreMarketChangeDeltaType}>
            {insights.avgPreMarketChange}%
          </BadgeDelta>
        </TableFooterCell>
        <TableFooterCell className="text-right">
          <BadgeDelta deltaType={insights.avgDayChangeDeltaType}>
            {insights.avgDayChange}%
          </BadgeDelta>
        </TableFooterCell>
        <TableFooterCell className="text-right">
          <BadgeDelta deltaType={insights.avgWeekChangeDeltaType}>
            {insights.avgWeekChange}%
          </BadgeDelta>
        </TableFooterCell>
        <TableFooterCell className="text-right">
          <BadgeDelta deltaType={insights.avgMonthChangeDeltaType}>
            {insights.avgMonthChange}%
          </BadgeDelta>
        </TableFooterCell>
        <TableFooterCell className="text-right">
          <BadgeDelta deltaType={insights.avgThreeMonthChangeDeltaType}>
            {insights.avgThreeMonthChange}%
          </BadgeDelta>
        </TableFooterCell>
        <TableFooterCell className="text-right">
          <BadgeDelta deltaType={insights.avgSixMonthChangeDeltaType}>
            {insights.avgSixMonthChange}%
          </BadgeDelta>
        </TableFooterCell>
        {showYearlyChange && (
          <>
            <TableFooterCell className="text-right">
              <BadgeDelta deltaType={insights.avgOneYearChangeDeltaType}>
                {insights.avgOneYearChange}%
              </BadgeDelta>
            </TableFooterCell>
            <TableFooterCell className="text-right">
              <BadgeDelta deltaType={insights.avgFiveYearChangeDeltaType}>
                {insights.avgFiveYearChange}%
              </BadgeDelta>
            </TableFooterCell>
          </>
        )}
        <TableFooterCell className="text-left">
          <Flex>
            <BadgeDelta
              deltaType={insights.avgUDLChangeDeltaType}
              className="mr-2"
            >
              {insights.avgUDLChange}%
            </BadgeDelta>
            <BadgeDelta deltaType={insights.avgDDHChangeDeltaType}>
              {insights.avgDDHChange}%
            </BadgeDelta>
          </Flex>
        </TableFooterCell>
        {showCurrentWeekMonthRange && (
          <>
            <TableFooterCell className="text-left"></TableFooterCell>
            <TableFooterCell className="text-left"></TableFooterCell>
            <TableFooterCell className="text-left"></TableFooterCell>
            <TableFooterCell className="text-left"></TableFooterCell>
            <TableFooterCell className="text-right"></TableFooterCell>
            <TableFooterCell className="text-right"></TableFooterCell>
          </>
        )}
        <TableFooterCell className="text-left"></TableFooterCell>
        <TableFooterCell className="text-left"></TableFooterCell>
        <TableFooterCell className="text-left"></TableFooterCell>
        <TableFooterCell className="text-left"></TableFooterCell>
        <TableFooterCell className="text-right"></TableFooterCell>
        <TableFooterCell className="text-right"></TableFooterCell>
        {showMovingAverages && (
          <>
            <TableFooterCell className="text-left"></TableFooterCell>
            <TableFooterCell className="text-right"></TableFooterCell>
          </>
        )}
        <TableFooterCell className="text-left"></TableFooterCell>
        <TableFooterCell className="text-right"></TableFooterCell>
        <TableFooterCell className="text-right"></TableFooterCell>
      </TableRow>
    </TableFoot>
  );
}

export default memo(StockTableFooter);
