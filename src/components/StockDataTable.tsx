import {
  RiArrowDownSLine,
  RiArrowRightLine,
  RiArrowUpSLine,
  RiStarFill,
  RiStarLine,
} from "@remixicon/react";
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
import { memo, useCallback, useMemo, useState } from "react";
import {
  TCompareFn,
  TSectorPriceEarningRatio,
  TStockDataItem,
} from "@/lib/types";
import StockHighlights from "./StockHighlights";
import classNames from "classnames";
import BadgeColorWithThreshold from "./BadgeColorWithThreshold";
import { getDeltaTypeFromChangePercentage, toFixedNumber } from "@/lib/common";

function SortableColumn({ id, title, start, onSortItems }: any) {
  const [sortDirection, setSortDirection] = useState("");

  const onChangeSort = useCallback(() => {
    const newSortDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newSortDirection);
    onSortItems(id, newSortDirection);
  }, [id, sortDirection, onSortItems]);

  return (
    <Flex
      justifyContent={start ? "start" : "end"}
      onClick={onChangeSort}
      className="cursor-pointer"
    >
      {title}
      <div className="-space-y-2 ml-2">
        <RiArrowUpSLine
          className={classNames(
            "h-4 w-4 text-tremor-content-strong dark:text-dark-tremor-content-strong",
            sortDirection === "desc" ? "opacity-30" : ""
          )}
          aria-hidden={true}
        />
        <RiArrowDownSLine
          className={classNames(
            "h-4 w-4 text-tremor-content-strong dark:text-dark-tremor-content-strong",
            sortDirection === "asc" ? "opacity-30" : ""
          )}
          aria-hidden={true}
        />
      </div>
    </Flex>
  );
}

function MovingAverageBadge({ className, maPrice, maDiffPercentage }: any) {
  const deltaType =
    maDiffPercentage < 0.5 && maDiffPercentage > -0.5
      ? "unchanged"
      : maDiffPercentage >= 0.5
      ? "increase"
      : "decrease";
  return (
    <BadgeDelta className={className} deltaType={deltaType}>
      {maPrice} ({maDiffPercentage}%)
    </BadgeDelta>
  );
}

interface IStockDataTableProps {
  filteredWithFavorites: Array<TStockDataItem>;
  priceEarningBySector: Record<string, TSectorPriceEarningRatio>;
  showFundamentals: boolean;
  showYearlyChange: boolean;
  showMovingAverages: boolean;
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
  // functions
  onSortItems,
  onChangeSector,
  onChangeFavorites,
}: IStockDataTableProps) {
  const insights = useMemo(() => {
    let totalPriceEarningRatio = 0;
    let totalPreMarketChange = 0;
    let totalDayChange = 0;
    let totalWeekChange = 0;
    let totalMonthChange = 0;
    let totalThreeMonthChange = 0;
    let totalSixMonthChange = 0;

    filteredWithFavorites.forEach((item) => {
      totalPriceEarningRatio += item.priceEarningTTMExact || 0;
      totalPreMarketChange += item.preMarketChangeExact;
      totalDayChange += item.dayChangeExact;
      totalWeekChange += item.weekChangeExact;
      totalMonthChange += item.monthChangeExact;
      totalThreeMonthChange += item.threeMonthChangeExact;
      totalSixMonthChange += item.sixMonthChangeExact;
    });

    const averages = {
      avgPriceEarningRatio: toFixedNumber(
        totalPriceEarningRatio / filteredWithFavorites.length
      ),
      avgPreMarketChange: toFixedNumber(
        totalPreMarketChange / filteredWithFavorites.length
      ),
      avgDayChange: toFixedNumber(
        totalDayChange / filteredWithFavorites.length
      ),
      avgWeekChange: toFixedNumber(
        totalWeekChange / filteredWithFavorites.length
      ),
      avgMonthChange: toFixedNumber(
        totalMonthChange / filteredWithFavorites.length
      ),
      avgThreeMonthChange: toFixedNumber(
        totalThreeMonthChange / filteredWithFavorites.length
      ),
      avgSixMonthChange: toFixedNumber(
        totalSixMonthChange / filteredWithFavorites.length
      ),
    };

    return {
      ...averages,
      avgPriceEarningRatioExact: parseFloat(averages.avgPriceEarningRatio),
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
    };
  }, [filteredWithFavorites]);

  return (
    <Table className="mt-4 stock-details-table">
      <TableHead>
        <TableRow className="bg-tremor-background-muted dark:bg-dark-tremor-background-muted">
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell className="text-right">
            <SortableColumn
              id="currentPriceExact"
              title="Price"
              onSortItems={onSortItems}
            />
          </TableHeaderCell>
          <TableHeaderCell className="text-right">
            <SortableColumn
              id="priceEarningTTMExact"
              title="PE"
              onSortItems={onSortItems}
            />
          </TableHeaderCell>
          {/* <TableHeaderCell className="text-right">
            <SortableColumn
              id="priceEarningDiffExact"
              title="PE Diff"
              onSortItems={onSortItems}
            />
          </TableHeaderCell> */}
          {showFundamentals && (
            <>
              <TableHeaderCell className="text-right">
                <SortableColumn
                  id="priceEarningGrowthExact"
                  title="PEG"
                  onSortItems={onSortItems}
                />
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                <SortableColumn
                  id="priceBookTTMExact"
                  title="PB"
                  onSortItems={onSortItems}
                />
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                <SortableColumn
                  id="dividendYieldExact"
                  title="DY"
                  onSortItems={onSortItems}
                />
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                EPS-D (G)
              </TableHeaderCell>
              <TableHeaderCell className="text-right">RG</TableHeaderCell>
              <TableHeaderCell className="text-right">ROE</TableHeaderCell>
            </>
          )}
          {/* <TableHeaderCell className="text-right">
            <SortableColumn
              id="preMarketChangeExact"
              title="Pre-CG"
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
              title="6M Change"
              onSortItems={onSortItems}
            />
          </TableHeaderCell>
          {showYearlyChange && (
            <>
              <TableHeaderCell className="text-right">
                <SortableColumn
                  id="oneYearChangeExact"
                  title="1Y Change"
                  onSortItems={onSortItems}
                />
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                <SortableColumn
                  id="fiveYearChangeExact"
                  title="5Y Change"
                  onSortItems={onSortItems}
                />
              </TableHeaderCell>
            </>
          )}
          <TableHeaderCell className="text-left">
            <SortableColumn
              start
              id="upFromOneYearLowExact"
              title="Up 6M / 1Y Low"
              onSortItems={onSortItems}
            />
          </TableHeaderCell>
          <TableHeaderCell className="text-right">
            <SortableColumn
              id="downFromOneYearHighExact"
              title="Down 6M / 1Y High"
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
          <TableHeaderCell>
            <SortableColumn
              id="freeFloatSharesPerExact"
              title="FFS %"
              onSortItems={onSortItems}
            />
          </TableHeaderCell>
          <TableHeaderCell className="text-left">Avg Volume</TableHeaderCell>
          <TableHeaderCell className="text-right">Volume</TableHeaderCell>
          <TableHeaderCell>Sector</TableHeaderCell>
          {showMovingAverages && (
            <>
              <TableHeaderCell className="text-right">
                SMA (50, 100 and 200)
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                EMA (50, 100 and 200)
              </TableHeaderCell>
            </>
          )}
          <TableHeaderCell className="text-right">Highlights</TableHeaderCell>
          <TableHeaderCell className="text-right">Day Range</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {filteredWithFavorites.map((item) => (
          <TableRow key={item.name}>
            <TableCell>
              <Flex justifyContent="start">
                {item.description} ({item.name})
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
                value={item.priceEarningTTMExact}
                positiveThreshold={25}
                neutralThreshold={75}
                compareFn={TCompareFn.LTE}
              >
                <div className="flex items-center gap-1">
                  {item.priceEarningTTM}
                  {/* <RiArrowRightLine size={12} /> */}
                  {/* {item.forwardPriceEarning} */}
                </div>
              </BadgeColorWithThreshold>
            </TableCell>
            {/* <TableCell className="text-right">
              <Badge
                color={
                  item.priceEarningDiffExact > 2.5
                    ? "rose"
                    : item.priceEarningDiffExact > 0
                    ? "orange"
                    : "emerald"
                }
              >
                {item.priceEarningDiff}
              </Badge>
            </TableCell> */}
            {showFundamentals && (
              <>
                <TableCell className="text-right">
                  <Badge
                    color={
                      item.priceEarningGrowthExact <= 2 ? "emerald" : "rose"
                    }
                  >
                    {item.priceEarningGrowth}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    color={item.priceBookTTMExact <= 3 ? "emerald" : "rose"}
                  >
                    {item.priceBookTTM}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    color={
                      item.dividendYieldExact >= 8
                        ? "emerald"
                        : item.dividendYieldExact >= 4
                        ? "orange"
                        : "rose"
                    }
                  >
                    {item.dividendYield ? item.dividendYield + "%" : ""}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    color={
                      item.earningPerShareDilutedTTMGrowthExact >= 10
                        ? "emerald"
                        : item.earningPerShareDilutedTTMGrowthExact >= 0
                        ? "orange"
                        : "rose"
                    }
                  >
                    {item.earningPerShareDilutedTTM}
                    {item.earningPerShareDilutedTTMGrowth
                      ? " (" + item.earningPerShareDilutedTTMGrowth + "%)"
                      : ""}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    color={
                      item.totalRevenueGrowthTTMExact >= 15
                        ? "emerald"
                        : item.totalRevenueGrowthTTMExact >= 0
                        ? "orange"
                        : "rose"
                    }
                  >
                    {item.totalRevenueGrowthTTM
                      ? item.totalRevenueGrowthTTM + "%"
                      : ""}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    color={
                      item.returnOnEquityExact >= 15
                        ? "emerald"
                        : item.returnOnEquityExact >= 0
                        ? "orange"
                        : "rose"
                    }
                  >
                    {item.returnOnEquity ? item.returnOnEquity + "%" : ""}
                  </Badge>
                </TableCell>
              </>
            )}
            {/* <TableCell className="text-right">
              <BadgeDelta
                deltaType={item.preMarketChangeDeltaType}
                isIncreasePositive={true}
              >
                {item.preMarketChange}%
              </BadgeDelta>
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
                {item.upFromSixMonthLow}%
              </BadgeDelta>
              <BadgeDelta deltaType="increase">
                {item.upFromOneYearLow}%
              </BadgeDelta>
            </TableCell>
            <TableCell className="text-right">
              <BadgeDelta deltaType="decrease" className="mr-2">
                {item.downFromSixMonthHigh}%
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
              <Flex justifyContent="end">
                {item.volumeIncreasedBy ? (
                  <BadgeDelta deltaType="increase">
                    {item.volume} ({item.volumeIncreasedBy}%)
                  </BadgeDelta>
                ) : (
                  <Badge color="gray">{item.volume}</Badge>
                )}
              </Flex>
            </TableCell>
            <TableCell>
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
            </TableCell>
            {showMovingAverages && (
              <>
                <TableCell className="text-right">
                  <MovingAverageBadge
                    className="mr-2"
                    maPrice={item.fiftyDaySMA}
                    maDiffPercentage={item.fiftyDaySMADiff}
                  />
                  <MovingAverageBadge
                    className="mr-2"
                    maPrice={item.hundredDaySMA}
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
            <TableCell className="text-right">
              <StockHighlights highlights={item.consolidatedHighlights} />
            </TableCell>
            <TableCell className="text-right">
              <StockRangeBar
                fixedWidth
                low={item.low}
                high={item.high}
                current={item.currentPriceExact}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFoot>
        <TableRow className="bg-tremor-background-muted dark:bg-dark-tremor-background-muted">
          <TableFooterCell>Average</TableFooterCell>
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
          {/* <TableFooterCell className="text-right"></TableFooterCell> */}
          {showFundamentals && (
            <>
              <TableFooterCell className="text-right">PEG AVG</TableFooterCell>
              <TableFooterCell className="text-right">PB AVG</TableFooterCell>
              <TableFooterCell className="text-right">DY AVG</TableFooterCell>
              EPS-D (G) AVG
              <TableFooterCell className="text-right">RG AVG</TableFooterCell>
              <TableFooterCell className="text-right">ROE AVG</TableFooterCell>
            </>
          )}
          <TableFooterCell className="text-right">
            <BadgeDelta deltaType={insights.avgDayChangeDeltaType}>
              {insights.avgDayChange}
            </BadgeDelta>
          </TableFooterCell>
          <TableFooterCell className="text-right">
            <BadgeDelta deltaType={insights.avgWeekChangeDeltaType}>
              {insights.avgWeekChange}
            </BadgeDelta>
          </TableFooterCell>
          <TableFooterCell className="text-right">
            <BadgeDelta deltaType={insights.avgMonthChangeDeltaType}>
              {insights.avgMonthChange}
            </BadgeDelta>
          </TableFooterCell>
          <TableFooterCell className="text-right">
            <BadgeDelta deltaType={insights.avgThreeMonthChangeDeltaType}>
              {insights.avgThreeMonthChange}
            </BadgeDelta>
          </TableFooterCell>
          <TableFooterCell className="text-right">
            <BadgeDelta deltaType={insights.avgThreeMonthChangeDeltaType}>
              {insights.avgSixMonthChange}
            </BadgeDelta>
          </TableFooterCell>
          {showYearlyChange && (
            <>
              <TableFooterCell className="text-right">6M AVG</TableFooterCell>
              <TableFooterCell className="text-right">1Y AVG</TableFooterCell>
              <TableFooterCell className="text-right">5Y AVG</TableFooterCell>
            </>
          )}
          <TableFooterCell className="text-left"></TableFooterCell>
          <TableFooterCell className="text-right"></TableFooterCell>
          <TableFooterCell className="text-left"></TableFooterCell>
          <TableFooterCell></TableFooterCell>
          <TableFooterCell className="text-left"></TableFooterCell>
          <TableFooterCell className="text-right"></TableFooterCell>
          <TableFooterCell></TableFooterCell>
          {showMovingAverages && (
            <>
              <TableFooterCell className="text-right"></TableFooterCell>
              <TableFooterCell className="text-right"></TableFooterCell>
            </>
          )}
          <TableFooterCell className="text-right"></TableFooterCell>
          <TableFooterCell></TableFooterCell>
        </TableRow>
      </TableFoot>
    </Table>
  );
}

export default memo(StockDataTable);
