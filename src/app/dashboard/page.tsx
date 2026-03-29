"use client";

import { useState, useEffect, useMemo, memo, useCallback } from "react";
import axios from "axios";
import { getMetricsFromStockData } from "@/lib/data-format";
import {
  TPageSearchParams,
  TStockDataItems,
  TStockDataMetricsItem,
} from "@/lib/types";
import { useIndexData } from "@/components/stock/StockDataTableCard/useIndexData";
import StockDataTableCard from "@/components/StockDataTableCard";
import ETFDataTableCard from "@/components/etf/ETFDataTableCard";
import MarketIndicesAnalysis from "@/components/market/MarketIndicesAnalysis";

/* ═══ Constants ═══ */

const CHANGE_COLORS: Record<string, string> = {
  "Crazy Selling": "#ef4444",
  "Heavy Selling": "#f97316",
  "Moderate Selling": "#fbbf24",
  Neutral: "#6b7280",
  "Moderate Buying": "#a3e635",
  "Heavy Buying": "#22c55e",
  "Crazy Buying": "#10b981",
};

const TABS = ["Stocks", "ETFs", "Market Indices"] as const;
type TabId = (typeof TABS)[number];

/* ═══ Market Pulse Strip ═══ */

const PulseMetric = memo(function PulseMetric({
  label,
  price,
  change,
}: {
  label: string;
  price: string | number | undefined;
  change: number | undefined;
}) {
  const isPositive = (change ?? 0) > 0;
  const isNegative = (change ?? 0) < 0;
  return (
    <div className="pulse-cell">
      <span className="pulse-label">{label}</span>
      <span className="pulse-value">{price ?? "—"}</span>
      {change != null && (
        <span
          className={`pulse-change ${isPositive ? "text-emerald-400" : isNegative ? "text-rose-400" : "text-gray-500"}`}
        >
          {isPositive ? "+" : ""}
          {change}
        </span>
      )}
    </div>
  );
});

function MarketPulse({
  sentiment,
  niftyPrice,
  niftyChange,
  bankNiftyPrice,
  bankNiftyChange,
  advanceRatio,
}: {
  sentiment: {
    label: string;
    positive: number;
    negative: number;
    neutral: number;
  } | null;
  niftyPrice: string | number | undefined;
  niftyChange: number | undefined;
  bankNiftyPrice: string | number | undefined;
  bankNiftyChange: number | undefined;
  advanceRatio: number;
}) {
  const glowColor =
    sentiment?.label === "Bullish"
      ? "rgba(16, 185, 129, 0.35)"
      : sentiment?.label === "Bearish"
        ? "rgba(244, 63, 94, 0.35)"
        : "rgba(129, 140, 248, 0.25)";

  return (
    <header
      className="dashboard-pulse"
      style={{ "--pulse-glow": glowColor } as React.CSSProperties}
    >
      <div className="dashboard-pulse-grid">
        {/* Sentiment */}
        <div className="pulse-cell">
          <span className="pulse-label">MARKET</span>
          <span
            className={`pulse-badge pulse-badge-${(sentiment?.label ?? "neutral").toLowerCase()}`}
          >
            {sentiment?.label ?? "—"}
          </span>
          <span className="pulse-sub">
            <span className="text-emerald-400">{sentiment?.positive ?? 0}</span>
            <span className="text-gray-600"> / </span>
            <span className="text-rose-400">{sentiment?.negative ?? 0}</span>
            <span className="text-gray-600"> / </span>
            <span className="text-gray-500">{sentiment?.neutral ?? 0}</span>
          </span>
        </div>

        <PulseMetric
          label="NIFTY 50"
          price={niftyPrice}
          change={niftyChange}
        />
        <PulseMetric
          label="BANK NIFTY"
          price={bankNiftyPrice}
          change={bankNiftyChange}
        />

        {/* Advance / Decline */}
        <div className="pulse-cell">
          <span className="pulse-label">BREADTH</span>
          <div className="ad-bar-track">
            <div
              className="ad-bar-fill"
              style={{ width: `${advanceRatio}%` }}
            />
          </div>
          <div className="flex justify-between">
            <span className="pulse-sub text-emerald-400">
              {advanceRatio}% adv
            </span>
            <span className="pulse-sub text-rose-400">
              {100 - advanceRatio}% dec
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ═══ Change Distribution Bar ═══ */

const ChangeDistribution = memo(function ChangeDistribution({
  label,
  data,
}: {
  label: string;
  data: TStockDataMetricsItem[];
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  // Summarize: count of selling / neutral / buying
  const selling = data
    .filter((d) => d.name.includes("Selling"))
    .reduce((s, d) => s + d.value, 0);
  const buying = data
    .filter((d) => d.name.includes("Buying"))
    .reduce((s, d) => s + d.value, 0);
  const neutral = total - selling - buying;

  return (
    <div className="dist-row">
      <span className="dist-label">{label}</span>
      <div className="dist-bar">
        {data.map((item) => {
          const pct = (item.value / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={item.name}
              className="dist-segment"
              style={{
                width: `${pct}%`,
                backgroundColor: CHANGE_COLORS[item.name] || "#6b7280",
              }}
              data-tooltip={`${item.name}: ${item.value}`}
            />
          );
        })}
      </div>
      <div className="dist-counts">
        <span
          className="dist-count-pill"
          style={{ color: "#f87171", borderColor: "rgba(239,68,68,0.15)" }}
        >
          {selling}
        </span>
        <span className="dist-count-pill">{neutral}</span>
        <span
          className="dist-count-pill"
          style={{ color: "#34d399", borderColor: "rgba(16,185,129,0.15)" }}
        >
          {buying}
        </span>
      </div>
    </div>
  );
});

/* ═══ Loading Skeleton ═══ */

function DashboardSkeleton() {
  return (
    <div className="dashboard">
      {/* Pulse skeleton */}
      <header className="dashboard-pulse">
        <div className="dashboard-pulse-grid skel-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="pulse-cell" style={{ gap: 8 }}>
              <div className="skel-bar" style={{ width: 56, height: 8 }} />
              <div className="skel-bar" style={{ width: 96, height: 22 }} />
              <div className="skel-bar" style={{ width: 72, height: 8 }} />
            </div>
          ))}
        </div>
      </header>

      {/* Distribution skeleton */}
      <div className="dashboard-distribution skel-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="dist-row">
            <div className="skel-bar" style={{ width: 24, height: 8 }} />
            <div className="skel-bar" style={{ flex: 1 }} />
          </div>
        ))}
      </div>

      {/* Tabs skeleton */}
      <nav className="dashboard-tabs skel-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="skel-block"
            style={{ width: 100, height: 36, margin: "4px 4px" }}
          />
        ))}
      </nav>

      {/* Content skeleton */}
      <div className="p-6 skel-pulse" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="skel-block"
            style={{ height: 40, opacity: 1 - i * 0.06 }}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══ Main Dashboard ═══ */

interface IDashboardProps {
  searchParams: TPageSearchParams;
}

function Dashboard({ searchParams }: IDashboardProps) {
  const [isLoading, setLoading] = useState(true);
  const [stocksDataItems, setStocksDataItems] = useState<TStockDataItems>([]);
  const [activeTab, setActiveTab] = useState<TabId>("Stocks");
  const [mountedTabs, setMountedTabs] = useState<Set<TabId>>(
    new Set<TabId>(["Stocks"]),
  );

  const { niftyMetrics, niftyBankMetrics } = useIndexData();

  useEffect(() => {
    const fetchStocks = async () => {
      const response = await axios.get(
        "/api/stocks-scanner?" +
          new URLSearchParams(searchParams as any).toString(),
      );
      setStocksDataItems(response.data || []);
      setLoading(false);
    };
    fetchStocks();
  }, [searchParams]);

  const stocksMetrics = useMemo(
    () => getMetricsFromStockData(stocksDataItems || []),
    [stocksDataItems],
  );

  const sentiment = useMemo(() => {
    if (!stocksDataItems.length) return null;
    let positive = 0;
    let negative = 0;
    stocksDataItems.forEach((item) => {
      if (item.dayChangeExact > 0) positive++;
      else if (item.dayChangeExact < 0) negative++;
    });
    const ratio = positive / stocksDataItems.length;
    return {
      label:
        ratio > 0.6
          ? "Bullish"
          : negative / stocksDataItems.length > 0.6
            ? "Bearish"
            : "Neutral",
      positive,
      negative,
      neutral: stocksDataItems.length - positive - negative,
    };
  }, [stocksDataItems]);

  const advanceRatio = useMemo(() => {
    if (!stocksDataItems.length) return 50;
    const positive = stocksDataItems.filter(
      (s) => s.dayChangeExact > 0,
    ).length;
    return Math.round((positive / stocksDataItems.length) * 100);
  }, [stocksDataItems]);

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setMountedTabs((prev) => {
      if (prev.has(tab)) return prev;
      const next = new Set(prev);
      next.add(tab);
      return next;
    });
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="dashboard">
      <MarketPulse
        sentiment={sentiment}
        niftyPrice={niftyMetrics.price}
        niftyChange={niftyMetrics.pointChanged}
        bankNiftyPrice={niftyBankMetrics.price}
        bankNiftyChange={niftyBankMetrics.pointChanged}
        advanceRatio={advanceRatio}
      />

      <section className="dashboard-distribution">
        <ChangeDistribution
          label="1D"
          data={stocksMetrics.changeInsights}
        />
        <ChangeDistribution
          label="1W"
          data={stocksMetrics.weekChangeInsights}
        />
        <ChangeDistribution
          label="1M"
          data={stocksMetrics.monthChangeInsights}
        />
      </section>

      <nav className="dashboard-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`dashboard-tab ${activeTab === tab ? "dashboard-tab-active" : ""}`}
            onClick={() => handleTabChange(tab)}
          >
            {tab}
            {tab === "Stocks" && stocksDataItems.length > 0 && (
              <span className="dashboard-tab-count">
                {stocksDataItems.length}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="dashboard-content">
        {/* Stocks: always mounted, hidden when inactive (preserves scroll & state) */}
        <div className={activeTab !== "Stocks" ? "hidden" : ""}>
          <StockDataTableCard
            data={stocksDataItems}
            priceEarningBySector={stocksMetrics.priceEarningBySector}
          />
        </div>

        {/* ETFs: mounted on first visit, then persisted */}
        {mountedTabs.has("ETFs") && (
          <div className={activeTab !== "ETFs" ? "hidden" : ""}>
            <ETFDataTableCard />
          </div>
        )}

        {/* Market Indices: mounted on first visit, then persisted */}
        {mountedTabs.has("Market Indices") && (
          <div className={activeTab !== "Market Indices" ? "hidden" : ""}>
            <MarketIndicesAnalysis />
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
