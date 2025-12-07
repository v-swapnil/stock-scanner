import { useMemo } from "react";
import { TStockDataItem } from "@/lib/types";
import { getDeltaTypeFromChangePercentage, toFixedNumber } from "@/lib/common";

export function useStockTableInsights(filteredWithFavorites: Array<TStockDataItem>) {
  return useMemo(() => {
    let totalPriceEarningRatio = 0;
    let totalForwardPriceEarningRatio = 0;
    let totalPreMarketChange = 0;
    let totalDayChange = 0;
    let totalWeekChange = 0;
    let totalMonthChange = 0;
    let totalThreeMonthChange = 0;
    let totalSixMonthChange = 0;
    let totalOneYearChange = 0;
    let totalFiveYearChange = 0;
    let totalUDLChange = 0;
    let totalDDHChange = 0;

    filteredWithFavorites.forEach((item) => {
      totalPriceEarningRatio += item.priceToEarningsExact || 0;
      totalForwardPriceEarningRatio += item.forwardPriceToEarningsExact || 0;
      totalPreMarketChange += item.preMarketChangeExact;
      totalDayChange += item.dayChangeExact;
      totalWeekChange += item.weekChangeExact;
      totalMonthChange += item.monthChangeExact;
      totalThreeMonthChange += item.threeMonthChangeExact;
      totalSixMonthChange += item.sixMonthChangeExact;
      totalOneYearChange += item.yearChangeExact;
      totalFiveYearChange += item.fiveYearChangeExact;
      totalUDLChange += item.upFromDayLowExact;
      totalDDHChange += item.downFromDayHighExact;
    });

    const numberOfRows = filteredWithFavorites.length;
    const averages = {
      avgPriceEarningRatio: toFixedNumber(
        totalPriceEarningRatio / numberOfRows
      ),
      avgForwardPriceEarningRatio: toFixedNumber(
        totalForwardPriceEarningRatio / numberOfRows
      ),
      avgPreMarketChange: toFixedNumber(totalPreMarketChange / numberOfRows),
      avgDayChange: toFixedNumber(totalDayChange / numberOfRows),
      avgWeekChange: toFixedNumber(totalWeekChange / numberOfRows),
      avgMonthChange: toFixedNumber(totalMonthChange / numberOfRows),
      avgThreeMonthChange: toFixedNumber(totalThreeMonthChange / numberOfRows),
      avgSixMonthChange: toFixedNumber(totalSixMonthChange / numberOfRows),
      avgOneYearChange: toFixedNumber(totalOneYearChange / numberOfRows),
      avgFiveYearChange: toFixedNumber(totalFiveYearChange / numberOfRows),
      avgUDLChange: toFixedNumber(totalUDLChange / numberOfRows),
      avgDDHChange: toFixedNumber(-totalDDHChange / numberOfRows),
    };

    return {
      ...averages,
      avgPriceEarningRatioExact: parseFloat(averages.avgPriceEarningRatio),
      avgForwardPriceEarningRatioExact: parseFloat(
        averages.avgForwardPriceEarningRatio
      ),
      avgPreMarketChangeDeltaType: getDeltaTypeFromChangePercentage(
        averages.avgPreMarketChange
      ) as "increase" | "decrease" | "unchanged",
      avgDayChangeDeltaType: getDeltaTypeFromChangePercentage(
        averages.avgDayChange
      ) as "increase" | "decrease" | "unchanged",
      avgWeekChangeDeltaType: getDeltaTypeFromChangePercentage(
        averages.avgWeekChange
      ) as "increase" | "decrease" | "unchanged",
      avgMonthChangeDeltaType: getDeltaTypeFromChangePercentage(
        averages.avgMonthChange
      ) as "increase" | "decrease" | "unchanged",
      avgThreeMonthChangeDeltaType: getDeltaTypeFromChangePercentage(
        averages.avgThreeMonthChange
      ) as "increase" | "decrease" | "unchanged",
      avgSixMonthChangeDeltaType: getDeltaTypeFromChangePercentage(
        averages.avgSixMonthChange
      ) as "increase" | "decrease" | "unchanged",
      avgOneYearChangeDeltaType: getDeltaTypeFromChangePercentage(
        averages.avgOneYearChange
      ) as "increase" | "decrease" | "unchanged",
      avgFiveYearChangeDeltaType: getDeltaTypeFromChangePercentage(
        averages.avgFiveYearChange
      ) as "increase" | "decrease" | "unchanged",
      avgUDLChangeDeltaType: getDeltaTypeFromChangePercentage(
        averages.avgUDLChange
      ) as "increase" | "decrease" | "unchanged",
      avgDDHChangeDeltaType: getDeltaTypeFromChangePercentage(
        averages.avgDDHChange
      ) as "increase" | "decrease" | "unchanged",
    };
  }, [filteredWithFavorites]);
}
