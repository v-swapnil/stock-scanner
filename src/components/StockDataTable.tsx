import { Table, TableBody } from "@tremor/react";
import { memo } from "react";
import { TSectorPriceEarningRatio, TStockDataItem } from "@/lib/types";
import StockTableHeader from "./stock/StockDataTable/StockTableHeader";
import StockTableRow from "./stock/StockDataTable/StockTableRow";
import StockTableFooter from "./stock/StockDataTable/StockTableFooter";
import { useStockTableInsights } from "./stock/StockDataTable/useStockTableInsights";

interface IStockDataTableProps {
  filteredWithFavorites: Array<TStockDataItem>;
  priceEarningBySector: Record<string, TSectorPriceEarningRatio>;
  showFundamentals: boolean;
  showYearlyChange: boolean;
  showMovingAverages: boolean;
  showCurrentWeekMonthRange: boolean;
  // functions
  onSortItems: (key: string, dir: string) => void;
  onChangeSector: (sector: string, isIndustry?: boolean) => void;
  onChangeFavorites: (stockData: TStockDataItem) => void;
}

function StockDataTable({
  filteredWithFavorites,
  showFundamentals,
  showYearlyChange,
  showMovingAverages,
  showCurrentWeekMonthRange = true,
  // functions
  onSortItems,
  onChangeSector,
  onChangeFavorites,
}: IStockDataTableProps) {
  const insights = useStockTableInsights(filteredWithFavorites);

  return (
    <Table
      className="mt-4 stock-details-table dark:bg-gray-950"
    >
      <StockTableHeader
        showFundamentals={showFundamentals}
        showYearlyChange={showYearlyChange}
        showMovingAverages={showMovingAverages}
        showCurrentWeekMonthRange={showCurrentWeekMonthRange}
        onSortItems={onSortItems}
      />
      <TableBody>{filteredWithFavorites.map((item) => (
        <StockTableRow
          key={item.name}
          item={item}
          showFundamentals={showFundamentals}
          showYearlyChange={showYearlyChange}
          showMovingAverages={showMovingAverages}
          showCurrentWeekMonthRange={showCurrentWeekMonthRange}
          onChangeSector={onChangeSector}
          onChangeFavorites={onChangeFavorites}
        />
      ))}
      </TableBody>
      <StockTableFooter
        insights={insights}
        showFundamentals={showFundamentals}
        showYearlyChange={showYearlyChange}
        showMovingAverages={showMovingAverages}
        showCurrentWeekMonthRange={showCurrentWeekMonthRange}
      />
    </Table>
  );
}

export default memo(StockDataTable);
