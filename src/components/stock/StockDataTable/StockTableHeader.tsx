import { memo } from "react";
import {
  TableHead,
  TableHeaderCell,
  TableRow,
  Flex,
} from "@tremor/react";
import SortableColumn from "../../shared/SortableColumn";

interface StockTableHeaderProps {
  showFundamentals: boolean;
  showYearlyChange: boolean;
  showMovingAverages: boolean;
  showCurrentWeekMonthRange: boolean;
  onSortItems: (key: string, dir: string) => void;
}

function StockTableHeader({
  showFundamentals,
  showYearlyChange,
  showMovingAverages,
  showCurrentWeekMonthRange,
  onSortItems,
}: StockTableHeaderProps) {
  return (
    <TableHead>
      <TableRow className="bg-tremor-background-muted dark:bg-dark-tremor-background-muted">
        <TableHeaderCell>Details</TableHeaderCell>
        <TableHeaderCell className="text-right">
          <SortableColumn
            id="currentPriceExact"
            title="Price"
            onSortItems={onSortItems}
          />
        </TableHeaderCell>
        <TableHeaderCell className="text-right">
          <SortableColumn
            id="priceToEarningsExact"
            title="PE"
            onSortItems={onSortItems}
          />
        </TableHeaderCell>
        <TableHeaderCell className="text-right" title="Forward PE">
          <SortableColumn
            id="forwardPriceToEarningsExact"
            title="F-PE"
            onSortItems={onSortItems}
          />
        </TableHeaderCell>
        {showFundamentals && (
          <>
            <TableHeaderCell
              className="text-right"
              title="Price Earning To Growth Ratio"
            >
              <SortableColumn
                id="priceEarningGrowthExact"
                title="PEG"
                onSortItems={onSortItems}
              />
            </TableHeaderCell>
            <TableHeaderCell className="text-right" title="Price To Book Ratio">
              <SortableColumn
                id="priceBookTTMExact"
                title="PB"
                onSortItems={onSortItems}
              />
            </TableHeaderCell>
            <TableHeaderCell
              className="text-right"
              title="Price To Sales Ratio"
            >
              <SortableColumn
                id="priceToSalesExact"
                title="PS"
                onSortItems={onSortItems}
              />
            </TableHeaderCell>
            <TableHeaderCell className="text-right" title="Dividend Yield">
              <SortableColumn
                id="dividendYieldExact"
                title="DY"
                onSortItems={onSortItems}
              />
            </TableHeaderCell>
            <TableHeaderCell className="text-right" title="Current Ratio">
              <SortableColumn
                id="currentRatioExact"
                title="CR"
                onSortItems={onSortItems}
              />
            </TableHeaderCell>
            <TableHeaderCell
              className="text-right"
              title="Debt to Equity Ratio"
            >
              <SortableColumn
                id="debtToEquityRatioExact"
                title="DE"
                onSortItems={onSortItems}
              />
            </TableHeaderCell>
            <TableHeaderCell
              className="text-right"
              title="Earning Per Share (Diluted)"
            >
              <SortableColumn
                id="earningPerShareDilutedTTMPerExact"
                title="EPS-D"
                onSortItems={onSortItems}
              />
            </TableHeaderCell>
            <TableHeaderCell
              className="text-right"
              title="Earning per Share (Diluted) Growth"
            >
              <SortableColumn
                id="earningPerShareDilutedTTMGrowthExact"
                title="EPS-DG"
                onSortItems={onSortItems}
              />
            </TableHeaderCell>
            <TableHeaderCell className="text-right" title="Revenue Growth">
              <SortableColumn
                id="totalRevenueGrowthTTMExact"
                title="RG"
                onSortItems={onSortItems}
              />
            </TableHeaderCell>
            <TableHeaderCell className="text-right" title="Return on Equity">
              <SortableColumn
                id="returnOnEquityExact"
                title="ROE"
                onSortItems={onSortItems}
              />
            </TableHeaderCell>
          </>
        )}
        <TableHeaderCell className="text-right">
          <SortableColumn
            id="preMarketChangeExact"
            title="Pre-CG"
            onSortItems={onSortItems}
          />
        </TableHeaderCell>
        <TableHeaderCell className="text-right">
          <SortableColumn
            id="dayChangeExact"
            title="1D-CG"
            onSortItems={onSortItems}
          />
        </TableHeaderCell>
        <TableHeaderCell className="text-right">
          <SortableColumn
            id="weekChangeExact"
            title="1W-CG"
            onSortItems={onSortItems}
          />
        </TableHeaderCell>
        <TableHeaderCell className="text-right">
          <SortableColumn
            id="monthChangeExact"
            title="1M-CG"
            onSortItems={onSortItems}
          />
        </TableHeaderCell>
        <TableHeaderCell className="text-right">
          <SortableColumn
            id="threeMonthChangeExact"
            title="3M-CG"
            onSortItems={onSortItems}
          />
        </TableHeaderCell>
        <TableHeaderCell className="text-right">
          <SortableColumn
            id="sixMonthChangeExact"
            title="6M-CG"
            onSortItems={onSortItems}
          />
        </TableHeaderCell>
        {showYearlyChange && (
          <>
            <TableHeaderCell className="text-right">
              <SortableColumn
                id="yearChangeExact"
                title="1Y-CG"
                onSortItems={onSortItems}
              />
            </TableHeaderCell>
            <TableHeaderCell className="text-right">
              <SortableColumn
                id="fiveYearChangeExact"
                title="5Y-CG"
                onSortItems={onSortItems}
              />
            </TableHeaderCell>
          </>
        )}
        <TableHeaderCell
          className="text-left"
          title="Up From Day Low and Down From Day High"
        >
          <SortableColumn
            start
            id="upFromDayLowExact"
            downId="downFromDayHighExact"
            title="Up 1D-L / Down 1D-H"
            onSortItems={onSortItems}
          />
        </TableHeaderCell>
        {showCurrentWeekMonthRange && (
          <>
            <TableHeaderCell
              className="text-right"
              title="Up From Current Week Low and Down From Current Week High"
            >
              <SortableColumn
                id="upFromCurrentWeekLowExact"
                downId="downFromCurrentWeekHighExact"
                title="Up 1W-L / Down 1W-H"
                onSortItems={onSortItems}
              />
            </TableHeaderCell>
            <TableHeaderCell
              className="text-left"
              title="Up From Current Month Low and Down From Current Month High"
            >
              <SortableColumn
                start
                id="upFromCurrentMonthLowExact"
                downId="downFromCurrentMonthHighExact"
                title="Up 1M-L / Down 1M-H"
                onSortItems={onSortItems}
              />
            </TableHeaderCell>
            <TableHeaderCell
              className="text-right"
              title="Up From Three Month Low and Down From Three Month High"
            >
              <SortableColumn
                id="upFromThreeMonthLowExact"
                downId="downFromThreeMonthHighExact"
                title="Up 3M-L / Down 3M-H"
                onSortItems={onSortItems}
              />
            </TableHeaderCell>
            <TableHeaderCell
              className="text-left"
              title="Up From Six Month Low and Down From Six Month High"
            >
              <SortableColumn
                start
                id="upFromSixMonthLowExact"
                downId="downFromSixMonthHighExact"
                title="Up 6M-L / Down 6M-H"
                onSortItems={onSortItems}
              />
            </TableHeaderCell>
          </>
        )}
        <TableHeaderCell
          className="text-right"
          title="Up From One Year Low and Down From One Year High"
        >
          <SortableColumn
            id="upFromOneYearLowExact"
            downId="downFromOneYearHighExact"
            title="Up 1Y-L / Down 1Y-H"
            onSortItems={onSortItems}
          />
        </TableHeaderCell>
        <TableHeaderCell className="text-left">
          <SortableColumn
            start
            id="marketCapExact"
            title="MCap"
            onSortItems={onSortItems}
          />
        </TableHeaderCell>
        <TableHeaderCell title="Free Float Shares">
          <SortableColumn
            id="freeFloatSharesPerExact"
            title="FFS"
            onSortItems={onSortItems}
          />
        </TableHeaderCell>
        <TableHeaderCell className="text-left">Avg Volume</TableHeaderCell>
        <TableHeaderCell className="text-right">
          <SortableColumn
            id="volumeChangedBy"
            title="Volume"
            onSortItems={onSortItems}
          />
        </TableHeaderCell>
        {showMovingAverages && (
          <>
            <TableHeaderCell className="text-left">
              SMA (50, 100 and 200)
            </TableHeaderCell>
            <TableHeaderCell className="text-right">
              EMA (50, 100 and 200)
            </TableHeaderCell>
          </>
        )}
        <TableHeaderCell>
          <Flex justifyContent="between">
            <div>Sector</div>
            <div>Highlights</div>
          </Flex>
        </TableHeaderCell>
        <TableHeaderCell className="text-right">
          <SortableColumn
            id="currentDayRangeValueInPercent"
            title="Day Range"
            onSortItems={onSortItems}
          />
        </TableHeaderCell>
        <TableHeaderCell className="text-right">Details</TableHeaderCell>
      </TableRow>
    </TableHead>
  );
}

export default memo(StockTableHeader);
