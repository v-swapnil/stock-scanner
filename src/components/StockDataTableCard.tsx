"use client";

import { numberFormat } from "@/lib/number-format";
import { RiSearch2Line, RiSearchLine } from "@remixicon/react";
import {
  Button,
  Card,
  Flex,
  Metric,
  MultiSelect,
  MultiSelectItem,
  Select,
  SelectItem,
  Tab,
  TabGroup,
  TabList,
  TextInput,
} from "@tremor/react";
import axios from "axios";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import IndexInsights from "./IndexInsights";
import { toFixedIntegerNumber } from "@/lib/common";
import StockDataTable from "./StockDataTable";
import {
  TAdvanceDeclineMetric,
  TConsolidatedHighlights,
  TConsolidatedContributors,
  TStockDataItem,
  TSectorPriceEarningRatio,
  TIndexDataContributorItem,
  TIndexMetric,
} from "@/lib/types";
import StockDataTableNew from "./StockDataTableNew";

interface IStockDataTableCardProps {
  data: Array<TStockDataItem>;
  priceEarningBySector: Record<string, TSectorPriceEarningRatio>;
}

function StockDataTableCard({
  data,
  priceEarningBySector,
}: IStockDataTableCardProps) {
  const [isPending, startTransition] = useTransition();
  const [filtered, setFiltered] = useState<Array<TStockDataItem>>(data);
  const [selectMCapIndex, setSelectedMCapIndex] = useState(0);
  const [selectedStockType, setSelectedStockType] = useState("All");
  const [selectedChangeType, setSelectedChangeType] = useState("All");
  const [selectedHighlight, setSelectedHighlight] = useState("All");
  const [selectedSector, setSelectedSector] = useState("All");
  const [selectedViews, setSelectedViews] = useState(["Basic"]);
  const [fnoStocks, setFnOStocks] = useState<Array<string>>([]);
  const [niftyStocks, setNiftyStocks] = useState<Array<string>>([]);
  const [bankNiftyStocks, setBankNiftyStocks] = useState<Array<string>>([]);
  const [finNiftyStocks, setFinNiftyStocks] = useState<Array<string>>([]);
  const [midCapNiftyStocks, setMidCapNiftyStocks] = useState<Array<string>>([]);
  const [niftyJuniorStocks, setNiftyJuniorStocks] = useState<Array<string>>([]);
  const [pseStocks, setPseStocks] = useState<Array<string>>([]);
  const [indexData, setIndexData] = useState<Record<string, any>>({});
  const [marketNews, setMarkerNews] = useState([]);
  const [favoriteStocks, setFavoriteStocks] = useState<Array<string>>([]);
  const [searchType, setSearchType] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [niftyMetrics, setNiftyMetrics] = useState<TIndexMetric>({});
  const [niftyBankMetrics, setNiftyBankMetrics] = useState<TIndexMetric>({});

  useEffect(() => {
    if (!searchText) {
      setFiltered(data);
      return;
    }
    const timeoutId = setTimeout(() => {
      setFiltered(data.filter((item) => item.searchTerms.includes(searchText)));
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [data, searchText]);

  useEffect(() => {
    // Starred Stocks
    const getFavoriteStocks = async () => {
      const response = await axios.get("/api/favorite-stocks");
      setFavoriteStocks(response.data || []);
    };
    getFavoriteStocks();

    // Index Constituents
    const getAllConstituents = async () => {
      const response = await axios.get("/api/constituents");
      setFnOStocks(response.data.futureAndOptions || []);
      setNiftyStocks(response.data.nifty || []);
      setBankNiftyStocks(response.data.niftyBank || []);
      setFinNiftyStocks(response.data.niftyFinServices || []);
      setMidCapNiftyStocks(response.data.niftyMidCap || []);
      setNiftyJuniorStocks(response.data.niftyJunior || []);
      setPseStocks(response.data.niftyPublicSectorEnterprises || []);
    };
    getAllConstituents();

    // Market News
    // const getMarketNews = async () => {
    //   const response = await axios.get("/api/news");
    //   setMarkerNews(response.data.marketNews || []);
    // };
    // getMarketNews();
  }, []);

  useEffect(() => {
    // Nifty Contributions
    const getNiftyContributions = async () => {
      const response = await axios.get("/api/contributors-v2?indexId=nifty");
      const responseJson: Array<TIndexDataContributorItem> = response.data;

      const pointChanged = responseJson.reduce(
        (prev, item) => prev + item.pointchange,
        0
      );
      const niftyNegative = responseJson.filter(
        (item) => item.pointchange < 0
      ).length;
      const niftyPositive = 50 - niftyNegative;

      const positiveContributors = responseJson
        .filter((item) => item.pointchange > 0)
        .sort((a, b) => b.pointchange - a.pointchange)
        .slice(0, 4);
      const negativeContributors = responseJson
        .filter((item) => item.pointchange < 0)
        .sort((a, b) => a.pointchange - b.pointchange)
        .slice(0, 4);
      let contributors: TConsolidatedContributors = [];
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
      setNiftyMetrics((prev) => ({
        ...prev,
        pointChanged: parseFloat(pointChanged?.toFixed(2)),
        advanceDecline: toFixedIntegerNumber((niftyPositive / 50) * 100),
        contributors: contributors,
      }));
    };
    getNiftyContributions();

    // Bank Nifty Contributions
    const getBankNiftyContributions = async () => {
      const response = await axios.get(
        "/api/contributors-v2?indexId=niftyBank"
      );
      const responseJson: Array<TIndexDataContributorItem> = response.data;

      const pointChanged = responseJson.reduce(
        (prev, item) => prev + item.pointchange,
        0
      );
      const bankNiftyNegative = responseJson.filter(
        (item) => item.pointchange < 0
      ).length;
      const bankNiftyPositive = responseJson.length - bankNiftyNegative;

      const positiveContributors = responseJson
        .filter((item) => item.pointchange > 0)
        .sort((a, b) => b.pointchange - a.pointchange)
        .slice(0, 4);
      const negativeContributors = responseJson
        .filter((item) => item.pointchange < 0)
        .sort((a, b) => a.pointchange - b.pointchange)
        .slice(0, 4);
      let contributors: TConsolidatedContributors = [];
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
      setNiftyBankMetrics((prev) => ({
        ...prev,
        pointChanged: parseFloat(pointChanged?.toFixed(2)),
        advanceDecline: toFixedIntegerNumber(
          (bankNiftyPositive / responseJson.length) * 100
        ),
        contributors: contributors,
      }));
    };
    getBankNiftyContributions();

    // Index Pricing Data
    const getIndexPricingData = async () => {
      const response = await axios.get("/api/indices");
      const responseJson: Array<any> = response.data || [];
      const niftyIndexData = responseJson.find(
        (item) => item.indexName === "NIFTY 50"
      );
      const niftyBankIndexData = responseJson.find(
        (item) => item.indexName === "NIFTY BANK"
      );
      setNiftyMetrics((prev) => ({
        ...prev,
        price: niftyIndexData?.last,
      }));
      setNiftyBankMetrics((prev) => ({
        ...prev,
        price: niftyBankIndexData?.last,
      }));
    };
    getIndexPricingData();
  }, []);

  const filteredWithFavorites = useMemo(() => {
    return filtered.map((item) => {
      item.isStarred = favoriteStocks.includes(item.name);
      item.isFnO = fnoStocks.includes(item.name);
      item.isIndex = [
        ...niftyStocks,
        ...bankNiftyStocks,
        ...finNiftyStocks,
        ...midCapNiftyStocks,
      ].includes(item.name);
      return item;
    });
  }, [
    filtered,
    favoriteStocks,
    fnoStocks,
    niftyStocks,
    bankNiftyStocks,
    finNiftyStocks,
    midCapNiftyStocks,
  ]);

  const sectors = useMemo(() => {
    return Array.from(new Set(data.map((item) => item.industry))) || [];
  }, [data]);

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
    const negative = data.filter((item) => item.dayChangeExact < 0).length;
    const positive = total - negative;
    return toFixedIntegerNumber((positive / total) * 100);
  }, [data]);

  const onChangeStockType = useCallback(
    (newStockType: string) => {
      setSelectedStockType(newStockType);
      const list =
        newStockType === "Starred"
          ? favoriteStocks
          : newStockType === "PSE"
          ? pseStocks
          : newStockType === "Nifty"
          ? niftyStocks
          : newStockType === "NiftyJunior"
          ? niftyJuniorStocks
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
      pseStocks,
      niftyStocks,
      niftyJuniorStocks,
      bankNiftyStocks,
      finNiftyStocks,
      midCapNiftyStocks,
      fnoStocks,
      data,
    ]
  );

  const onChangeMCapType = useCallback(
    (newIndex: number) => {
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
    (newType: string) => {
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
    (newType: string) => {
      setSelectedHighlight(newType);
      setFiltered(
        newType === "All"
          ? data
          : data.filter((item) =>
              item.consolidatedHighlights.includes(
                newType as TConsolidatedHighlights
              )
            )
      );
    },
    [data]
  );

  const onChangeSector = useCallback(
    (newSector: string, isSector?: boolean) => {
      setSelectedSector(newSector);
      setFiltered(
        newSector === "All"
          ? data
          : data.filter((item) =>
              isSector ? item.sector === newSector : item.industry === newSector
            )
      );
    },
    [data]
  );

  const onChangeViews = useCallback((newViews: Array<string>) => {
    setSelectedViews(Array.from(new Set(["Basic", ...newViews])));
  }, []);

  const onSortItems = useCallback((keyName: string, direction: string) => {
    setFiltered((prevFiltered) =>
      prevFiltered
        .sort((a: any, b: any) =>
          direction === "desc"
            ? b[keyName] - a[keyName]
            : a[keyName] - b[keyName]
        )
        .map((item) => item)
    );
  }, []);

  const onChangeFavorites = useCallback(async (stockData: TStockDataItem) => {
    const payload = { stockId: stockData.name };
    const response = await axios.patch("/api/favorite-stocks", payload);
    setFavoriteStocks(response.data);
  }, []);

  const onChangeSearchText = useCallback((newText: string) => {
    setSearchText(newText ? newText.toLowerCase() : "");
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
      <Card className="mt-4 w-[calc(100%-3rem)]">
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
          <Flex className="w-[70vw] gap-2" justifyContent="end">
            <MultiSelect value={selectedViews} onValueChange={onChangeViews}>
              <MultiSelectItem value="Basic">Basic</MultiSelectItem>
              <MultiSelectItem value="Fundamentals">
                Fundamentals
              </MultiSelectItem>
              <MultiSelectItem value="YearlyChange">
                Yearly Change
              </MultiSelectItem>
              <MultiSelectItem value="MovingAverages">
                Moving Averages
              </MultiSelectItem>
            </MultiSelect>
            <Select
              value={selectedChangeType}
              onValueChange={onChangeDayChangeType}
              enableClear={false}
            >
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Crazy Selling">Crazy Selling</SelectItem>
              <SelectItem value="Heavy Selling">Heavy Selling</SelectItem>
              <SelectItem value="Moderate Selling">Moderate Selling</SelectItem>
              <SelectItem value="Neutral">Neutral</SelectItem>
              <SelectItem value="Moderate Buying">Moderate Buying</SelectItem>
              <SelectItem value="Heavy Buying">Heavy Buying</SelectItem>
              <SelectItem value="Crazy Buying">Crazy Buying</SelectItem>
            </Select>
            <Select
              value={selectedHighlight}
              onValueChange={onChangeHighlight}
              enableClear={false}
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
            >
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Starred">Starred</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="PSE">PSE</SelectItem>
              <SelectItem value="FnO">Future and Options</SelectItem>
              <SelectItem value="Nifty">Nifty</SelectItem>
              <SelectItem value="NiftyJunior">Nifty Junior</SelectItem>
              <SelectItem value="BankNifty">Nifty Bank</SelectItem>
              <SelectItem value="FinNifty">Nifty Finance</SelectItem>
              <SelectItem value="MidCapNifty">Nifty MidCap</SelectItem>
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
        <Flex className="mt-4 gap-4">
          <div className="w-48">
            <Select
              value={searchType}
              onValueChange={(newType) => setSearchType(newType)}
              enableClear={false}
            >
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Symbol">Symbol</SelectItem>
              <SelectItem value="Name">Name</SelectItem>
              <SelectItem value="Sector">Sector</SelectItem>
              <SelectItem value="Industry">Industry</SelectItem>
            </Select>
          </div>
          <TextInput
            icon={RiSearchLine}
            placeholder="Search..."
            value={searchText}
            onValueChange={onChangeSearchText}
          />
          <Button variant="secondary" icon={RiSearch2Line}>
            Search
          </Button>
        </Flex>
        <StockDataTable
          filteredWithFavorites={filteredWithFavorites}
          priceEarningBySector={priceEarningBySector}
          showFundamentals={showFundamentals}
          showYearlyChange={showYearlyChange}
          showMovingAverages={showMovingAverages}
          // functions
          onSortItems={onSortItems}
          onChangeSector={onChangeSector}
          onChangeFavorites={onChangeFavorites}
        />
        {/* <StockDataTableNew
          filteredWithFavorites={filteredWithFavorites}
          // functions
          onSortItems={onSortItems}
          onChangeSector={onChangeSector}
          onChangeFavorites={onChangeFavorites}
        /> */}
      </Card>
    </>
  );
}

export default memo(StockDataTableCard);
