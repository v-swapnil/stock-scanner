"use client";

import { numberFormat } from "@/lib/number-format";
import { ArrowUpIcon, ArrowDownIcon, StarIcon } from "@heroicons/react/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/solid";
import {
  Badge,
  BadgeDelta,
  Card,
  Flex,
  Icon,
  Metric,
  MultiSelect,
  MultiSelectItem,
  Select,
  SelectItem,
  Tab,
  TabGroup,
  TabList,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
} from "@tremor/react";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import IndexInsights from "./IndexInsights";
import StockRangeBar from "./StockRangeBar";
import { toFixedIntegerNumber } from "@/lib/common";

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
    <Flex justifyContent="end">
      <Text>{title}</Text>
      <Icon
        size="sm"
        icon={sortDirection === "desc" ? ArrowUpIcon : ArrowDownIcon}
        // color={sortDirection === "desc" ? "emerald" : "rose"}
        color="gray"
        variant="simple"
        tooltip={
          "Sort " + (sortDirection === "asc" ? "Ascending" : "Descending")
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

function StockDataTableCard({ data }) {
  const [filtered, setFiltered] = useState(data);
  const [selectMCapIndex, setSelectedMCapIndex] = useState(0);
  const [selectedStockType, setSelectedStockType] = useState("All");
  const [selectedChangeType, setSelectedChangeType] = useState("All");
  const [selectedHighlight, setSelectedHighlight] = useState("All");
  const [selectedSector, setSelectedSector] = useState("All");
  const [selectedViews, setSelectedViews] = useState(["Basic"]);
  const [fnoStocks, setFnOStocks] = useState([]);
  const [niftyStocks, setNiftyStocks] = useState([]);
  const [bankNiftyStocks, setBankNiftyStocks] = useState([]);
  const [finNiftyStocks, setFinNiftyStocks] = useState([]);
  const [midCapNiftyStocks, setMidCapNiftyStocks] = useState([]);
  const [indexData, setIndexData] = useState(null);
  const [marketNews, setMarkerNews] = useState([]);
  const [favoriteStocks, setFavoriteStocks] = useState([]);

  const filteredWithFavorites = useMemo(() => {
    return filtered.map((item) => {
      item.isStarred = favoriteStocks.includes(item.name);
      return item;
    });
  }, [filtered, favoriteStocks]);

  const sectors = useMemo(() => {
    return Array.from(new Set(data.map((item) => item.sector))) || [];
  }, [data]);

  const getFavoriteStocks = useCallback(async () => {
    const response = await axios.get("/api/stocks");
    setFavoriteStocks(response.data.favorite_stocks || []);
  }, []);

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
    setNiftyStocks(response.data.niftyConstituent);
    setBankNiftyStocks(response.data.bankNiftyConstituent);
    setFinNiftyStocks(response.data.finNiftyConstituent);
    setMidCapNiftyStocks(response.data.midCapNiftyConstituent);
  }, []);

  useEffect(() => {
    getFavoriteStocks();
    getFnOStockList();
    getIndexData();
  }, [getFavoriteStocks, getFnOStockList, getIndexData]);

  const onChangeStockType = useCallback(
    (newStockType) => {
      setSelectedStockType(newStockType);
      const list =
        newStockType === "Starred"
          ? favoriteStocks
          : newStockType === "Nifty"
          ? niftyStocks
          : newStockType === "BankNifty"
          ? bankNiftyStocks
          : newStockType === "FinNifty"
          ? finNiftyStocks
          : newStockType === "MidCapNifty"
          ? midCapNiftyStocks
          : fnoStocks;
      const cmp = newStockType === "Cash" ? false : true;
      setFiltered(
        newStockType === "All"
          ? data
          : data.filter((item) => list.includes(item.name) === cmp)
      );
    },
    [
      favoriteStocks,
      niftyStocks,
      bankNiftyStocks,
      finNiftyStocks,
      midCapNiftyStocks,
      fnoStocks,
      data,
    ]
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

  const onChangeHighlight = useCallback(
    (newType) => {
      setSelectedHighlight(newType);
      setFiltered(
        newType === "All"
          ? data
          : data.filter((item) => item.consolidatedHighlights.includes(newType))
      );
    },
    [data]
  );

  const onChangeSector = useCallback(
    (newSector) => {
      setSelectedSector(newSector);
      setFiltered(
        newSector === "All"
          ? data
          : data.filter((item) => item.sector === newSector)
      );
    },
    [data]
  );

  const onChangeViews = useCallback((newViews) => {
    setSelectedViews(Array.from(new Set(["Basic", ...newViews])));
  }, []);

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

  const onChangeFavorites = useCallback(async (stockData) => {
    const response = await axios.patch("/api/stocks", {
      stock_id: stockData.name,
    });
    setFavoriteStocks(response.data.favorite_stocks);
    // setFavoriteStocks((prevFavoriteStocks) => {
    //   const dataIndex = prevFavoriteStocks.indexOf(stockData.name);
    //   if (dataIndex !== -1) {
    //     prevFavoriteStocks.splice(dataIndex, 1);
    //   } else {
    //     prevFavoriteStocks.push(stockData.name);
    //   }
    //   console.log("prevFavoriteStocks", prevFavoriteStocks);
    //   return [...prevFavoriteStocks];
    // });
  }, []);

  const marketSentiment = useMemo(() => {
    let positive = 0;
    let negative = 0;
    let noChange = 0;
    data.forEach((item) => {
      if (item.dayChangeExact === 0) {
        noChange++;
      } else if (item.dayChangeExact > 0) {
        positive++;
      } else {
        negative++;
      }
    });
    const positivePer = positive / data.length;
    const negativePer = negative / data.length;
    return positivePer > 0.6
      ? "Positive"
      : negativePer > 0.6
      ? "Negative"
      : "Neutral";
  }, [data]);

  const marketContributors = useMemo(() => {
    const sorted = data.toSorted((a, b) => b.dayChangeExact - a.dayChangeExact);
    const positiveContributors = sorted
      .slice(0, 4)
      .filter((item) => item.dayChangeExact > 0);
    const negativeContributors = sorted
      .slice(sorted.length - 4, sorted.length)
      .filter((item) => item.dayChangeExact < 0)
      .reverse();
    let contributors = [];
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

  const advanceDeclineMetric = useMemo(() => {
    const total = data.length;
    const negative = data.filter((item) => item.dayChangeExact < 0).length;
    const positive = total - negative;
    //
    const niftyNegative = indexData
      ? indexData.niftyContributors.filter((item) => item.pointchange < 0)
          .length
      : 0;
    const niftyPositive = 50 - niftyNegative;
    //
    const bankNiftyNegative = indexData
      ? indexData.bankNiftyContributors.filter((item) => item.pointchange < 0)
          .length
      : 0;
    const bankNiftyPositive = indexData
      ? indexData.bankNiftyContributors.length - bankNiftyNegative
      : 0;
    return {
      marketAdvanceDecline: toFixedIntegerNumber((positive / total) * 100),
      niftyAdvanceDecline: indexData
        ? toFixedIntegerNumber((niftyPositive / 50) * 100)
        : null,
      bankNiftyAdvanceDecline: indexData
        ? toFixedIntegerNumber(
            (bankNiftyPositive / indexData.bankNiftyContributors.length) * 100
          )
        : null,
    };
  }, [data, indexData]);

  const showMonthlyChange = selectedViews.includes("MonthlyChange");
  const showYearlyChange = selectedViews.includes("YearlyChange");
  const showMovingAverages = selectedViews.includes("MA");

  return (
    <>
      <Flex justifyContent="between">
        <IndexInsights
          title="Market"
          price={marketSentiment}
          pointsChanged={null}
          contributors={marketContributors}
          advanceDecline={advanceDeclineMetric.marketAdvanceDecline}
        />
        <IndexInsights
          title="Nifty"
          price={numberFormat(indexData?.niftyPrice)}
          pointsChanged={indexData?.niftyPointChanged}
          contributors={niftyContributors}
          advanceDecline={advanceDeclineMetric.niftyAdvanceDecline}
        />
        <IndexInsights
          title="Bank Nifty"
          price={numberFormat(indexData?.bankNiftyPrice)}
          pointsChanged={indexData?.bankNiftyPointChange}
          contributors={bankNiftyContributors}
          advanceDecline={advanceDeclineMetric.bankNiftyAdvanceDecline}
        />
      </Flex>
      <Card className="mt-6">
        {/* <Accordion className="mb-6" defaultOpen={false}>
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
        </Accordion> */}
        <Flex justifyContent="between">
          <Flex className="w-[30vw]">
            <Metric>Stocks ({filteredWithFavorites.length})</Metric>
          </Flex>
          <Flex className="w-[70vw]" justifyContent="end">
            <MultiSelect
              value={selectedViews}
              onValueChange={onChangeViews}
              className="mr-4"
            >
              <MultiSelectItem value="Basic">Basic</MultiSelectItem>
              <MultiSelectItem value="MonthlyChange">
                Monthly Change
              </MultiSelectItem>
              <MultiSelectItem value="YearlyChange">
                Yearly Change
              </MultiSelectItem>
              <MultiSelectItem value="MA">Moving Averages</MultiSelectItem>
            </MultiSelect>
            <Select
              value={selectedChangeType}
              onValueChange={onChangeDayChangeType}
              enableClear={false}
              className="flex mr-4"
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
            <Select
              value={selectedHighlight}
              onValueChange={onChangeHighlight}
              enableClear={false}
              className="mr-4"
            >
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="200 MA">200 MA</SelectItem>
              <SelectItem value="100 MA">100 MA</SelectItem>
              <SelectItem value="6M Low">6M Low</SelectItem>
              <SelectItem value="Volume">Volume</SelectItem>
              <SelectItem value="Low Gains">Low Gains (6M)</SelectItem>
              <SelectItem value="High Gains">High Gains (6M)</SelectItem>
            </Select>
            <Select
              value={selectedSector}
              onValueChange={onChangeSector}
              enableClear={false}
              className="mr-4"
            >
              <SelectItem value="All">All</SelectItem>
              {sectors.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </Select>
            <Select
              value={selectedStockType}
              onValueChange={onChangeStockType}
              enableClear={false}
              className="mr-4"
            >
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Starred">Starred</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="FnO">Future and Options</SelectItem>
              <SelectItem value="Nifty">Nifty</SelectItem>
              <SelectItem value="BankNifty">Bank Nifty</SelectItem>
              <SelectItem value="FinNifty">Finance Nifty</SelectItem>
              <SelectItem value="MidCapNifty">MidCap Nifty</SelectItem>
            </Select>
            <TabGroup index={selectMCapIndex} onIndexChange={onChangeMCapType}>
              <TabList variant="solid">
                <Tab>All</Tab>
                <Tab>Large</Tab>
                <Tab>Mid</Tab>
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
              <TableHeaderCell>
                <SortableColumn
                  id="marketCapExact"
                  title="Market Cap"
                  onSortItems={onSortItems}
                />
              </TableHeaderCell>
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
                  title="P/E"
                  onSortItems={onSortItems}
                />
              </TableHeaderCell>
              <TableHeaderCell className="text-right">P/B</TableHeaderCell>
              {/* <TableHeaderCell className="text-right">EPS</TableHeaderCell> */}
              <TableHeaderCell className="text-right">
                Div Yield
              </TableHeaderCell>
              {/* <TableHeaderCell className="text-right">
                <SortableColumn
                  id="priceEarningTTMExact"
                  title="P/B"
                  onSortItems={onSortItems}
                />
              </TableHeaderCell> */}
              <TableHeaderCell className="text-right">
                <SortableColumn
                  id="preMarketChangeExact"
                  title="Pre-Change"
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
                  title="1D Change"
                  onSortItems={onSortItems}
                />
              </TableHeaderCell>
              {/* <TableHeaderCell className="text-right">
                Pre to Day Close
              </TableHeaderCell> */}
              <TableHeaderCell className="text-right">
                <SortableColumn
                  id="weekChangeExact"
                  title="1W Change"
                  onSortItems={onSortItems}
                />
              </TableHeaderCell>
              {showMonthlyChange && (
                <>
                  <TableHeaderCell className="text-right">
                    <SortableColumn
                      id="monthChangeExact"
                      title="1M Change"
                      onSortItems={onSortItems}
                    />
                  </TableHeaderCell>
                  <TableHeaderCell className="text-right">
                    <SortableColumn
                      id="threeMonthChangeExact"
                      title="3M Change"
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
              <TableHeaderCell className="text-right">
                Avg Volume
              </TableHeaderCell>
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
              <TableHeaderCell className="text-right">
                Highlights
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                Day Range
              </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredWithFavorites.map((item, index) => (
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
                    {fnoStocks.includes(item.name) && (
                      <Badge className="ml-2" color={"purple"}>
                        FnO
                      </Badge>
                    )}
                    <Icon
                      className="cursor-pointer"
                      onClick={() => onChangeFavorites(item)}
                      icon={item.isStarred ? StarIconSolid : StarIcon}
                      color="emerald"
                    />
                  </Flex>
                </TableCell>
                <TableCell className="text-right">
                  <Badge color={"gray"}>{item.marketCap}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Badge color={"gray"}>{item.currentPrice}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    color={
                      item.priceEarningTTMExact <= 25
                        ? "emerald"
                        : item.priceEarningTTMExact >= 75
                        ? "rose"
                        : "orange"
                    }
                  >
                    {item.priceEarningTTM}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    color={item.priceBookTTMExact <= 3 ? "emerald" : "rose"}
                  >
                    {item.priceBookTTM}
                  </Badge>
                </TableCell>
                {/* <TableCell className="text-right">
                  <Badge color={"gray"}>
                    {item.earningPerShareTTM
                      ? item.earningPerShareTTM +
                        " (" +
                        item.earningPerShareTTMPer +
                        "%)"
                      : ""}
                  </Badge>
                </TableCell> */}
                <TableCell className="text-right">
                  <Badge
                    color={item.dividendYieldExact > 6 ? "emerald" : "gray"}
                  >
                    {item.dividendYield ? item.dividendYield + "%" : ""}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <BadgeDelta deltaType={item.preMarketChangeDeltaType}>
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
                {showMonthlyChange && (
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
                  <Badge color="sky">{item.sector}</Badge>
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
      </Card>
    </>
  );
}

export default StockDataTableCard;
