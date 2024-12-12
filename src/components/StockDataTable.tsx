import { RiStarFill, RiStarLine } from "@remixicon/react";
import {
  Badge,
  BadgeDelta,
  Flex,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableFoot,
  TableFooterCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";
import StockRangeBar from "./StockRangeBar";
import { Fragment, memo, useEffect, useMemo, useRef } from "react";
import {
  TCompareFn,
  TSectorPriceEarningRatio,
  TStockDataItem,
} from "@/lib/types";
import StockHighlights from "./StockHighlights";
import BadgeColorWithThreshold from "./BadgeColorWithThreshold";
import { getDeltaTypeFromChangePercentage, toFixedNumber } from "@/lib/common";

import SortableColumn from "./SortableColumn";
import MovingAverageBadge from "./MovingAverageBadge";

import { VList, Virtualizer } from "virtua";

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
  priceEarningBySector,
  showFundamentals,
  showYearlyChange,
  showMovingAverages,
  showCurrentWeekMonthRange = true,
  // functions
  onSortItems,
  onChangeSector,
  onChangeFavorites,
}: IStockDataTableProps) {
  const insights = useMemo(() => {
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
      ),
      avgDayChangeDeltaType: getDeltaTypeFromChangePercentage(
        averages.avgDayChange
      ),
      avgWeekChangeDeltaType: getDeltaTypeFromChangePercentage(
        averages.avgWeekChange
      ),
      avgMonthChangeDeltaType: getDeltaTypeFromChangePercentage(
        averages.avgMonthChange
      ),
      avgThreeMonthChangeDeltaType: getDeltaTypeFromChangePercentage(
        averages.avgThreeMonthChange
      ),
      avgSixMonthChangeDeltaType: getDeltaTypeFromChangePercentage(
        averages.avgSixMonthChange
      ),
      avgOneYearChangeDeltaType: getDeltaTypeFromChangePercentage(
        averages.avgOneYearChange
      ),
      avgFiveYearChangeDeltaType: getDeltaTypeFromChangePercentage(
        averages.avgFiveYearChange
      ),
      avgUDLChangeDeltaType: getDeltaTypeFromChangePercentage(
        averages.avgUDLChange
      ),
      avgDDHChangeDeltaType: getDeltaTypeFromChangePercentage(
        averages.avgDDHChange
      ),
    };
  }, [filteredWithFavorites]);

  const parentRef = useRef(null);

  // const rowVirtualizer = useVirtualizer({
  //   count: filteredWithFavorites.length,
  //   getScrollElement: () => parentRef.current,
  //   estimateSize: () => 69,
  // });

  // const items = rowVirtualizer.getVirtualItems();

  // useEffect(() => {
  //   console.log("items >>> ", items);
  // }, [items]);

  const TableHeaderContent = (
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
            {/* <TableHeaderCell className="text-right" title="PE Diff">
            <SortableColumn
              id="priceEarningDiffExact"
              title="PE Diff"
              onSortItems={onSortItems}
            />
          </TableHeaderCell> */}
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
        {/* <TableHeaderCell className="text-right">
        <SortableColumn
          id="preMarketVolumeExact"
          title="Pre-Vol"
          onSortItems={onSortItems}
        />
       </TableHeaderCell> */}
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
        {/* <TableHeaderCell className="text-right" title="Down From Day High">
        <SortableColumn
          id="downFromDayHighExact"
          title="DDH"
          onSortItems={onSortItems}
        />
      </TableHeaderCell> */}
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
            {/* <TableHeaderCell
            className="text-right"
            title="Down From Current Week High"
          >
            <SortableColumn
              id="downFromCurrentWeekHighExact"
              title="DWH"
              onSortItems={onSortItems}
            />
          </TableHeaderCell> */}
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
            {/* <TableHeaderCell
            className="text-right"
            title="Down From Current Month High"
          >
            <SortableColumn
              id="downFromCurrentMonthHighExact"
              title="DMH"
              onSortItems={onSortItems}
            />
          </TableHeaderCell> */}
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
            {/* <TableHeaderCell
            className="text-right"
            title="Down From Three Month High"
          >
            <SortableColumn
              id="downFromThreeMonthHighExact"
              title="D3MH"
              onSortItems={onSortItems}
            />
          </TableHeaderCell> */}
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

  const renderTableRow = (item: TStockDataItem) => {
    return (
      <TableRow key={item.name}>
        <TableCell>
          <Flex justifyContent="start">
            {/* <Badge className="fixed-badge">{item.name}</Badge> */}
            {item.description}
            <Badge className="ml-2 fixed-badge-in-container">{item.name}</Badge>
            <BadgeColorWithThreshold
              className="ml-2"
              value={item.mCapType}
              positiveThreshold="Large"
              neutralThreshold="Mid"
            >
              {item.mCapType}
            </BadgeColorWithThreshold>
            {item.isFnO && (
              <Badge className="ml-2" color="purple">
                FnO
              </Badge>
            )}
            {item.isIndex && (
              <Badge className="ml-2" color="cyan">
                Index
              </Badge>
            )}
            <Icon
              className="cursor-pointer"
              onClick={() => onChangeFavorites(item)}
              icon={item.isStarred ? RiStarFill : RiStarLine}
              color="emerald"
            />
          </Flex>
        </TableCell>
        <TableCell className="text-right">
          <Badge color="gray">{item.currentPrice}</Badge>
        </TableCell>
        <TableCell className="text-right">
          <BadgeColorWithThreshold
            value={item.priceToEarningsExact}
            positiveThreshold={25}
            neutralThreshold={75}
            compareFn={TCompareFn.LTE}
          >
            {item.priceEarningTTM}
          </BadgeColorWithThreshold>
        </TableCell>
        <TableCell className="text-right">
          <Flex justifyContent="end">
            <BadgeColorWithThreshold
              value={item.forwardPriceToEarningsExact}
              positiveThreshold={25}
              neutralThreshold={75}
              compareFn={TCompareFn.LTE}
            >
              {item.forwardPriceEarning}
            </BadgeColorWithThreshold>
          </Flex>
        </TableCell>
        {showFundamentals && (
          <>
            {/* <TableCell className="text-right">
            <BadgeDelta
              deltaType={
                item.priceEarningDiffExact > 2.5
                  ? "decrease"
                  : item.priceEarningDiffExact < 0
                  ? "increase"
                  : "unchanged"
              }
            >
              {item.priceEarningDiff || "--"}
            </BadgeDelta>
          </TableCell> */}
            <TableCell className="text-right">
              <BadgeColorWithThreshold
                value={item.priceEarningGrowthExact}
                positiveThreshold={2}
                compareFn={TCompareFn.LTE}
              >
                {item.priceEarningGrowth}
              </BadgeColorWithThreshold>
            </TableCell>
            <TableCell className="text-right">
              <BadgeColorWithThreshold
                value={item.priceBookTTMExact}
                positiveThreshold={3}
                compareFn={TCompareFn.LTE}
              >
                {item.priceBookTTM}
              </BadgeColorWithThreshold>
            </TableCell>
            <TableCell className="text-right">
              <BadgeColorWithThreshold
                value={item.priceToSalesExact}
                positiveThreshold={2}
                compareFn={TCompareFn.LTE}
              >
                {item.priceToSales}
              </BadgeColorWithThreshold>
            </TableCell>
            <TableCell className="text-right">
              <BadgeColorWithThreshold
                value={item.dividendYieldExact}
                positiveThreshold={8}
                neutralThreshold={4}
                compareFn={TCompareFn.GTE}
              >
                {item.dividendYield ? item.dividendYield + "%" : ""}
              </BadgeColorWithThreshold>
            </TableCell>
            <TableCell className="text-right">
              <BadgeColorWithThreshold
                value={item.currentRatioExact}
                positiveThreshold={2}
                neutralThreshold={0}
                compareFn={TCompareFn.GTE}
              >
                {item.currentRatio}
              </BadgeColorWithThreshold>
            </TableCell>
            <TableCell className="text-right">
              <Badge color="gray">{item.debtToEquityRatio}</Badge>
            </TableCell>
            <TableCell className="text-right">
              <Badge>
                {item.earningPerShareDilutedTTM}{" "}
                {item.earningPerShareDilutedTTMPer
                  ? "(" + item.earningPerShareDilutedTTMPer + "%)"
                  : ""}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <BadgeColorWithThreshold
                value={item.earningPerShareDilutedTTMGrowthExact}
                positiveThreshold={10}
                neutralThreshold={0}
                compareFn={TCompareFn.GTE}
              >
                {item.earningPerShareDilutedTTMGrowth
                  ? item.earningPerShareDilutedTTMGrowth + "%"
                  : ""}
              </BadgeColorWithThreshold>
            </TableCell>
            <TableCell className="text-right">
              <BadgeColorWithThreshold
                value={item.totalRevenueGrowthTTMExact}
                positiveThreshold={15}
                neutralThreshold={0}
                compareFn={TCompareFn.GTE}
              >
                {item.totalRevenueGrowthTTM
                  ? item.totalRevenueGrowthTTM + "%"
                  : ""}
              </BadgeColorWithThreshold>
            </TableCell>
            <TableCell className="text-right">
              <BadgeColorWithThreshold
                value={item.returnOnEquityExact}
                positiveThreshold={15}
                neutralThreshold={0}
                compareFn={TCompareFn.GTE}
              >
                {item.returnOnEquity ? item.returnOnEquity + "%" : ""}
              </BadgeColorWithThreshold>
            </TableCell>
          </>
        )}
        <TableCell className="text-right">
          <BadgeDelta deltaType={item.preMarketChangeDeltaType}>
            {item.preMarketChange}%
          </BadgeDelta>
        </TableCell>
        {/* <TableCell className="text-right">
        <Badge color="gray">{item.preMarketVolume}</Badge>
       </TableCell> */}
        <TableCell className="text-right">
          <BadgeDelta deltaType={item.dayChangeDeltaType}>
            {item.dayChange}%
          </BadgeDelta>
        </TableCell>
        <TableCell className="text-right">
          <BadgeDelta deltaType={item.weekChangeDeltaType}>
            {item.weekChange}%
          </BadgeDelta>
        </TableCell>
        <TableCell className="text-right">
          <BadgeDelta deltaType={item.monthChangeDeltaType}>
            {item.monthChange}%
          </BadgeDelta>
        </TableCell>
        <TableCell className="text-right">
          <BadgeDelta deltaType={item.threeMonthChangeDeltaType}>
            {item.threeMonthChange}%
          </BadgeDelta>
        </TableCell>
        <TableCell className="text-right">
          <BadgeDelta deltaType={item.sixMonthChangeDeltaType}>
            {item.sixMonthChange}%
          </BadgeDelta>
        </TableCell>
        {showYearlyChange && (
          <>
            <TableCell className="text-right">
              <BadgeDelta deltaType={item.yearChangeDeltaType}>
                {item.yearChange}%
              </BadgeDelta>
            </TableCell>
            <TableCell className="text-right">
              <BadgeDelta deltaType={item.fiveYearChangeDeltaType}>
                {item.fiveYearChange}%
              </BadgeDelta>
            </TableCell>
          </>
        )}
        <TableCell className="text-left">
          <BadgeDelta deltaType="increase" className="mr-2">
            {item.upFromDayLow}%
          </BadgeDelta>
          <BadgeDelta deltaType="decrease">{item.downFromDayHigh}%</BadgeDelta>
        </TableCell>
        {/* <TableCell className="text-right">
        <BadgeDelta deltaType="decrease">
          {item.downFromDayHigh}%
        </BadgeDelta>
      </TableCell> */}
        {showCurrentWeekMonthRange && (
          <>
            <TableCell className="text-right">
              <BadgeDelta deltaType="increase" className="mr-2">
                {item.upFromCurrentWeekLow}%
              </BadgeDelta>
              <BadgeDelta deltaType="decrease">
                {item.downFromCurrentWeekHigh}%
              </BadgeDelta>
            </TableCell>
            {/* <TableCell className="text-right">
            <BadgeDelta deltaType="decrease">
              {item.downFromCurrentWeekHigh}%
            </BadgeDelta>
          </TableCell> */}
            <TableCell className="text-left">
              <BadgeDelta deltaType="increase" className="mr-2">
                {item.upFromCurrentMonthLow}%
              </BadgeDelta>
              <BadgeDelta deltaType="decrease">
                {item.downFromCurrentMonthHigh}%
              </BadgeDelta>
            </TableCell>
            {/* <TableCell className="text-right">
            <BadgeDelta deltaType="decrease">
              {item.downFromCurrentMonthHigh}%
            </BadgeDelta>
          </TableCell> */}
            <TableCell className="text-right">
              <BadgeDelta deltaType="increase" className="mr-2">
                {item.upFromThreeMonthLow}%
              </BadgeDelta>
              <BadgeDelta deltaType="decrease">
                {item.downFromThreeMonthHigh}%
              </BadgeDelta>
            </TableCell>
            {/* <TableCell className="text-right">
            <BadgeDelta deltaType="decrease">
              {item.downFromThreeMonthHigh}%
            </BadgeDelta>
          </TableCell> */}
            <TableCell className="text-left">
              <BadgeDelta deltaType="increase" className="mr-2">
                {item.upFromSixMonthLow}%
              </BadgeDelta>
              <BadgeDelta deltaType="decrease">
                {item.downFromSixMonthHigh}%
              </BadgeDelta>
            </TableCell>
          </>
        )}
        <TableCell className="text-right">
          <BadgeDelta deltaType="increase" className="mr-2">
            {item.upFromOneYearLow}%
          </BadgeDelta>
          <BadgeDelta deltaType="decrease">
            {item.downFromOneYearHigh}%
          </BadgeDelta>
        </TableCell>
        <TableCell className="text-left">
          <Badge color="gray">{item.marketCap}</Badge>
        </TableCell>
        <TableCell className="text-right">
          <BadgeColorWithThreshold
            value={item.freeFloatSharesPerExact}
            positiveThreshold={75}
            neutralThreshold={25}
            compareFn={TCompareFn.GTE}
          >
            {item.freeFloatSharesPer}%
          </BadgeColorWithThreshold>
        </TableCell>
        <TableCell className="text-left">
          <Badge color="gray">{item.tenDayAverageVolume}</Badge>
        </TableCell>
        <TableCell className="text-right">
          {item.volumeIncreasedBy ? (
            <BadgeDelta deltaType="increase">
              {item.volume} ({item.volumeIncreasedBy}%)
            </BadgeDelta>
          ) : item.volumeDecreasedBy ? (
            <BadgeDelta deltaType="decrease">
              {item.volume} ({item.volumeDecreasedBy}%)
            </BadgeDelta>
          ) : (
            <Badge color="gray">{item.volume}</Badge>
          )}
        </TableCell>
        {showMovingAverages && (
          <>
            <TableCell className="text-left">
              <MovingAverageBadge
                className="mr-2"
                maPrice={item.fiftyDaySMA}
                maDiffPercentage={item.fiftyDaySMADiff}
              />
              <MovingAverageBadge
                className="mr-2"
                maPrice={item.hundredDaySMA}
                FPE
                maDiffPercentage={item.hundredDaySMADiff}
              />
              <MovingAverageBadge
                className=""
                maPrice={item.twoHundredDaySMA}
                maDiffPercentage={item.twoHundredDaySMADiff}
              />
            </TableCell>
            <TableCell className="text-right">
              <MovingAverageBadge
                className="mr-2"
                maPrice={item.fiftyDayEMA}
                maDiffPercentage={item.fiftyDayEMADiff}
              />
              <MovingAverageBadge
                className="mr-2"
                maPrice={item.hundredDayEMA}
                maDiffPercentage={item.hundredDayEMADiff}
              />
              <MovingAverageBadge
                className=""
                maPrice={item.twoHundredDayEMA}
                maDiffPercentage={item.twoHundredDayEMADiff}
              />
            </TableCell>
          </>
        )}
        <TableCell>
          <Flex justifyContent="between" className="mr-2">
            <Flex justifyContent="start">
              <Badge
                className="cursor-pointer mr-2"
                color="sky"
                onClick={() => onChangeSector(item.sector, true)}
              >
                {item.sector}
              </Badge>
              <Badge
                className="cursor-pointer"
                color="sky"
                onClick={() => onChangeSector(item.industry)}
              >
                {item.industry}
              </Badge>
            </Flex>
            <StockHighlights highlights={item.consolidatedHighlights} />
          </Flex>
        </TableCell>
        <TableCell className="text-right">
          <StockRangeBar
            fixedWidth
            low={item.low}
            high={item.high}
            current={item.currentPriceExact}
            lowParsed={item.lowParsed}
            highParsed={item.highParsed}
            currentValueInPercent={item.currentDayRangeValueInPercent}
          />
        </TableCell>
        <TableCell>
          <Flex justifyContent="end">
            <Badge className="ml-2 fixed-badge-in-container on-left">
              {item.name}
            </Badge>
            {item.description}
          </Flex>
        </TableCell>
      </TableRow>
    );
  };

  const TableFooterContent = (
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
            {/* <TableFooterCell className="text-left"></TableFooterCell> */}
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
        {/* <TableFooterCell className="text-left"></TableFooterCell> */}
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
        {/* <TableFooterCell className="text-left">
        <BadgeDelta deltaType={insights.avgDDHChangeDeltaType}>
          {insights.avgDDHChange}%
        </BadgeDelta>
      </TableFooterCell> */}
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

  const virtualizationEnabled = false;

  if (virtualizationEnabled) {
    return (
      <div style={{ height: 800 }}>
        <Table
          ref={parentRef}
          className="mt-4 stock-details-table dark:bg-gray-950"
        >
          {TableHeaderContent}
          <Virtualizer
            count={filteredWithFavorites.length}
            as={TableBody}
            item={TableRow}
          >
            {(index) => renderTableRow(filteredWithFavorites[index], true)}
          </Virtualizer>
          {TableFooterContent}
        </Table>
      </div>
    );
  }

  return (
    <Table
      ref={parentRef}
      className="mt-4 stock-details-table dark:bg-gray-950"
    >
      {TableHeaderContent}
      <TableBody>{filteredWithFavorites.map(renderTableRow)}</TableBody>
      {TableFooterContent}
    </Table>
  );
}

export default memo(StockDataTable);
