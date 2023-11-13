import axios from "axios";
import { Flex } from "@tremor/react";
import InsightCard from "@/components/InsightCard";
import StockDataTableCard from "@/components/StockDataTableCard";
import { numberToText } from "@/lib/number-format";

function addStockInsights(stockDetails) {
  const metrics = {
    mCapType:
      stockDetails.marketCapInBillions > 1000
        ? "Large"
        : stockDetails.marketCapInBillions > 500
        ? "Medium"
        : "Small",
    upFromSixMonthLow: "0",
    downFromSixMonthHigh: "0",
    upFromOneYearLow: "0",
    downFromOneYearHigh: "0",
    highlightRed: false,
    highlight: false,
    volumeIncreasedBy: "",
  };
  const currentPrice = parseInt(stockDetails.currentPrice);
  const sixMonthHigh = parseInt(stockDetails.sixMonthHigh);
  const sixMonthLow = parseInt(stockDetails.sixMonthLow);
  if (currentPrice < sixMonthHigh && currentPrice > sixMonthLow) {
    metrics.upFromSixMonthLow = (
      ((currentPrice - sixMonthLow) / sixMonthLow) *
      100
    )?.toFixed(2);
    metrics.downFromSixMonthHigh = (
      ((sixMonthHigh - currentPrice) / sixMonthHigh) *
      100
    )?.toFixed(2);
    metrics.highlightRed =
      currentPrice < sixMonthHigh - (sixMonthHigh - sixMonthLow) * 0.75;
    metrics.highlight =
      currentPrice < sixMonthHigh - (sixMonthHigh - sixMonthLow) * 0.5;
  }
  const oneYearHigh = parseInt(stockDetails.oneYearHigh);
  const oneYearLow = parseInt(stockDetails.oneYearLow);
  if (currentPrice < oneYearHigh && currentPrice > oneYearLow) {
    metrics.upFromOneYearLow = (
      ((currentPrice - oneYearLow) / oneYearLow) *
      100
    )?.toFixed(2);
    metrics.downFromOneYearHigh = (
      ((oneYearHigh - currentPrice) / oneYearHigh) *
      100
    )?.toFixed(2);
  }
  const volume = stockDetails.volumeExact;
  const tenDayAverageVolume = stockDetails.tenDayAverageVolumeExact;
  if (volume > tenDayAverageVolume) {
    const delta = (volume - tenDayAverageVolume) / tenDayAverageVolume;
    if (delta > 0.25) {
      metrics.volumeIncreasedBy = (delta * 100)?.toFixed(0);
    }
  }
  return { ...stockDetails, ...metrics };
}

async function getStockData() {
  const url = "https://scanner.tradingview.com/india/scan";
  const data = {
    filter: [
      { left: "type", operation: "equal", right: "stock" },
      {
        left: "subtype",
        operation: "in_range",
        right: ["common", "foreign-issuer"],
      },
      { left: "exchange", operation: "equal", right: "NSE" },
      {
        left: "market_cap_basic",
        operation: "egreater",
        right: 100000000000,
      },
      { left: "is_primary", operation: "equal", right: true },
      { left: "active_symbol", operation: "equal", right: true },
    ],
    options: { lang: "en" },
    markets: ["india"],
    symbols: { query: { types: [] }, tickers: [] },
    columns: [
      "name",
      "description",
      "sector",
      "close",
      "change_abs",
      "change",
      "change|1W",
      "change|1M",
      "Perf.3M",
      "Perf.6M",
      "Perf.Y",
      "Perf.5Y",
      "market_cap_basic",
      // High / Lows
      "High.6M",
      "Low.6M",
      "price_52_week_high",
      "price_52_week_low",
      "High.All",
      "Low.All",
      // Average Volume
      "average_volume_10d_calc",
      "average_volume_30d_calc",
      "average_volume_90d_calc",
      // IntraDay Volume, Open, Close, High and Low
      "volume",
      "open",
      "close",
      "high",
      "low",
      "change_from_open",
      // Pre Market
      "premarket_change",
      "premarket_volume",
    ],
    sort: { sortBy: "market_cap_basic", sortOrder: "desc" },
    price_conversion: { to_symbol: false },
    range: [0, 500],
  };
  try {
    const response = await axios.post(url, data);
    const dataItems = response.data.data;
    const formattedDataItems = dataItems.map((item: any) => ({
      name: item.d[0],
      description: item.d[1],
      sector: item.d[2],
      currentPrice: item.d[3]?.toFixed(2),
      dayChangeAbs: item.d[4]?.toFixed(2),
      dayChange: item.d[5]?.toFixed(2),
      dayChangeExact: item.d[5],
      weekChange: item.d[6]?.toFixed(2),
      monthChange: item.d[7]?.toFixed(2),
      threeMonthChange: item.d[8]?.toFixed(2),
      sixMonthChange: item.d[9]?.toFixed(2),
      oneYearChange: item.d[10]?.toFixed(2),
      fiveYearChange: item.d[11]?.toFixed(2),
      marketCap: item.d[12],
      marketCapInBillions: item.d[12] / 1000000000,
      delta:
        item.d[5] > 5
          ? "increase"
          : item.d[5] >= 0.5 && item.d[5] <= 5
          ? "moderateIncrease"
          : item.d[5] < -5
          ? "decrease"
          : item.d[5] <= -0.5 && item.d[5] <= -5
          ? "moderateDecrease"
          : "unchanged",
      // Others
      sixMonthHigh: item.d[13]?.toFixed(2),
      sixMonthLow: item.d[14]?.toFixed(2),
      oneYearHigh: item.d[15]?.toFixed(2),
      oneYearLow: item.d[16]?.toFixed(2),
      allTimeHigh: item.d[17]?.toFixed(2),
      allTimeLow: item.d[18]?.toFixed(2),
      tenDayAverageVolume: numberToText(item.d[19]),
      tenDayAverageVolumeExact: item.d[19],
      thirtyDayAverageVolume: numberToText(item.d[20]),
      sixtyDayAverageVolume: numberToText(item.d[21]),
      volume: numberToText(item.d[22]),
      volumeExact: item.d[22],
      volumeDelta: item.d[19] - item.d[22],
      open: item.d[23],
      close: item.d[24],
      high: item.d[25],
      low: item.d[26],
      changeFromOpen: item.d[27]?.toFixed(2),
      preMarketChange: item.d[28]?.toFixed(2),
      preMarketDelta:
        item.d[28] > 5
          ? "increase"
          : item.d[28] >= 0.5 && item.d[28] <= 5
          ? "moderateIncrease"
          : item.d[28] < -5
          ? "decrease"
          : item.d[28] <= -0.5 && item.d[28] <= -5
          ? "moderateDecrease"
          : "unchanged",
      preMarketVolume: numberToText(item.d[29]),
      preMarketVolumeExact: item.d[29],
      perMarketVolumePer: ((item.d[29] / item.d[19]) * 100)?.toFixed(2),
    }));
    return formattedDataItems.map((item) => addStockInsights(item));
  } catch (error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log("error.response", error.response.data);
      console.log("error.response", error.response.status);
      console.log("error.response", error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log("error.request", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log("Error", error.message);
    }
    console.log("error.config", error.config);
  }
}

function getChangePercentageGroup(changeValue) {
  const lowerBound = 0.25;
  const lowerUpperBound = 2.5;
  const upperBound = 5;
  const changePercentage = parseFloat(changeValue);
  // [Crazy Selling] Change less than -upperBound%
  // [Heavy Selling] Change from -lowerUpperBound% to -upperBound%
  // [Moderate Selling] Change from -lowerBound% to -lowerUpperBound%
  // [Neutral] Change around 0%
  // [Moderate Buying] Change from lowerBound% to lowerUpperBound%
  // [Heavy Buying] Change from lowerUpperBound% to upperBound%
  // [Crazy Buying] Change greater than upperBound%
  if (changePercentage <= -upperBound) {
    return "Crazy Selling";
  } else if (
    changePercentage <= -lowerUpperBound &&
    changePercentage > -upperBound
  ) {
    return "Heavy Selling";
  } else if (
    changePercentage <= -lowerBound &&
    changePercentage > -lowerUpperBound
  ) {
    return "Moderate Selling";
  } else if (changePercentage < lowerBound && changePercentage > -lowerBound) {
    return "Neutral";
  } else if (
    changePercentage >= lowerBound &&
    changePercentage < lowerUpperBound
  ) {
    return "Moderate Buying";
  } else if (
    changePercentage >= lowerUpperBound &&
    changePercentage < upperBound
  ) {
    return "Heavy Buying";
  } else if (changePercentage >= upperBound) {
    return "Crazy Buying";
  }
}

function getMetricsFromStockData(stocksDataItems) {
  // const lowerBound = 0.25;
  // const lowerUpperBound = 2.5;
  // const upperBound = 5;
  const changeInsights = {
    "Crazy Selling": [0, 0, 0],
    "Heavy Selling": [0, 0, 0],
    "Moderate Selling": [0, 0, 0],
    Neutral: [0, 0, 0],
    "Moderate Buying": [0, 0, 0],
    "Heavy Buying": [0, 0, 0],
    "Crazy Buying": [0, 0, 0],
  } || [
    [0, 0, 0], // Change less than -upperBound%
    [0, 0, 0], // Change from -lowerUpperBound% to -upperBound%
    [0, 0, 0], // Change from -lowerBound% to -lowerUpperBound%
    [0, 0, 0], // Change around 0%
    [0, 0, 0], // Change from lowerBound% to lowerUpperBound%
    [0, 0, 0], // Change from lowerUpperBound% to upperBound%
    [0, 0, 0], // Change greater than upperBound%
  ];
  stocksDataItems.forEach((item) => {
    // Current Day
    const dayGroupKeyName = getChangePercentageGroup(item.dayChange);
    if (dayGroupKeyName) {
      item.dayChangeType = dayGroupKeyName;
      changeInsights[dayGroupKeyName][0] += 1;
    }
    // Current Week
    const weekGroupKeyName = getChangePercentageGroup(item.dayChange);
    if (weekGroupKeyName) {
      changeInsights[weekGroupKeyName][1] += 1;
    }
    // Current Month
    const monthGroupKeyName = getChangePercentageGroup(item.dayChange);
    if (monthGroupKeyName) {
      changeInsights[monthGroupKeyName][2] += 1;
    }
    // const changePercentage = parseFloat(item.dayChange);
    // if (changePercentage <= -upperBound) {
    //   changeInsights[0][0] = changeInsights[0][0] + 1;
    // } else if (
    //   changePercentage <= -lowerUpperBound &&
    //   changePercentage > -upperBound
    // ) {
    //   changeInsights[1][0] = changeInsights[1][0] + 1;
    // } else if (
    //   changePercentage <= -lowerBound &&
    //   changePercentage > -lowerUpperBound
    // ) {
    //   changeInsights[2][0] = changeInsights[1][0] + 1;
    // } else if (
    //   changePercentage < lowerBound &&
    //   changePercentage > -lowerBound
    // ) {
    //   changeInsights[3][0] = changeInsights[2][0] + 1;
    // } else if (
    //   changePercentage >= lowerBound &&
    //   changePercentage < lowerUpperBound
    // ) {
    //   changeInsights[4][0] = changeInsights[3][0] + 1;
    // } else if (
    //   changePercentage >= lowerUpperBound &&
    //   changePercentage < upperBound
    // ) {
    //   changeInsights[5][0] = changeInsights[3][0] + 1;
    // } else if (changePercentage >= upperBound) {
    //   changeInsights[6][0] = changeInsights[4][0] + 1;
    // }
    // Current Week
    // const changeWeekPercentage = parseFloat(item.weekChange);
    // if (changeWeekPercentage < -upperBound) {
    //   changeInsights[0][1] = changeInsights[0][1] + 1;
    // } else if (
    //   changeWeekPercentage <= -lowerBound &&
    //   changeWeekPercentage >= -upperBound
    // ) {
    //   changeInsights[1][1] = changeInsights[1][1] + 1;
    // } else if (
    //   changeWeekPercentage < lowerBound &&
    //   changeWeekPercentage > -lowerBound
    // ) {
    //   changeInsights[2][1] = changeInsights[2][1] + 1;
    // } else if (
    //   changeWeekPercentage >= lowerBound &&
    //   changeWeekPercentage <= upperBound
    // ) {
    //   changeInsights[3][1] = changeInsights[3][1] + 1;
    // } else if (changeWeekPercentage > upperBound) {
    //   changeInsights[4][1] = changeInsights[4][1] + 1;
    // }
    // Current Month
    // const changeMonthPercentage = parseFloat(item.monthChange);
    // if (changeMonthPercentage < -5) {
    //   changeInsights[0][2] = changeInsights[0][2] + 1;
    // } else if (
    //   changeMonthPercentage <= -lowerBound &&
    //   changeMonthPercentage >= -upperBound
    // ) {
    //   changeInsights[1][2] = changeInsights[1][2] + 1;
    // } else if (
    //   changeMonthPercentage < lowerBound &&
    //   changeMonthPercentage > -lowerBound
    // ) {
    //   changeInsights[2][2] = changeInsights[2][2] + 1;
    // } else if (
    //   changeMonthPercentage >= lowerBound &&
    //   changeMonthPercentage <= upperBound
    // ) {
    //   changeInsights[3][2] = changeInsights[3][2] + 1;
    // } else if (changeMonthPercentage > upperBound) {
    //   changeInsights[4][2] = changeInsights[4][2] + 1;
    // }
  });
  const keyNames = Object.keys(changeInsights);
  const colors = [
    "red",
    "orange",
    "amber",
    "yellow",
    "lime",
    "green",
    "emerald",
  ];
  return {
    changeInsights: keyNames.map((item, index) => ({
      name: item,
      value: changeInsights[item][0],
      color: colors[index],
    })),
    weekChangeInsights: keyNames.map((item, index) => ({
      name: item,
      value: changeInsights[item][1],
      color: colors[index],
    })),
    monthChangeInsights: keyNames.map((item, index) => ({
      name: item,
      value: changeInsights[item][2],
      color: colors[index],
    })),
  };
  // return {
  //   changeInsights: [
  //     { name: "Crazy Selling", value: changeInsights[0][0], color: "red" },
  //     { name: "Heavy Selling", value: changeInsights[1][0], color: "orange" },
  //     { name: "Moderate Selling", value: changeInsights[1][0], color: "amber" },
  //     { name: "Neutral", value: changeInsights[2][0], color: "yellow" },
  //     { name: "Moderate Buying", value: changeInsights[3][0], color: "lime" },
  //     { name: "Heavy Buying", value: changeInsights[3][0], color: "green" },
  //     { name: "Crazy Buying", value: changeInsights[4][0], color: "emerald" },
  //   ],
  //   weekChangeInsights: [
  //     { name: "Crazy Selling", value: changeInsights[0][0], color: "red" },
  //     { name: "Heavy Selling", value: changeInsights[1][0], color: "orange" },
  //     { name: "Moderate Selling", value: changeInsights[1][0], color: "amber" },
  //     { name: "Neutral", value: changeInsights[2][0], color: "yellow" },
  //     { name: "Moderate Buying", value: changeInsights[3][0], color: "lime" },
  //     { name: "Heavy Buying", value: changeInsights[3][0], color: "green" },
  //     { name: "Crazy Buying", value: changeInsights[4][0], color: "emerald" },
  //   ],
  //   monthChangeInsights: [
  //     { name: "Crazy Selling", value: changeInsights[0][0], color: "red" },
  //     { name: "Heavy Selling", value: changeInsights[1][0], color: "orange" },
  //     { name: "Moderate Selling", value: changeInsights[1][0], color: "amber" },
  //     { name: "Neutral", value: changeInsights[2][0], color: "yellow" },
  //     { name: "Moderate Buying", value: changeInsights[3][0], color: "lime" },
  //     { name: "Heavy Buying", value: changeInsights[3][0], color: "green" },
  //     { name: "Crazy Buying", value: changeInsights[4][0], color: "emerald" },
  //   ],
  // };
}

export default async function Home() {
  const stocksDataItems = await getStockData();
  const stocksMetrics = getMetricsFromStockData(stocksDataItems);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Flex>
        <InsightCard title="Day Change" data={stocksMetrics.changeInsights} />
        <InsightCard
          title="Week Change"
          data={stocksMetrics.weekChangeInsights}
        />
        <InsightCard
          title="Month Change"
          data={stocksMetrics.monthChangeInsights}
        />
      </Flex>
      <StockDataTableCard data={stocksDataItems} />
    </main>
  );
}
