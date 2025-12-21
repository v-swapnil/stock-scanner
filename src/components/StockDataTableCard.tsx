"use client";

import { Card, Flex } from "@tremor/react";
import axios from "axios";
import { memo, useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import IndexInsights from "./market/IndexInsights";
import { toFixedIntegerNumber } from "@/lib/common";
import StockDataTable from "./StockDataTable";
import {
  TConsolidatedContributors,
  TStockDataItem,
  TSectorPriceEarningRatio,
} from "@/lib/types";
import { useStockGroups } from "./stock/StockDataTableCard/useStockGroups";
import { useIndexData } from "./stock/StockDataTableCard/useIndexData";
import StockFilters from "./stock/StockDataTableCard/StockFilters";

interface IStockDataTableCardProps {
  data: Array<TStockDataItem>;
  priceEarningBySector: Record<string, TSectorPriceEarningRatio>;
}

function StockDataTableCard({
  data,
  priceEarningBySector,
}: IStockDataTableCardProps) {
  const [filtered, setFiltered] = useState<Array<TStockDataItem>>(data);
  const [selectedViews, setSelectedViews] = useState(["Basic"]);

  const marketSentiment = useMemo(() => {
    if (!data.length) return "Neutral";

    let positive = 0;
    let negative = 0;

    data.forEach((item) => {
      if (item.dayChangeExact === 0) return;
      if (item.dayChangeExact > 0) positive++;
      else negative++;
    });

    const positiveRatio = positive / data.length;
    const negativeRatio = negative / data.length;

    if (positiveRatio > 0.6) return "Positive";
    if (negativeRatio > 0.6) return "Negative";
    return "Neutral";
  }, [data]);

  const { fnoStocks, favoriteStocks, setFavoriteStocks } = useStockGroups();

  const { niftyMetrics, niftyBankMetrics } = useIndexData();

  const [isPending, startTransition] = useTransition();

  const filteredWithFavorites = useMemo(() => {
    return filtered.map((item) => ({
      ...item,
      isStarred: favoriteStocks.includes(item.name),
      isFnO: fnoStocks.includes(item.name),
      isIndex: item.indexes.length > 0,
    }));
  }, [filtered, favoriteStocks, fnoStocks]);

  const marketContributors = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.dayChangeExact - a.dayChangeExact);
    const positiveContributors = sorted
      .slice(0, 4)
      .filter((item) => item.dayChangeExact > 0);
    const negativeContributors = sorted
      .slice(sorted.length - 4, sorted.length)
      .filter((item) => item.dayChangeExact < 0)
      .reverse();
    let contributors: TConsolidatedContributors = [];
    if (positiveContributors.length >= negativeContributors.length) {
      contributors = positiveContributors.map((item, index) => ({
        pointChangeSuffix: "%",
        // Positive Symbol
        positiveSymbol: item.name,
        positivePointChanged: item.dayChange,
        // Negative Symbol
        negativeSymbol: negativeContributors[index]?.name,
        negativePointChanged: negativeContributors[index]?.dayChange,
      }));
    } else {
      contributors = negativeContributors.map((item, index) => ({
        pointChangeSuffix: "%",
        // Positive Symbol
        positiveSymbol: positiveContributors[index]?.name,
        positivePointChanged: positiveContributors[index]?.dayChange,
        // Negative Symbol
        negativeSymbol: item.name,
        negativePointChanged: item.dayChange,
      }));
    }
    return contributors;
  }, [data]);

  const marketAdvanceDecline = useMemo(() => {
    const total = data.length;
    if (!total) return 0;
    const negative = data.filter((item) => item.dayChangeExact < 0).length;
    const positive = total - negative;
    return toFixedIntegerNumber((positive / total) * 100);
  }, [data]);

  const onChangeViews = useCallback((newViews: Array<string>) => {
    setSelectedViews(Array.from(new Set(["Basic", ...newViews])));
  }, []);

  const onSortItems = useCallback((keyName: string, direction: string) => {
    setFiltered((prevFiltered) =>
      [...prevFiltered].sort((a: any, b: any) =>
        direction === "desc" ? b[keyName] - a[keyName] : a[keyName] - b[keyName],
      ),
    );
  }, []);

  const onChangeFavorites = useCallback(async (stockData: TStockDataItem) => {
    const payload = { stockId: stockData.name };
    const response = await axios.patch("/api/favorite-stocks", payload);
    setFavoriteStocks(response.data);
  }, []);

  const router = useRouter();
  const onRefreshData = useCallback(() => {
    startTransition(() => {
      // Refresh the current route and fetch new data from the server without
      // losing client-side browser or React state.
      router.refresh();
    });
  }, [router]);

  const showFundamentals = selectedViews.includes("Fundamentals");
  const showYearlyChange = selectedViews.includes("YearlyChange");
  const showMovingAverages = selectedViews.includes("MovingAverages");
  const showCurrentWeekMonthRange = selectedViews.includes("UFLandDFH");

  return (
    <>
      <Flex justifyContent="between" className="px-2">
        <IndexInsights
          title="Market"
          price={marketSentiment}
          pointsChanged={null}
          contributors={marketContributors}
          advanceDecline={marketAdvanceDecline}
          canRefresh
          isRefreshing={isPending}
          onRefresh={onRefreshData}
        />
        <IndexInsights
          title="Nifty"
          price={niftyMetrics.price || "-"}
          pointsChanged={niftyMetrics.pointChanged || null}
          contributors={niftyMetrics.contributors || []}
          advanceDecline={niftyMetrics.advanceDecline || null}
        />
        <IndexInsights
          title="Bank Nifty"
          price={niftyBankMetrics.price || "-"}
          pointsChanged={niftyBankMetrics.pointChanged || null}
          contributors={niftyBankMetrics.contributors || []}
          advanceDecline={niftyBankMetrics.advanceDecline || null}
        />
      </Flex>
      <Card className="mt-4 mb-4 w-[calc(100%-3rem)]">
        <StockFilters
          data={data}
          favoriteStocks={favoriteStocks}
          fnoStocks={fnoStocks}
          filtered={filtered}
          filteredWithFavorites={filteredWithFavorites}
          setFiltered={setFiltered}
          selectedViews={selectedViews}
          onChangeViews={onChangeViews}
        />
        <StockDataTable
          filteredWithFavorites={filteredWithFavorites}
          priceEarningBySector={priceEarningBySector}
          showCurrentWeekMonthRange={showCurrentWeekMonthRange}
          showFundamentals={showFundamentals}
          showYearlyChange={showYearlyChange}
          showMovingAverages={showMovingAverages}
          // functions
          onSortItems={onSortItems}
          onChangeSector={() => {}} // TODO: FIXME: this
          onChangeFavorites={onChangeFavorites}
        />
      </Card>
    </>
  );
}

export default memo(StockDataTableCard);
