"use client";

import { useCallback, useEffect, useState } from "react";
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
} from "@tremor/react";
import axios from "axios";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(date));
}

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

function StockDataTableCard({ data }) {
  const [filtered, setFiltered] = useState(data);
  const [showPrevPerf, setShowPrevPerf] = useState(false);
  const [selectMCapIndex, setSelectedMCapIndex] = useState(0);
  const [selectedStockIndex, setSelectedStockIndex] = useState(0);
  const [selectedPref, setSelectedPref] = useState(0);
  const [fnoStocks, setFnOStocks] = useState([]);
  const [marketNews, setMarkerNews] = useState([]);

  useEffect(() => {
    async function getFnOStockList() {
      const response = await axios.get("/api");
      setFnOStocks(response.data.fnoStocks || []);
      setMarkerNews(response.data.marketNews || []);
    }
    getFnOStockList();
  }, []);

  const onChangeStockType = useCallback(
    (newIndex) => {
      setSelectedStockIndex(newIndex);
      const cmp = newIndex === 2 ? true : false;
      setFiltered(
        newIndex === 0
          ? data
          : data.filter((item) => fnoStocks.includes(item.name) === cmp)
      );
    },
    [data, fnoStocks]
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

  const onChangePref = useCallback(
    (newIndex) => {
      setSelectedPref(newIndex);
      setFiltered(
        newIndex === 0
          ? data
          : data.filter((item) =>
              newIndex === 1
                ? item.dayChangeExact <= -4
                : item.dayChangeExact >= 4
            )
      );
    },
    [data]
  );

  return (
    <>
      <Card>
        <Accordion>
          <AccordionHeader>
            <Title>Top Market Headlines</Title>
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
      </Card>
      <Card>
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
            <TabGroup
              index={selectedPref}
              onIndexChange={onChangePref}
              className="mr-4"
            >
              <TabList variant="solid">
                <Tab>All</Tab>
                <Tab>Crazy Selling</Tab>
                <Tab>Crazy Buying</Tab>
              </TabList>
            </TabGroup>
            <TabGroup
              index={selectedStockIndex}
              onIndexChange={onChangeStockType}
              className="mr-4"
            >
              <TabList variant="solid">
                <Tab>All</Tab>
                <Tab>Cash</Tab>
                <Tab>FnO</Tab>
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
              <TableHeaderCell className="text-right">Price</TableHeaderCell>
              <TableHeaderCell className="text-right">
                Pre Change
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                Pre Volume
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                Open Change
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                Day Change
              </TableHeaderCell>
              {/* <TableHeaderCell className="text-right">
                Pre to Day Close
              </TableHeaderCell> */}
              {showPrevPerf && (
                <>
                  <TableHeaderCell className="text-right">
                    Week Change
                  </TableHeaderCell>
                  <TableHeaderCell className="text-right">
                    Month Change
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
                  <BadgeDelta deltaType={item.preMarketDelta}>
                    {item.preMarketChange}%
                  </BadgeDelta>
                </TableCell>
                <TableCell className="text-right">
                  <Badge color={"gray"}>{item.preMarketVolume}</Badge>
                </TableCell>
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
                  <BadgeDelta deltaType={item.delta}>
                    {item.dayChange}%
                  </BadgeDelta>
                </TableCell>
                {/* <TableCell className="text-right">
                  <PreToDayChangeMetrics
                    dayChange={item.dayChange}
                    preMarketChange={item.preMarketChange}
                  />
                </TableCell> */}
                {showPrevPerf && (
                  <>
                    <TableCell className="text-right">
                      {item.weekChange}%
                    </TableCell>
                    <TableCell className="text-right">
                      {item.monthChange}%
                    </TableCell>
                    <TableCell className="text-right">
                      {item.threeMonthChange}%
                    </TableCell>
                    <TableCell className="text-right">
                      {item.sixMonthChange}%
                    </TableCell>
                    <TableCell className="text-right">
                      {item.oneYearChange}%
                    </TableCell>
                    <TableCell className="text-right">
                      {item.fiveYearChange}
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
                    {item.volumeIncreasedBy && (
                      <BadgeDelta deltaType={"increase"} className="ml-2">
                        {item.volumeIncreasedBy}%
                      </BadgeDelta>
                    )}
                  </Flex>
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
