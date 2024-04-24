import { ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import {
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiStarFill,
  RiStarLine,
} from "@remixicon/react";
import {
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
  Flex,
  Icon,
  BadgeDelta,
} from "@tremor/react";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { TStockDataItem } from "@/lib/types";
import StockHighlights from "./StockHighlights";
import StockRangeBar from "./StockRangeBar";

const classNames = (...classes: any) => classes.filter(Boolean).join(" ");

interface IStockDataTableProps {
  filteredWithFavorites: Array<TStockDataItem>;
  // functions
  onSortItems: (key: string, dir: string) => void;
  onChangeSector: (sector: string, isIndustry?: boolean) => void;
  onChangeFavorites: (stockData: TStockDataItem) => void;
}

const StockDataTableNew = ({
  filteredWithFavorites,
  // functions
  onSortItems,
  onChangeSector,
  onChangeFavorites,
}: IStockDataTableProps): ReactElement => {
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    onSortItems(
      sorting.length === 0 ? "marketCapExact" : sorting[0].id,
      sorting.length === 0 || sorting[0].desc ? "desc" : "asc"
    );
  }, [sorting, onSortItems]);

  const columns = useMemo(() => {
    const columnDefs: Array<ColumnDef<TStockDataItem>> = [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <Flex justifyContent="start">
            {row.original.description} ({row.original.name})
            <Badge
              className="ml-2"
              color={
                row.original.mCapType === "Large"
                  ? "emerald"
                  : row.original.mCapType === "Mid"
                  ? "orange"
                  : "rose"
              }
            >
              {row.original.mCapType}
            </Badge>
            {row.original.isFnO && (
              <Badge className="ml-2" color="purple">
                FnO
              </Badge>
            )}
            {row.original.isIndex && (
              <Badge className="ml-2" color="cyan">
                Index
              </Badge>
            )}
            <Icon
              className="cursor-pointer"
              onClick={() => onChangeFavorites(row.original)}
              icon={row.original.isStarred ? RiStarFill : RiStarLine}
              color="emerald"
            />
          </Flex>
        ),
        meta: { align: "text-left" },
        enableSorting: false,
      },
      {
        accessorKey: "currentPriceExact",
        header: "Price",
        cell: ({ row }) => (
          <Badge color="gray">{row.original.currentPrice}</Badge>
        ),
        meta: { align: "text-right" },
        enableSorting: true,
        sortingFn: "basic",
      },
      {
        accessorKey: "priceEarningTTMExact",
        header: "PE",
        cell: ({ row }) => (
          <Badge
            color={
              row.original.priceEarningTTMExact <= 25
                ? "emerald"
                : row.original.priceEarningTTMExact <= 75
                ? "orange"
                : "rose"
            }
          >
            {row.original.priceEarningTTM}
          </Badge>
        ),
        meta: { align: "text-right" },
        enableSorting: true,
      },
      {
        accessorKey: "preMarketChangeExact",
        header: "Pre CG",
        cell: ({ row }) => (
          <BadgeDelta
            deltaType={row.original.preMarketChangeDeltaType}
            isIncreasePositive={true}
          >
            {row.original.preMarketChange}%
          </BadgeDelta>
        ),
        meta: { align: "text-right" },
        enableSorting: true,
      },
      {
        accessorKey: "dayChangeExact",
        header: "1D CG",
        cell: ({ row }) => (
          <BadgeDelta deltaType={row.original.dayChangeDeltaType}>
            {row.original.dayChange}%
          </BadgeDelta>
        ),
        meta: { align: "text-right" },
        enableSorting: true,
      },
      {
        accessorKey: "weekChangeExact",
        header: "1W CG",
        cell: ({ row }) => (
          <BadgeDelta
            deltaType={
              row.original.weekChangeExact === 0
                ? "unchanged"
                : row.original.weekChangeExact > 0
                ? "increase"
                : "decrease"
            }
          >
            {row.original.weekChange}%
          </BadgeDelta>
        ),
        meta: { align: "text-right" },
        enableSorting: true,
      },
      {
        accessorKey: "monthChangeExact",
        header: "1M CG",
        cell: ({ row }) => (
          <BadgeDelta
            deltaType={
              row.original.monthChangeExact === 0
                ? "unchanged"
                : row.original.monthChangeExact > 0
                ? "increase"
                : "decrease"
            }
          >
            {row.original.monthChange}%
          </BadgeDelta>
        ),
        meta: { align: "text-right" },
        enableSorting: true,
      },

      {
        accessorKey: "threeMonthChangeExact",
        header: "3M CG",
        cell: ({ row }) => (
          <BadgeDelta
            deltaType={
              row.original.threeMonthChangeExact === 0
                ? "unchanged"
                : row.original.threeMonthChangeExact > 0
                ? "increase"
                : "decrease"
            }
          >
            {row.original.threeMonthChange}%
          </BadgeDelta>
        ),
        meta: { align: "text-right" },
        enableSorting: true,
      },
      {
        accessorKey: "upFromOneYearLowExact",
        header: "Up 6M / 1Y Low",
        cell: ({ row }) => (
          <Flex justifyContent="start">
            <BadgeDelta deltaType="increase" className="mr-2">
              {row.original.upFromSixMonthLow}%
            </BadgeDelta>
            <BadgeDelta deltaType="increase">
              {row.original.upFromOneYearLow}%
            </BadgeDelta>
          </Flex>
        ),
        meta: { align: "text-left" },
        enableSorting: true,
      },
      {
        accessorKey: "downFromOneYearHighExact",
        header: "Down 6M / 1Y High",
        cell: ({ row }) => (
          <Flex justifyContent="start">
            <BadgeDelta deltaType="decrease" className="mr-2">
              {row.original.downFromSixMonthHigh}%
            </BadgeDelta>
            <BadgeDelta deltaType="decrease">
              {row.original.downFromOneYearHigh}%
            </BadgeDelta>
          </Flex>
        ),
        meta: { align: "text-right" },
        enableSorting: true,
      },
      {
        accessorKey: "marketCapExact",
        header: "MCap",
        cell: ({ row }) => <Badge color="gray">{row.original.marketCap}</Badge>,
        meta: { align: "text-right" },
        enableSorting: true,
      },
      {
        accessorKey: "freeFloatSharesPerExact",
        header: "FFS %",
        cell: ({ row }) => (
          <Badge
            color={
              row.original.freeFloatSharesPerExact >= 75
                ? "emerald"
                : row.original.freeFloatSharesPerExact >= 25
                ? "orange"
                : "rose"
            }
          >
            {row.original.freeFloatSharesPer}%
          </Badge>
        ),
        meta: { align: "text-right" },
        enableSorting: true,
      },
      {
        accessorKey: "tenDayAverageVolume",
        header: "Avg Volume",
        cell: ({ row }) => (
          <Badge color="gray">{row.original.tenDayAverageVolume}</Badge>
        ),
        meta: { align: "text-left" },
        enableSorting: false,
      },
      {
        accessorKey: "volume",
        header: "Volume",
        cell: ({ row }) => (
          <Flex justifyContent="end">
            {row.original.volumeIncreasedBy ? (
              <BadgeDelta deltaType="increase">
                {row.original.volume} ({row.original.volumeIncreasedBy}%)
              </BadgeDelta>
            ) : (
              <Badge color="gray">{row.original.volume}</Badge>
            )}
          </Flex>
        ),
        meta: { align: "text-right" },
        enableSorting: false,
      },
      {
        accessorKey: "sector",
        header: "Sector / Industry",
        cell: ({ row }) => (
          <Flex justifyContent="start">
            <Badge
              className="cursor-pointer mr-2"
              color="sky"
              onClick={() => onChangeSector(row.original.sector, true)}
            >
              {row.original.sector}
            </Badge>
            <Badge
              className="cursor-pointer"
              color="sky"
              onClick={() => onChangeSector(row.original.industry)}
            >
              {row.original.industry}
            </Badge>
          </Flex>
        ),
        meta: { align: "text-left" },
        enableSorting: false,
      },
      {
        accessorKey: "highlights",
        header: "Highlights",
        cell: ({ row }) => (
          <StockHighlights highlights={row.original.consolidatedHighlights} />
        ),
        meta: { align: "text-right" },
        enableSorting: false,
      },
      {
        accessorKey: "dayRangeBar",
        header: "Day Range",
        cell: ({ row }) => (
          <StockRangeBar
            low={row.original.low}
            high={row.original.high}
            current={row.original.currentPriceExact}
          />
        ),
        meta: { align: "text-right" },
        enableSorting: false,
      },
    ];
    return columnDefs;
  }, [onChangeFavorites, onChangeSector]);

  const table = useReactTable({
    data: filteredWithFavorites,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    // getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    enableMultiSort: false,
    manualSorting: true,
    onSortingChange: setSorting,
  });

  return (
    <Table>
      <TableHead>
        {table.getHeaderGroups().map((headerGroup, headerGroupIndex) => (
          <TableRow
            key={headerGroup.id + "-" + headerGroupIndex}
            className="border-b border-tremor-border dark:border-dark-tremor-border"
          >
            {headerGroup.headers.map((header, headerIndex) => (
              <TableHeaderCell
                key={header.id + "-" + headerIndex}
                onClick={header.column.getToggleSortingHandler()}
                className={classNames(
                  header.column.getCanSort()
                    ? "cursor-pointer select-none"
                    : "",
                  "px-0.5 py-1.5"
                )}
              >
                <div
                  className={classNames(
                    header.column.columnDef.enableSorting === true
                      ? "flex items-center hover:bg-tremor-background-muted hover:dark:bg-dark-tremor-background-muted"
                      : "",
                    header.column.columnDef.meta?.align,
                    header.column.columnDef.meta?.align === "text-right"
                      ? "justify-end"
                      : "justify-start",
                    " rounded-tremor-default px-3 py-1.5"
                  )}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {header.column.getCanSort() ? (
                    <div className="-space-y-2 ml-2">
                      <RiArrowUpSLine
                        className={classNames(
                          "h-4 w-4 text-tremor-content-strong dark:text-dark-tremor-content-strong",
                          header.column.getIsSorted() === "desc"
                            ? "opacity-30"
                            : ""
                        )}
                        aria-hidden={true}
                      />
                      <RiArrowDownSLine
                        className={classNames(
                          "h-4 w-4 text-tremor-content-strong dark:text-dark-tremor-content-strong",
                          header.column.getIsSorted() === "asc"
                            ? "opacity-30"
                            : ""
                        )}
                        aria-hidden={true}
                      />
                    </div>
                  ) : null}
                </div>
              </TableHeaderCell>
            ))}
          </TableRow>
        ))}
      </TableHead>
      <TableBody>
        {table.getRowModel().rows.map((row, rowIndex) => (
          <TableRow key={row.id + "-" + rowIndex}>
            {row.getVisibleCells().map((cell, cellIndex) => (
              <TableCell
                key={cell.id + "-" + cellIndex}
                className={classNames(cell.column.columnDef.meta?.align)}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default StockDataTableNew;
