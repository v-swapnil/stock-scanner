"use client";

import { useMemo } from "react";
import { FilterState, MARKET_CAP_PRESETS } from "./types";
import { cn } from "@/lib/utils";

interface ScreenerFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableSectors: string[];
}

export default function ScreenerFilters({
  filters,
  onFiltersChange,
  availableSectors,
}: ScreenerFiltersProps) {
  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleSector = (sector: string) => {
    const newSectors = filters.sectors.includes(sector)
      ? filters.sectors.filter((s) => s !== sector)
      : [...filters.sectors, sector];
    updateFilter("sectors", newSectors);
  };

  const setMarketCapPreset = (min: number | null, max: number | null) => {
    onFiltersChange({
      ...filters,
      marketCapMin: min,
      marketCapMax: max,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: filters.search, // keep search
      sectors: [],
      marketCapMin: null,
      marketCapMax: null,
      peMin: null,
      peMax: null,
      roeMin: null,
      roeMax: null,
    });
  };

  const hasActiveFilters =
    filters.sectors.length > 0 ||
    filters.marketCapMin !== null ||
    filters.marketCapMax !== null ||
    filters.peMin !== null ||
    filters.peMax !== null ||
    filters.roeMin !== null ||
    filters.roeMax !== null;

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 space-y-4">
      {/* Market Cap Presets */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2">
          Market Cap
        </label>
        <div className="flex flex-wrap gap-2">
          {MARKET_CAP_PRESETS.map((preset) => {
            const isActive =
              filters.marketCapMin === preset.min &&
              filters.marketCapMax === preset.max;
            return (
              <button
                key={preset.label}
                onClick={() => setMarketCapPreset(preset.min, preset.max)}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-md border transition-colors",
                  isActive
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sectors */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-2">
          Sectors ({filters.sectors.length} selected)
        </label>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {availableSectors.map((sector) => {
            const isActive = filters.sectors.includes(sector);
            return (
              <button
                key={sector}
                onClick={() => toggleSector(sector)}
                className={cn(
                  "px-2 py-1 text-xs rounded border transition-colors",
                  isActive
                    ? "bg-blue-600/80 border-blue-500 text-white"
                    : "bg-gray-800/50 border-gray-700 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
                )}
              >
                {sector || "Unknown"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Numeric Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* P/E Range */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            P/E Range
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.peMin ?? ""}
              onChange={(e) =>
                updateFilter(
                  "peMin",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full px-2 py-1.5 text-xs bg-gray-800 border border-gray-700 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.peMax ?? ""}
              onChange={(e) =>
                updateFilter(
                  "peMax",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full px-2 py-1.5 text-xs bg-gray-800 border border-gray-700 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* ROE Range */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            ROE Range (%)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.roeMin ?? ""}
              onChange={(e) =>
                updateFilter(
                  "roeMin",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full px-2 py-1.5 text-xs bg-gray-800 border border-gray-700 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.roeMax ?? ""}
              onChange={(e) =>
                updateFilter(
                  "roeMax",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full px-2 py-1.5 text-xs bg-gray-800 border border-gray-700 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
