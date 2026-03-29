"use client";

import { useRef, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { FundamentalsStock, COLUMN_GROUPS, ColumnGroup } from "./types";
import { createColumns } from "./columns";
import { cn } from "@/lib/utils";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/solid";

interface ScreenerTableProps {
  data: FundamentalsStock[];
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  globalFilter: string;
  columnVisibility: VisibilityState;
}

const ROW_HEIGHT = 40;

export default function ScreenerTable({
  data,
  sorting,
  onSortingChange,
  globalFilter,
  columnVisibility,
}: ScreenerTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const columns = useMemo(() => createColumns(), []);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === "function" ? updater(sorting) : updater;
      onSortingChange(newSorting);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      const symbol = row.original.symbol?.toLowerCase() || "";
      const name = row.original.name?.toLowerCase() || "";
      const sector = row.original.sector?.toLowerCase() || "";
      return (
        symbol.includes(search) ||
        name.includes(search) ||
        sector.includes(search)
      );
    },
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => ROW_HEIGHT,
    getScrollElement: () => tableContainerRef.current,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows[virtualRows.length - 1]?.end || 0)
      : 0;

  // Get column group for a column
  const getColumnGroup = (columnId: string): ColumnGroup | null => {
    for (const group of COLUMN_GROUPS) {
      if (group.columns.includes(columnId)) {
        return group.id;
      }
    }
    return null;
  };

  // Get group header color
  const getGroupColor = (group: ColumnGroup | null): string => {
    const colors: Record<ColumnGroup, string> = {
      basic: "bg-slate-800",
      valuation: "bg-indigo-900/50",
      margins: "bg-purple-900/50",
      returns: "bg-emerald-900/50",
      income: "bg-blue-900/50",
      balanceSheet: "bg-amber-900/50",
      growth: "bg-cyan-900/50",
      performance: "bg-rose-900/50",
    };
    return group ? colors[group] : "bg-slate-800";
  };

  return (
    <div
      ref={tableContainerRef}
      className="overflow-auto h-[calc(100vh-220px)] border border-gray-800 rounded-lg bg-gray-950"
    >
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10">
          {/* Column group headers */}
          <tr className="bg-gray-900">
            {table.getHeaderGroups()[0].headers.map((header) => {
              const group = getColumnGroup(header.id);
              const groupConfig = COLUMN_GROUPS.find((g) => g.id === group);
              return (
                <th
                  key={header.id}
                  className={cn(
                    "px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-gray-400 border-b border-gray-800",
                    getGroupColor(group)
                  )}
                  style={{ width: header.getSize() }}
                >
                  {groupConfig?.label || ""}
                </th>
              );
            })}
          </tr>
          {/* Column headers */}
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-gray-900">
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                const group = getColumnGroup(header.id);

                return (
                  <th
                    key={header.id}
                    className={cn(
                      "px-3 py-2 text-left text-xs font-semibold text-gray-200 border-b border-gray-700",
                      canSort && "cursor-pointer select-none hover:bg-gray-800/50",
                      getGroupColor(group)
                    )}
                    style={{ width: header.getSize() }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {canSort && (
                        <span className="inline-flex flex-col ml-1">
                          <ChevronUpIcon
                            className={cn(
                              "h-3 w-3 -mb-1",
                              sorted === "asc"
                                ? "text-blue-400"
                                : "text-gray-600"
                            )}
                          />
                          <ChevronDownIcon
                            className={cn(
                              "h-3 w-3 -mt-1",
                              sorted === "desc"
                                ? "text-blue-400"
                                : "text-gray-600"
                            )}
                          />
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {paddingTop > 0 && (
            <tr>
              <td style={{ height: `${paddingTop}px` }} />
            </tr>
          )}
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors",
                  virtualRow.index % 2 === 0 ? "bg-gray-950" : "bg-gray-900/30"
                )}
                style={{ height: `${ROW_HEIGHT}px` }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-3 py-2 text-sm whitespace-nowrap"
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
          {paddingBottom > 0 && (
            <tr>
              <td style={{ height: `${paddingBottom}px` }} />
            </tr>
          )}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="flex items-center justify-center h-40 text-gray-500">
          No stocks found matching your criteria
        </div>
      )}
    </div>
  );
}
