"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableBody,
  BadgeDelta,
  Flex,
  Metric,
  TabGroup,
  TabList,
  Tab,
  Badge,
  Switch,
  Accordion,
  AccordionHeader,
  AccordionBody,
  List,
  ListItem,
  Title,
  Bold,
  Text,
  Select,
  SelectItem,
  Icon,
  Grid,
} from "@tremor/react";
import {
  SortAscendingIcon,
  SortDescendingIcon,
  RefreshIcon,
} from "@heroicons/react/outline";
import axios from "axios";
import { formatDate, getConsolidatedHighlights } from "@/lib/common";
import IndexInsights from "./IndexInsights";
import { numberFormat } from "@/lib/number-format";

function PreToDayChangeMetrics({ dayChange, preMarketChange }) {
  const dayChangeParsed = parseFloat(dayChange);
  const preMarketChangeParsed = parseFloat(preMarketChange);

  let deltaType = "unchanged";
  let deltaText = "";
  if (preMarketChangeParsed < 0) {
    if (dayChangeParsed > 0 || dayChangeParsed > preMarketChangeParsed) {
      deltaType = "increase";
      deltaText = "Increased";
    } else if (dayChangeParsed < preMarketChangeParsed) {
      deltaType = "decrease";
      deltaText = "Further Decreased";
    }
  } else if (preMarketChangeParsed > 0) {
    if (dayChangeParsed < 0 || dayChangeParsed < preMarketChangeParsed) {
      deltaType = "decrease";
      deltaText = "Decreased";
    } else if (dayChangeParsed > preMarketChangeParsed) {
      deltaType = "increase";
      deltaText = "Further Increased";
    }
  }

  return <BadgeDelta deltaType={deltaType}>{deltaText}</BadgeDelta>;
}

function SortableColumn({ id, title, onSortItems }) {
  const [sortDirection, setSortDirection] = useState("asc");

  const onChangeSort = useCallback(() => {
    const newSortDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newSortDirection);
    onSortItems(id, newSortDirection);
  }, [id, sortDirection, onSortItems]);

  return (
    <Flex>
      <Text>{title}</Text>
      <Icon
        size="sm"
        icon={sortDirection === "asc" ? SortAscendingIcon : SortDescendingIcon}
        variant="simple"
        tooltip={
          "Sort " + (sortDirection === "asc" ? "Ascending" : "Descending")
        }
        className="ml-1 p-0 cursor-pointer"
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
  return (
    <Flex justifyContent="end" className="gap-2">
      {highlights.map((item) => (
        <Badge key={item} color="fuchsia">
          {item}
        </Badge>
      ))}
    </Flex>
  );
}

function StockDataTableCard({ data }) {
  const [filtered, setFiltered] = useState(data);
  const [showPrevPerf, setShowPrevPerf] = useState(false);
  const [selectMCapIndex, setSelectedMCapIndex] = useState(0);
  const [selectedStockIndex, setSelectedStockIndex] = useState(0);
  const [selectedChangeType, setSelectedChangeType] = useState("All");
  const [fnoStocks, setFnOStocks] = useState([]);
  const [niftyStocks, setNiftyStocks] = useState([]);
  const [bankNiftyStocks, setBankNiftyStocks] = useState([]);
  const [indexData, setIndexData] = useState(null);
  const [marketNews, setMarkerNews] = useState([]);

  const getFnOStockList = useCallback(async () => {
    const response = await axios.get("/api/fno");
    setFnOStocks(response.data.fnoStocks || []);
  }, []);

  const getMarketNews = useCallback(async () => {
    const response = await axios.get("/api/news");
    setMarkerNews(response.data.marketNews || []);
  }, []);

  const getIndexData = useCallback(async () => {
    const response = await axios.get("/api/contributors");
    setIndexData(response.data);
    setNiftyStocks(response.data.niftyContributorSymbols);
    setBankNiftyStocks(response.data.bankNiftyContributorSymbols);
  }, []);

  useEffect(() => {
    getFnOStockList();
    getIndexData();
  }, [getFnOStockList, getIndexData]);

  const onChangeStockType = useCallback(
    (newIndex) => {
      setSelectedStockIndex(newIndex);
      const list =
        newIndex === 3
          ? niftyStocks
          : newIndex === 4
          ? bankNiftyStocks
          : fnoStocks;
      const cmp = newIndex === 1 ? false : true;
      setFiltered(
        newIndex === 0
          ? data
          : data.filter((item) => list.includes(item.name) === cmp)
      );
    },
    [data, fnoStocks, niftyStocks, bankNiftyStocks]
  );

  const onChangeMCapType = useCallback(
    (newIndex) => {
      setSelectedMCapIndex(newIndex);
      const lowerBound = newIndex === 1 ? 1000 : newIndex === 2 ? 500 : 0;
      const upperBound = newIndex === 2 ? 1000 : newIndex === 3 ? 500 : null;
      setFiltered(
        newIndex === 0
          ? data
          : data.filter(
              (item) =>
                item.marketCapInBillions > lowerBound &&
                (upperBound ? item.marketCapInBillions <= upperBound : true)
            )
      );
    },
    [data]
  );

  const onChangeDayChangeType = useCallback(
    (newType) => {
      setSelectedChangeType(newType);
      setFiltered(
        newType === "All"
          ? data
          : data.filter((item) => item.dayChangeType === newType)
      );
    },
    [data]
  );

  const onSortItems = useCallback((keyName, direction) => {
    setFiltered((prevFiltered) =>
      prevFiltered
        .sort((a, b) =>
          direction === "desc"
            ? b[keyName] - a[keyName]
            : a[keyName] - b[keyName]
        )
        .map((item) => item)
    );
  }, []);

  const niftyContributors = useMemo(() => {
    if (!indexData) {
      return [];
    }
    const positiveContributors = indexData.niftyContributors
      .filter((item) => item.pointchange > 0)
      .sort((a, b) => b.pointchange - a.pointchange)
      .slice(0, 4);
    const negativeContributors = indexData.niftyContributors
      .filter((item) => item.pointchange < 0)
      .sort((a, b) => a.pointchange - b.pointchange)
      .slice(0, 4);
    let contributors = [];
    if (positiveContributors.length >= negativeContributors.length) {
      contributors = positiveContributors.map((item, index) => ({
        // Positive Symbol
        positiveSymbol: item.symbol,
        positivePointChanged: item.pointchange,
        // Negative Symbol
        negativeSymbol: negativeContributors[index]?.symbol,
        negativePointChanged: negativeContributors[index]?.pointchange,
      }));
    } else {
      contributors = negativeContributors.map((item, index) => ({
        // Positive Symbol
        positiveSymbol: positiveContributors[index]?.symbol,
        positivePointChanged: positiveContributors[index]?.pointchange,
        // Negative Symbol
        negativeSymbol: item.symbol,
        negativePointChanged: item.pointchange,
      }));
    }
    return contributors;
  }, [indexData]);

  const bankNiftyContributors = useMemo(() => {
    if (!indexData) {
      return [];
    }
    const positiveContributors = indexData.bankNiftyContributors
      .filter((item) => item.pointchange > 0)
      .sort((a, b) => b.pointchange - a.pointchange)
      .slice(0, 4);
    const negativeContributors = indexData.bankNiftyContributors
      .filter((item) => item.pointchange < 0)
      .sort((a, b) => a.pointchange - b.pointchange)
      .slice(0, 4);
    let contributors = [];
    if (positiveContributors.length >= negativeContributors.length) {
      contributors = positiveContributors.map((item, index) => ({
        // Positive Symbol
        positiveSymbol: item.symbol,
        positivePointChanged: item.pointchange,
        // Negative Symbol
        negativeSymbol: negativeContributors[index]?.symbol,
        negativePointChanged: negativeContributors[index]?.pointchange,
      }));
    } else {
      contributors = negativeContributors.map((item, index) => ({
        // Positive Symbol
        positiveSymbol: positiveContributors[index]?.symbol,
        positivePointChanged: positiveContributors[index]?.pointchange,
        // Negative Symbol
        negativeSymbol: item.symbol,
        negativePointChanged: item.pointchange,
      }));
    }
    return contributors;
  }, [indexData]);

  return (
    <>
      <Grid numItemsSm={2} numItemsLg={2} className="gap-6 mb-6">
        <IndexInsights
          title="Nifty"
          price={numberFormat(indexData?.niftyContributors[0].NewIndexValue)}
          pointsChanged={indexData?.niftyPointChanged}
          contributors={niftyContributors}
        />
        <IndexInsights
          title="Bank Nifty"
          price={numberFormat(
            indexData?.bankNiftyContributors[0].NewIndexValue
          )}
          pointsChanged={indexData?.bankNiftyPointChange}
          contributors={bankNiftyContributors}
        />
      </Grid>
      <Card>
        <Accordion className="mb-6" defaultOpen={false}>
          <AccordionHeader>
            <Flex justifyContent="start">
              <Title>Top Market Headlines</Title>
              <Icon
                icon={RefreshIcon}
                size="sm"
                variant="simple"
                tooltip="Refresh Latest Market News"
                className="ml-2 p-0 cursor-pointer"
                onClick={getMarketNews}
              />
            </Flex>
          </AccordionHeader>
          <AccordionBody>
            <List>
              {marketNews.map((item, index) => (
                <ListItem key={"lite-item" + index}>
                  <Text>
                    <Bold>{item.title}</Bold> - {formatDate(item.publishedAt)}
                  </Text>
                  <a target="_blank" href={item.url}>
                    Open
                  </a>
                </ListItem>
              ))}
            </List>
          </AccordionBody>
        </Accordion>
        <Flex justifyContent="between">
          <Flex>
            <Metric>Stocks ({filtered.length})</Metric>
          </Flex>
          <Flex className="w-max">
            <Switch
              className="flex mr-4"
              checked={showPrevPerf}
              onChange={setShowPrevPerf}
            />
            <Select
              value={selectedChangeType}
              onValueChange={onChangeDayChangeType}
              enableClear={false}
              className="mr-4"
            >
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Crazy Selling">
                Crazy Selling
                {/* (-5% or less ) */}
              </SelectItem>
              <SelectItem value="Heavy Selling">
                Heavy Selling
                {/* (-2.5% ~ -5%) */}
              </SelectItem>
              <SelectItem value="Moderate Selling">
                Moderate Selling
                {/* (-0.25% ~ -2.5%) */}
              </SelectItem>
              <SelectItem value="Neutral">
                Neutral
                {/* (-0.25% ~ 0.25%) */}
              </SelectItem>
              <SelectItem value="Moderate Buying">
                Moderate Buying
                {/* (0.25% ~ 2.5%) */}
              </SelectItem>
              <SelectItem value="Heavy Buying">
                Heavy Buying
                {/* (0.5% ~ 5%) */}
              </SelectItem>
              <SelectItem value="Crazy Buying">
                Crazy Buying
                {/* (5% or more) */}
              </SelectItem>
            </Select>
            <TabGroup
              index={selectedStockIndex}
              onIndexChange={onChangeStockType}
              className="mr-4"
            >
              <TabList variant="solid">
                <Tab>All</Tab>
                <Tab>Cash</Tab>
                <Tab>FnO</Tab>
                <Tab>Nifty</Tab>
                <Tab>Bank Nifty</Tab>
              </TabList>
            </TabGroup>
            <TabGroup index={selectMCapIndex} onIndexChange={onChangeMCapType}>
              <TabList variant="solid">
                <Tab>All</Tab>
                <Tab>Large</Tab>
                <Tab>Medium</Tab>
                <Tab>Small</Tab>
              </TabList>
            </TabGroup>
          </Flex>
        </Flex>
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
                  id="preMarketChangeExact"
                  title="Pre Change"
                  onSortItems={onSortItems}
                />
              </TableHeaderCell>
              {/* <TableHeaderCell className="text-right">
                Pre Volume
              </TableHeaderCell> */}
              <TableHeaderCell className="text-right">
                <SortableColumn
                  id="changeFromOpen"
                  title="Open Change"
                  onSortItems={onSortItems}
                />
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                <SortableColumn
                  id="dayChangeExact"
                  title="Day Change"
                  onSortItems={onSortItems}
                />
              </TableHeaderCell>
              {/* <TableHeaderCell className="text-right">
                Pre to Day Close
              </TableHeaderCell> */}
              <TableHeaderCell className="text-right">
                <SortableColumn
                  id="weekChangeExact"
                  title="Week Change"
                  onSortItems={onSortItems}
                />
              </TableHeaderCell>
              {showPrevPerf && (
                <>
                  <TableHeaderCell className="text-right">
                    <SortableColumn
                      id="monthChangeExact"
                      title="Month Change"
                      onSortItems={onSortItems}
                    />
                  </TableHeaderCell>
                  <TableHeaderCell className="text-right">
                    3 Month Change
                  </TableHeaderCell>
                  <TableHeaderCell className="text-right">
                    6 Month Change
                  </TableHeaderCell>
                  <TableHeaderCell className="text-right">
                    Year Change
                  </TableHeaderCell>
                  <TableHeaderCell className="text-right">
                    5 Year Change
                  </TableHeaderCell>
                </>
              )}
              <TableHeaderCell className="text-right">
                Change from High / Low (6M)
              </TableHeaderCell>
              {/* <TableHeaderCell className="text-right">
                Change from High / Low (1Y)
              </TableHeaderCell> */}
              <TableHeaderCell className="text-right">
                Avg Volume
              </TableHeaderCell>
              <TableHeaderCell className="text-right">Volume</TableHeaderCell>
              <TableHeaderCell className="text-right">
                SMA (50, 100 and 200)
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                EMA (50, 100 and 200)
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                Highlights
              </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((item) => (
              <TableRow
                key={item.name}
                className={
                  item.highlightRed
                    ? "bg-orange-200"
                    : item.highlight
                    ? "bg-orange-50"
                    : ""
                }
              >
                <TableCell>
                  {item.description} ({item.name})
                  <Badge
                    className="ml-2"
                    color={
                      item.mCapType === "Large"
                        ? "emerald"
                        : item.mCapType === "Medium"
                        ? "amber"
                        : "rose"
                    }
                  >
                    {item.mCapType}
                  </Badge>
                  {fnoStocks.includes(item.name) && (
                    <Badge className="ml-2" color={"purple"}>
                      FnO
                    </Badge>
                  )}
                </TableCell>
                {/* <TableCell>{item.sector}</TableCell> */}
                <TableCell className="text-right">
                  <Badge color={"gray"}>{item.currentPrice}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <BadgeDelta deltaType={item.preMarketChangeDeltaType}>
                    {item.preMarketChange}%
                  </BadgeDelta>
                </TableCell>
                {/* <TableCell className="text-right">
                  <Badge color={"gray"}>{item.preMarketVolume}</Badge>
                </TableCell> */}
                <TableCell className="text-right">
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
                </TableCell>
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
                {showPrevPerf && (
                  <>
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
                  <BadgeDelta deltaType="decrease">
                    {item.downFromSixMonthHigh}%
                  </BadgeDelta>
                </TableCell>
                {/* <TableCell className="text-right">
                  <BadgeDelta deltaType="increase" className="mr-2">
                    {item.upFromOneYearLow}%
                  </BadgeDelta>
                  <BadgeDelta deltaType="decrease">
                    {item.downFromOneYearHigh}%
                  </BadgeDelta>
                </TableCell> */}
                <TableCell className="text-right">
                  <Badge color={"gray"}>{item.tenDayAverageVolume}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Flex justifyContent="end">
                    <Badge color={"gray"}>{item.volume}</Badge>
                    {item.volumeIncreasedBy ? (
                      <BadgeDelta deltaType={"increase"} className="ml-2">
                        {item.volumeIncreasedBy}%
                      </BadgeDelta>
                    ) : null}
                  </Flex>
                </TableCell>
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
                <TableCell className="text-right">
                  <StockHighlights
                    highlights={getConsolidatedHighlights(item.highlights)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}

export default StockDataTableCard;
