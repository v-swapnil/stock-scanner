"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { SortingState, VisibilityState } from "@tanstack/react-table";
import axios from "axios";
import {
  FundamentalsStock,
  FilterState,
  DEFAULT_FILTERS,
  COLUMN_GROUPS,
} from "./types";
import ScreenerTable from "./ScreenerTable";
import ScreenerFilters from "./ScreenerFilters";
import ScreenerToolbar from "./ScreenerToolbar";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function FundamentalsScreener() {
  const [data, setData] = useState<FundamentalsStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "marketCap", desc: true },
  ]);
  const [showFilters, setShowFilters] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      // Default: show basic, valuation, margins, returns, performance
      const visibility: VisibilityState = {};
      COLUMN_GROUPS.forEach((group) => {
        const isVisible = ["basic", "valuation", "margins", "returns", "performance"].includes(
          group.id
        );
        group.columns.forEach((col) => {
          visibility[col] = isVisible;
        });
      });
      return visibility;
    }
  );

  // Debounce search for better performance
  const debouncedSearch = useDebounce(filters.search, 300);

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/fundamentals-screener", {
        params: {
          limit: 500,
          market_cap_in_billions: 10,
        },
      });
      setData(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
      console.error("Error fetching fundamentals data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get unique sectors
  const availableSectors = useMemo(() => {
    const sectors = new Set<string>();
    data.forEach((stock) => {
      if (stock.sector) {
        sectors.add(stock.sector);
      }
    });
    return Array.from(sectors).sort();
  }, [data]);

  // Apply filters
  const filteredData = useMemo(() => {
    return data.filter((stock) => {
      // Sector filter
      if (
        filters.sectors.length > 0 &&
        !filters.sectors.includes(stock.sector)
      ) {
        return false;
      }

      // Market cap filter
      if (
        filters.marketCapMin !== null &&
        stock.marketCap < filters.marketCapMin
      ) {
        return false;
      }
      if (
        filters.marketCapMax !== null &&
        stock.marketCap > filters.marketCapMax
      ) {
        return false;
      }

      // P/E filter
      if (filters.peMin !== null && stock.priceToEarnings !== null) {
        if (stock.priceToEarnings < filters.peMin) return false;
      }
      if (filters.peMax !== null && stock.priceToEarnings !== null) {
        if (stock.priceToEarnings > filters.peMax) return false;
      }

      // ROE filter
      if (filters.roeMin !== null && stock.roe !== null) {
        if (stock.roe < filters.roeMin) return false;
      }
      if (filters.roeMax !== null && stock.roe !== null) {
        if (stock.roe > filters.roeMax) return false;
      }

      return true;
    });
  }, [data, filters]);

  // Export to CSV
  const handleExport = useCallback(() => {
    const headers = [
      "Symbol",
      "Name",
      "Price",
      "Market Cap",
      "Sector",
      "EPS Dil TTM",
      "P/E",
      "Fwd P/E",
      "P/S",
      "P/B",
      "P/FCF",
      "PEG",
      "Gross Margin",
      "Op Margin",
      "Net Margin",
      "ROCE",
      "ROA",
      "ROE",
      "ROIC",
      "Revenue TTM",
      "Gross Profit TTM",
      "Op Income TTM",
      "Net Income TTM",
      "Total Assets",
      "Total Liabilities",
      "Total Debt",
      "Cash",
      "Revenue Growth",
      "GP Growth",
      "NI Growth",
      "1W",
      "1M",
      "3M",
      "6M",
      "1Y",
      "5Y",
    ];

    const rows = filteredData.map((stock) => [
      stock.symbol,
      stock.name,
      stock.price,
      stock.marketCap,
      stock.sector,
      stock.epsDilutedTTM,
      stock.priceToEarnings,
      stock.forwardPriceToEarnings,
      stock.priceToSales,
      stock.priceToBook,
      stock.priceToCash,
      stock.pegTTM,
      stock.grossMargin,
      stock.operatingMargin,
      stock.netMargin,
      stock.roce,
      stock.roa,
      stock.roe,
      stock.roic,
      stock.revenueTTM,
      stock.grossProfitTTM,
      stock.operatingIncomeTTM,
      stock.netIncomeTTM,
      stock.totalAssets,
      stock.totalLiabilities,
      stock.totalDebt,
      stock.cashOnHand,
      stock.revenueGrowthTTM,
      stock.grossProfitGrowthTTM,
      stock.netIncomeGrowthTTM,
      stock.perf1W,
      stock.perf1M,
      stock.perf3M,
      stock.perf6M,
      stock.perf1Y,
      stock.perf5Y,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => (cell === null ? "" : `"${cell}"`)).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `fundamentals-screener-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredData]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-1">
          Fundamentals Screener
        </h1>
        <p className="text-sm text-gray-400">
          Analyze stocks by valuation, margins, returns, and growth metrics
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-4">
        <ScreenerToolbar
          search={filters.search}
          onSearchChange={(search) => setFilters((f) => ({ ...f, search }))}
          totalCount={data.length}
          filteredCount={filteredData.length}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          onExport={handleExport}
          onRefresh={fetchData}
          isLoading={isLoading}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-4">
          <ScreenerFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableSectors={availableSectors}
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-[calc(100vh-220px)] bg-gray-900/50 border border-gray-800 rounded-lg">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-600 border-t-blue-500 mb-4"></div>
            <p className="text-gray-400">Loading fundamentals data...</p>
          </div>
        </div>
      ) : (
        <ScreenerTable
          data={filteredData}
          sorting={sorting}
          onSortingChange={setSorting}
          globalFilter={debouncedSearch}
          columnVisibility={columnVisibility}
        />
      )}
    </div>
  );
}
