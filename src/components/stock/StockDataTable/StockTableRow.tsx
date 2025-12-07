import { RiStarFill, RiStarLine } from "@remixicon/react";
import {
  Badge,
  BadgeDelta,
  Flex,
  Icon,
  TableCell,
  TableRow,
} from "@tremor/react";
import StockRangeBar from "../StockRangeBar";
import { TCompareFn, TStockDataItem } from "@/lib/types";
import StockHighlights from "../StockHighlights";
import BadgeColorWithThreshold from "../../shared/BadgeColorWithThreshold";
import MovingAverageBadge from "../../shared/MovingAverageBadge";
import { memo } from "react";

interface IStockTableRowProps {
  item: TStockDataItem;
  showFundamentals: boolean;
  showYearlyChange: boolean;
  showMovingAverages: boolean;
  showCurrentWeekMonthRange: boolean;
  onChangeSector: (sector: string, isIndustry?: boolean) => void;
  onChangeFavorites: (stockData: TStockDataItem) => void;
}

function StockTableRow({
  item,
  showFundamentals,
  showYearlyChange,
  showMovingAverages,
  showCurrentWeekMonthRange,
  onChangeSector,
  onChangeFavorites,
}: IStockTableRowProps) {
  return (
    <TableRow key={item.name}>
      <TableCell>
        <Flex justifyContent="start">
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
          <TableCell className="text-left">
            <BadgeDelta deltaType="increase" className="mr-2">
              {item.upFromCurrentMonthLow}%
            </BadgeDelta>
            <BadgeDelta deltaType="decrease">
              {item.downFromCurrentMonthHigh}%
            </BadgeDelta>
          </TableCell>
          <TableCell className="text-right">
            <BadgeDelta deltaType="increase" className="mr-2">
              {item.upFromThreeMonthLow}%
            </BadgeDelta>
            <BadgeDelta deltaType="decrease">
              {item.downFromThreeMonthHigh}%
            </BadgeDelta>
          </TableCell>
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
}

export default memo(StockTableRow);
