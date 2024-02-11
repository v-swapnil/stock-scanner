import {
  RiSortNumberAsc,
  RiSortNumberDesc,
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
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
} from "@tremor/react";
import StockRangeBar from "./StockRangeBar";
import { memo, useCallback, useState } from "react";

function SortableColumn({ id, title, onSortItems }) {
  const [sortDirection, setSortDirection] = useState("asc");

  const onChangeSort = useCallback(() => {
    const newSortDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newSortDirection);
    onSortItems(id, newSortDirection);
  }, [id, sortDirection, onSortItems]);

  return (
    <Flex justifyContent="end">
      <Text>{title}</Text>
      <Icon
        size="sm"
        icon={sortDirection === "desc" ? RiSortNumberDesc : RiSortNumberAsc}
        // color={sortDirection === "desc" ? "emerald" : "rose"}
        color="gray"
        variant="simple"
        tooltip={
          "Sort " + (sortDirection === "asc" ? "Descending" : "Ascending")
        }
        className="ml-2 p-0 cursor-pointer"
        onClick={onChangeSort}
      />
    </Flex>
  );
}

function MovingAverageBadge({ className, maPrice, maDiffPercentage }) {
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

function StockHighlights({ highlights }) {
  const skip = ["Low Gains", "High Gains"];
  return (
    <Flex justifyContent="end" className="gap-2">
      {highlights.map((item) => {
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
}

const ComparatorMap: any = {
  lessThanEqualTo: (ref, value) => ref <= value,
  greaterThanEqualTo: (ref, value) => ref >= value,
  equalTo: (ref, value) => ref === value,
};

function BadgeWithConditionColor({
  value,
  refValue,
  comparator,
  firstCompareValue,
  secondCompareValue,
}) {
  const compareFn = ComparatorMap[comparator];
  const color = compareFn(refValue, firstCompareValue)
    ? "emerald"
    : typeof secondCompareValue !== "undefined" &&
      compareFn(refValue, secondCompareValue)
    ? "orange"
    : "rose";
  return <Badge color={color}>{value}</Badge>;
}

function StockDataTable({
  filteredWithFavorites,
  showFundamentals,
  showMonthlyChange,
  showYearlyChange,
  showMovingAverages,
  // functions
  onSortItems,
  onChangeSector,
  onChangeFavorites,
}) {
  return (
    <Table className="mt-4">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          {/* <TableHeaderCell>Sector</TableHeaderCell> */}
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
                  title="Div Yield"
                  onSortItems={onSortItems}
                />
              </TableHeaderCell>
              {/* <TableHeaderCell className="text-right">EPS</TableHeaderCell> */}
              <TableHeaderCell className="text-right">
                EPS (Diluted)
              </TableHeaderCell>
              <TableHeaderCell className="text-right">Revenue</TableHeaderCell>
              <TableHeaderCell className="text-right">ROE</TableHeaderCell>
              <TableHeaderCell className="text-right">
                <SortableColumn
                  id="preMarketChangeExact"
                  title="Pre-Change"
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
                Pre Volume
              </TableHeaderCell> */}
          {/* <TableHeaderCell className="text-right">
                <SortableColumn
                  id="changeFromOpen"
                  title="Open Change"
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
          {/* <TableHeaderCell className="text-right">
                Pre to Day Close
              </TableHeaderCell> */}
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
          {showMonthlyChange && (
            <>
              <TableHeaderCell className="text-right">
                <SortableColumn
                  id="sixMonthChangeExact"
                  title="6M Change"
                  onSortItems={onSortItems}
                />
              </TableHeaderCell>
            </>
          )}
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
          <TableHeaderCell className="text-right">
            <SortableColumn
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
          <TableHeaderCell>
            <SortableColumn
              id="marketCapExact"
              title="MCap"
              onSortItems={onSortItems}
            />
          </TableHeaderCell>
          <TableHeaderCell className="text-right">Avg Volume</TableHeaderCell>
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
          <TableHeaderCell>Day Range</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {filteredWithFavorites.map((item: any) => (
          <TableRow key={item.name}>
            <TableCell>
              <Flex justifyContent="start">
                {/* <span
                    data-tooltip-id={item.name}
                    data-tooltip-content={item.description}
                    data-tooltip-place="top"
                  >
                    {item.name}
                  </span>
                  <Tooltip id={item.name} /> */}
                {/* <Badge color="indigo" className="mr-2">{index + 1}</Badge> */}
                {item.description} ({item.name})
                <Badge
                  className="ml-2"
                  color={
                    item.mCapType === "Large"
                      ? "emerald"
                      : item.mCapType === "Mid"
                      ? "orange"
                      : "rose"
                  }
                >
                  {item.mCapType}
                </Badge>
                {item.isFnO && (
                  <Badge className="ml-2" color={"purple"}>
                    FnO
                  </Badge>
                )}
                {item.isIndex && (
                  <Badge className="ml-2" color={"cyan"}>
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
              <Badge color={"gray"}>{item.currentPrice}</Badge>
            </TableCell>
            <TableCell className="text-right">
              <Badge
                color={
                  item.priceEarningTTMExact <= 25
                    ? "emerald"
                    : item.priceEarningTTMExact <= 75
                    ? "orange"
                    : "rose"
                }
              >
                {item.priceEarningTTM}
              </Badge>
            </TableCell>
            {showFundamentals && (
              <>
                <TableCell className="text-right">
                  <Badge
                    color={item.priceEarningGrowth <= 2 ? "emerald" : "rose"}
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
                      item.dividendYield >= 8
                        ? "emerald"
                        : item.dividendYield >= 4
                        ? "orange"
                        : "rose"
                    }
                  >
                    {item.dividendYield ? item.dividendYield + "%" : ""}
                  </Badge>
                </TableCell>
                {/* <TableCell className="text-right">
                  <Badge color={"gray"}>{item.earningPerShareTTM}</Badge>
                </TableCell> */}
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
            <TableCell className="text-right">
              <BadgeDelta
                deltaType={item.preMarketChangeDeltaType}
                isIncreasePositive={true}
              >
                {item.preMarketChange}%
              </BadgeDelta>
            </TableCell>
            {/* <TableCell className="text-right">
                  <Badge color={"gray"}>{item.preMarketVolume}</Badge>
                </TableCell> */}
            {/* <TableCell className="text-right">
                  <BadgeDelta
                    deltaType={
                      item.changeFromOpen === 0
                        ? "unchanged"
                        : item.changeFromOpen > 0
                        ? "increase"
                        : "decrease"
                    }
                  >
                    {item.changeFromOpen}%
                  </BadgeDelta>
                </TableCell> */}
            <TableCell className="text-right">
              <BadgeDelta deltaType={item.dayChangeDeltaType}>
                {item.dayChange}%
              </BadgeDelta>
            </TableCell>
            {/* <TableCell className="text-right">
                  <PreToDayChangeMetrics
                    dayChange={item.dayChange}
                    preMarketChange={item.preMarketChange}
                  />
                </TableCell> */}
            <TableCell className="text-right">
              <BadgeDelta
                deltaType={
                  item.weekChange === 0
                    ? "unchanged"
                    : item.weekChange > 0
                    ? "increase"
                    : "decrease"
                }
              >
                {item.weekChange}%
              </BadgeDelta>
            </TableCell>
            <TableCell className="text-right">
              <BadgeDelta
                deltaType={
                  item.monthChange === 0
                    ? "unchanged"
                    : item.monthChange > 0
                    ? "increase"
                    : "decrease"
                }
              >
                {item.monthChange}%
              </BadgeDelta>
            </TableCell>
            <TableCell className="text-right">
              <BadgeDelta
                deltaType={
                  item.threeMonthChange === 0
                    ? "unchanged"
                    : item.threeMonthChange > 0
                    ? "increase"
                    : "decrease"
                }
              >
                {item.threeMonthChange}%
              </BadgeDelta>
            </TableCell>
            {showMonthlyChange && (
              <>
                <TableCell className="text-right">
                  <BadgeDelta
                    deltaType={
                      item.sixMonthChange === 0
                        ? "unchanged"
                        : item.sixMonthChange > 0
                        ? "increase"
                        : "decrease"
                    }
                  >
                    {item.sixMonthChange}%
                  </BadgeDelta>
                </TableCell>
              </>
            )}
            {showYearlyChange && (
              <>
                <TableCell className="text-right">
                  <BadgeDelta
                    deltaType={
                      item.oneYearChange === 0
                        ? "unchanged"
                        : item.oneYearChange > 0
                        ? "increase"
                        : "decrease"
                    }
                  >
                    {item.oneYearChange}%
                  </BadgeDelta>
                </TableCell>
                <TableCell className="text-right">
                  <BadgeDelta
                    deltaType={
                      item.fiveYearChange === 0
                        ? "unchanged"
                        : item.fiveYearChange > 0
                        ? "increase"
                        : "decrease"
                    }
                  >
                    {item.fiveYearChange}%
                  </BadgeDelta>
                </TableCell>
              </>
            )}
            <TableCell className="text-right">
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
            <TableCell className="text-right">
              <Badge color={"gray"}>{item.marketCap}</Badge>
            </TableCell>
            <TableCell className="text-right">
              <Badge color={"gray"}>{item.tenDayAverageVolume}</Badge>
            </TableCell>
            <TableCell className="text-right">
              <Flex justifyContent="end">
                {item.volumeIncreasedBy ? (
                  <BadgeDelta deltaType={"increase"}>
                    {item.volume} ({item.volumeIncreasedBy}%)
                  </BadgeDelta>
                ) : (
                  <Badge color={"gray"}>{item.volume}</Badge>
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
                low={item.low}
                high={item.high}
                current={item.currentPriceExact}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default memo(StockDataTable);
