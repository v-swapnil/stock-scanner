"use client";

import { useState, useCallback } from "react";
import { VisibilityState } from "@tanstack/react-table";
import { COLUMN_GROUPS, ColumnGroup } from "./types";
import { cn } from "@/lib/utils";
import {
  SearchIcon,
  DownloadIcon,
  RefreshIcon,
  FilterIcon,
  ViewGridIcon,
} from "@heroicons/react/outline";
import { ChevronDownIcon } from "@heroicons/react/solid";

interface ScreenerToolbarProps {
  search: string;
  onSearchChange: (search: string) => void;
  totalCount: number;
  filteredCount: number;
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: (visibility: VisibilityState) => void;
  onExport: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export default function ScreenerToolbar({
  search,
  onSearchChange,
  totalCount,
  filteredCount,
  columnVisibility,
  onColumnVisibilityChange,
  onExport,
  onRefresh,
  isLoading,
  showFilters,
  onToggleFilters,
}: ScreenerToolbarProps) {
  const [showColumnGroups, setShowColumnGroups] = useState(false);

  const isGroupVisible = (groupId: ColumnGroup): boolean => {
    const group = COLUMN_GROUPS.find((g) => g.id === groupId);
    if (!group) return true;
    return group.columns.some((col) => columnVisibility[col] !== false);
  };

  const toggleGroup = (groupId: ColumnGroup) => {
    const group = COLUMN_GROUPS.find((g) => g.id === groupId);
    if (!group) return;

    const isCurrentlyVisible = isGroupVisible(groupId);
    const newVisibility = { ...columnVisibility };

    group.columns.forEach((col) => {
      newVisibility[col] = !isCurrentlyVisible;
    });

    onColumnVisibilityChange(newVisibility);
  };

  const showAllColumns = () => {
    const newVisibility: VisibilityState = {};
    COLUMN_GROUPS.forEach((group) => {
      group.columns.forEach((col) => {
        newVisibility[col] = true;
      });
    });
    onColumnVisibilityChange(newVisibility);
  };

  const hideAllExceptBasic = () => {
    const newVisibility: VisibilityState = {};
    COLUMN_GROUPS.forEach((group) => {
      group.columns.forEach((col) => {
        newVisibility[col] = group.id === "basic";
      });
    });
    onColumnVisibilityChange(newVisibility);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Main toolbar row */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by symbol, name, or sector..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
          />
        </div>

        {/* Stock count */}
        <div className="text-sm text-gray-400">
          <span className="text-white font-medium">{filteredCount}</span>
          <span className="mx-1">of</span>
          <span>{totalCount}</span>
          <span className="ml-1">stocks</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Toggle Filters */}
        <button
          onClick={onToggleFilters}
          className={cn(
            "flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors",
            showFilters
              ? "bg-blue-600/20 border-blue-500/50 text-blue-400"
              : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
          )}
        >
          <FilterIcon className="h-4 w-4" />
          Filters
        </button>

        {/* Column Groups Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowColumnGroups(!showColumnGroups)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <ViewGridIcon className="h-4 w-4" />
            Columns
            <ChevronDownIcon
              className={cn(
                "h-4 w-4 transition-transform",
                showColumnGroups && "rotate-180"
              )}
            />
          </button>

          {showColumnGroups && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-20 p-2">
              {/* Quick actions */}
              <div className="flex gap-2 mb-2 pb-2 border-b border-gray-700">
                <button
                  onClick={showAllColumns}
                  className="flex-1 px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                >
                  Show All
                </button>
                <button
                  onClick={hideAllExceptBasic}
                  className="flex-1 px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                >
                  Basic Only
                </button>
              </div>

              {/* Column groups */}
              {COLUMN_GROUPS.map((group) => (
                <button
                  key={group.id}
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm rounded hover:bg-gray-800 transition-colors"
                >
                  <span
                    className={cn(
                      "text-gray-300",
                      !isGroupVisible(group.id) && "text-gray-500"
                    )}
                  >
                    {group.label}
                  </span>
                  <div
                    className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center",
                      isGroupVisible(group.id)
                        ? "bg-blue-600 border-blue-500"
                        : "bg-gray-700 border-gray-600"
                    )}
                  >
                    {isGroupVisible(group.id) && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export */}
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
        >
          <DownloadIcon className="h-4 w-4" />
          Export
        </button>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-lg text-white transition-colors"
        >
          <RefreshIcon
            className={cn("h-4 w-4", isLoading && "animate-spin")}
          />
          Refresh
        </button>
      </div>
    </div>
  );
}
