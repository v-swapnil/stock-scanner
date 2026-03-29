import { ColumnDef } from "@tanstack/react-table";
import { FundamentalsStock } from "./types";
import { cn } from "@/lib/utils";

// Format number with Indian numbering system
function formatIndianNumber(num: number | null): string {
  if (num === null || num === undefined || isNaN(num)) return "-";
  return num.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

// Format large numbers (Cr, L Cr, etc.)
function formatMarketCap(num: number | null): string {
  if (num === null || num === undefined || isNaN(num)) return "-";
  const crore = num / 10000000;
  if (crore >= 100000) {
    return `${(crore / 100000).toFixed(2)} L Cr`;
  }
  if (crore >= 1000) {
    return `${(crore / 1000).toFixed(2)} K Cr`;
  }
  return `${crore.toFixed(2)} Cr`;
}

// Format percentage
function formatPercent(num: number | null, decimals: number = 2): string {
  if (num === null || num === undefined || isNaN(num)) return "-";
  return `${num.toFixed(decimals)}%`;
}

// Format ratio
function formatRatio(num: number | null): string {
  if (num === null || num === undefined || isNaN(num)) return "-";
  return num.toFixed(2);
}

// Color based on value (positive/negative)
function getChangeColor(value: number | null): string {
  if (value === null || value === undefined) return "";
  if (value > 0) return "text-emerald-400";
  if (value < 0) return "text-red-400";
  return "";
}

// Color for margins/returns (gradient based on value)
function getMarginColor(value: number | null): string {
  if (value === null || value === undefined) return "";
  if (value >= 20) return "text-emerald-400";
  if (value >= 10) return "text-emerald-300/80";
  if (value >= 0) return "text-gray-300";
  return "text-red-400";
}

// Color for P/E ratio
function getPEColor(value: number | null): string {
  if (value === null || value === undefined) return "";
  if (value < 0) return "text-red-400";
  if (value <= 15) return "text-emerald-400";
  if (value <= 25) return "text-yellow-400";
  return "text-orange-400";
}

// Cell component with alignment
function NumericCell({
  value,
  formatter,
  colorFn,
}: {
  value: number | null;
  formatter: (v: number | null) => string;
  colorFn?: (v: number | null) => string;
}) {
  return (
    <span className={cn("tabular-nums", colorFn?.(value))}>
      {formatter(value)}
    </span>
  );
}

export function createColumns(): ColumnDef<FundamentalsStock>[] {
  return [
    // Basic Info
    {
      id: "symbol",
      accessorKey: "symbol",
      header: "Symbol",
      size: 100,
      cell: ({ row }) => (
        <div className="font-medium text-white">{row.original.symbol}</div>
      ),
      enableSorting: true,
    },
    {
      id: "price",
      accessorKey: "price",
      header: "Price",
      size: 90,
      cell: ({ row }) => (
        <NumericCell
          value={row.original.price}
          formatter={(v) => `₹${formatIndianNumber(v)}`}
        />
      ),
      enableSorting: true,
    },
    {
      id: "marketCap",
      accessorKey: "marketCap",
      header: "Market Cap",
      size: 110,
      cell: ({ row }) => (
        <NumericCell value={row.original.marketCap} formatter={formatMarketCap} />
      ),
      enableSorting: true,
    },
    {
      id: "sector",
      accessorKey: "sector",
      header: "Sector",
      size: 150,
      cell: ({ row }) => (
        <span className="text-gray-300 truncate block max-w-[140px]" title={row.original.sector}>
          {row.original.sector || "-"}
        </span>
      ),
      enableSorting: true,
    },

    // Valuation
    {
      id: "epsDilutedTTM",
      accessorKey: "epsDilutedTTM",
      header: "EPS Dil TTM",
      size: 100,
      cell: ({ row }) => (
        <NumericCell
          value={row.original.epsDilutedTTM}
          formatter={formatRatio}
          colorFn={getChangeColor}
        />
      ),
      enableSorting: true,
    },
    {
      id: "priceToEarnings",
      accessorKey: "priceToEarnings",
      header: "P/E",
      size: 70,
      cell: ({ row }) => (
        <NumericCell
          value={row.original.priceToEarnings}
          formatter={formatRatio}
          colorFn={getPEColor}
        />
      ),
      enableSorting: true,
    },
    {
      id: "forwardPriceToEarnings",
      accessorKey: "forwardPriceToEarnings",
      header: "Fwd P/E",
      size: 80,
      cell: ({ row }) => (
        <NumericCell
          value={row.original.forwardPriceToEarnings}
          formatter={formatRatio}
          colorFn={getPEColor}
        />
      ),
      enableSorting: true,
    },
    {
      id: "priceToSales",
      accessorKey: "priceToSales",
      header: "P/S",
      size: 70,
      cell: ({ row }) => (
        <NumericCell value={row.original.priceToSales} formatter={formatRatio} />
      ),
      enableSorting: true,
    },
    {
      id: "priceToBook",
      accessorKey: "priceToBook",
      header: "P/B",
      size: 70,
      cell: ({ row }) => (
        <NumericCell value={row.original.priceToBook} formatter={formatRatio} />
      ),
      enableSorting: true,
    },
    {
      id: "priceToCash",
      accessorKey: "priceToCash",
      header: "P/FCF",
      size: 80,
      cell: ({ row }) => (
        <NumericCell value={row.original.priceToCash} formatter={formatRatio} />
      ),
      enableSorting: true,
    },
    {
      id: "pegTTM",
      accessorKey: "pegTTM",
      header: "PEG",
      size: 70,
      cell: ({ row }) => (
        <NumericCell value={row.original.pegTTM} formatter={formatRatio} />
      ),
      enableSorting: true,
    },

    // Margins
    {
      id: "grossMargin",
      accessorKey: "grossMargin",
      header: "Gross Margin",
      size: 110,
      cell: ({ row }) => (
        <NumericCell
          value={row.original.grossMargin}
          formatter={formatPercent}
          colorFn={getMarginColor}
        />
      ),
      enableSorting: true,
    },
    {
      id: "operatingMargin",
      accessorKey: "operatingMargin",
      header: "Op Margin",
      size: 100,
      cell: ({ row }) => (
        <NumericCell
          value={row.original.operatingMargin}
          formatter={formatPercent}
          colorFn={getMarginColor}
        />
      ),
      enableSorting: true,
    },
    {
      id: "netMargin",
      accessorKey: "netMargin",
      header: "Net Margin",
      size: 100,
      cell: ({ row }) => (
        <NumericCell
          value={row.original.netMargin}
          formatter={formatPercent}
          colorFn={getMarginColor}
        />
      ),
      enableSorting: true,
    },

    // Returns
    {
      id: "roce",
      accessorKey: "roce",
      header: "ROCE",
      size: 80,
      cell: ({ row }) => (
        <NumericCell
          value={row.original.roce}
          formatter={formatPercent}
          colorFn={getMarginColor}
        />
      ),
      enableSorting: true,
    },
    {
      id: "roa",
      accessorKey: "roa",
      header: "ROA",
      size: 80,
      cell: ({ row }) => (
        <NumericCell
          value={row.original.roa}
          formatter={formatPercent}
          colorFn={getMarginColor}
        />
      ),
      enableSorting: true,
    },
    {
      id: "roe",
      accessorKey: "roe",
      header: "ROE",
      size: 80,
      cell: ({ row }) => (
        <NumericCell
          value={row.original.roe}
          formatter={formatPercent}
          colorFn={getMarginColor}
        />
      ),
      enableSorting: true,
    },
    {
      id: "roic",
      accessorKey: "roic",
      header: "ROIC",
      size: 80,
      cell: ({ row }) => (
        <NumericCell
          value={row.original.roic}
          formatter={formatPercent}
          colorFn={getMarginColor}
        />
      ),
      enableSorting: true,
    },

    // Income Statement
    {
      id: "revenueTTM",
      accessorKey: "revenueTTM",
      header: "Revenue TTM",
      size: 110,
      cell: ({ row }) => (
        <NumericCell value={row.original.revenueTTM} formatter={formatMarketCap} />
      ),
      enableSorting: true,
    },
    {
      id: "grossProfitTTM",
      accessorKey: "grossProfitTTM",
      header: "Gross Profit",
      size: 110,
      cell: ({ row }) => (
        <NumericCell
          value={row.original.grossProfitTTM}
          formatter={formatMarketCap}
        />
      ),
      enableSorting: true,
    },
    {
      id: "operatingIncomeTTM",
      accessorKey: "operatingIncomeTTM",
      header: "Op Income",
      size: 100,
      cell: ({ row }) => (
        <NumericCell
          value={row.original.operatingIncomeTTM}
          formatter={formatMarketCap}
        />
      ),
      enableSorting: true,
    },
    {
      id: "netIncomeTTM",
      accessorKey: "netIncomeTTM",
      header: "Net Income",
      size: 100,
      cell: ({ row }) => (
        <NumericCell
          value={row.original.netIncomeTTM}
          formatter={formatMarketCap}
        />
      ),
      enableSorting: true,
    },

    // Balance Sheet
    {
      id: "totalAssets",
      accessorKey: "totalAssets",
      header: "Total Assets",
      size: 110,
      cell: ({ row }) => (
        <NumericCell value={row.original.totalAssets} formatter={formatMarketCap} />
      ),
      enableSorting: true,
    },
    {
      id: "totalLiabilities",
      accessorKey: "totalLiabilities",
      header: "Total Liab",
      size: 100,
      cell: ({ row }) => (
        <NumericCell
          value={row.original.totalLiabilities}
          formatter={formatMarketCap}
        />
      ),
      enableSorting: true,
    },
    {
      id: "totalDebt",
      accessorKey: "totalDebt",
      header: "Total Debt",
      size: 100,
      cell: ({ row }) => (
        <NumericCell value={row.original.totalDebt} formatter={formatMarketCap} />
      ),
      enableSorting: true,
    },
    {
      id: "cashOnHand",
      accessorKey: "cashOnHand",
      header: "Cash",
      size: 90,
      cell: ({ row }) => (
        <NumericCell value={row.original.cashOnHand} formatter={formatMarketCap} />
      ),
      enableSorting: true,
    },

    // Growth
    {
      id: "revenueGrowthTTM",
      accessorKey: "revenueGrowthTTM",
      header: "Rev Growth",
      size: 100,
      cell: ({ row }) => (
        <NumericCell
          value={row.original.revenueGrowthTTM}
          formatter={formatPercent}
          colorFn={getChangeColor}
        />
      ),
      enableSorting: true,
    },
    {
      id: "grossProfitGrowthTTM",
      accessorKey: "grossProfitGrowthTTM",
      header: "GP Growth",
      size: 100,
      cell: ({ row }) => (
        <NumericCell
          value={row.original.grossProfitGrowthTTM}
          formatter={formatPercent}
          colorFn={getChangeColor}
        />
      ),
      enableSorting: true,
    },
    {
      id: "netIncomeGrowthTTM",
      accessorKey: "netIncomeGrowthTTM",
      header: "NI Growth",
      size: 100,
      cell: ({ row }) => (
        <NumericCell
          value={row.original.netIncomeGrowthTTM}
          formatter={formatPercent}
          colorFn={getChangeColor}
        />
      ),
      enableSorting: true,
    },

    // Performance
    {
      id: "perf1W",
      accessorKey: "perf1W",
      header: "1W",
      size: 70,
      cell: ({ row }) => (
        <NumericCell
          value={row.original.perf1W}
          formatter={formatPercent}
          colorFn={getChangeColor}
        />
      ),
      enableSorting: true,
    },
    {
      id: "perf1M",
      accessorKey: "perf1M",
      header: "1M",
      size: 70,
      cell: ({ row }) => (
        <NumericCell
          value={row.original.perf1M}
          formatter={formatPercent}
          colorFn={getChangeColor}
        />
      ),
      enableSorting: true,
    },
    {
      id: "perf3M",
      accessorKey: "perf3M",
      header: "3M",
      size: 70,
      cell: ({ row }) => (
        <NumericCell
          value={row.original.perf3M}
          formatter={formatPercent}
          colorFn={getChangeColor}
        />
      ),
      enableSorting: true,
    },
    {
      id: "perf6M",
      accessorKey: "perf6M",
      header: "6M",
      size: 70,
      cell: ({ row }) => (
        <NumericCell
          value={row.original.perf6M}
          formatter={formatPercent}
          colorFn={getChangeColor}
        />
      ),
      enableSorting: true,
    },
    {
      id: "perf1Y",
      accessorKey: "perf1Y",
      header: "1Y",
      size: 70,
      cell: ({ row }) => (
        <NumericCell
          value={row.original.perf1Y}
          formatter={formatPercent}
          colorFn={getChangeColor}
        />
      ),
      enableSorting: true,
    },
    {
      id: "perf5Y",
      accessorKey: "perf5Y",
      header: "5Y",
      size: 80,
      cell: ({ row }) => (
        <NumericCell
          value={row.original.perf5Y}
          formatter={formatPercent}
          colorFn={getChangeColor}
        />
      ),
      enableSorting: true,
    },
  ];
}
