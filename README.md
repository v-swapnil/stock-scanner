# Stock Scanner

A comprehensive Next.js-based stock market analysis dashboard for Indian equities (NSE). Real-time tracking, technical analysis, and fundamental screening with support for 500+ stocks.

## 🚀 Features

### Market Analysis
- **Real-time Stock Data**: Live data from TradingView for 500+ NSE stocks
- **Index Tracking**: Monitor Nifty 50, Bank Nifty, sector indices with live updates
- **Market Sentiment**: Visual advance/decline metrics and market contributors
- **ETF Scanner**: Track and analyze Exchange Traded Funds

### Stock Screening & Filtering
- **Multi-criteria Filters**: Filter by market cap (Large/Mid/Small), sector, industry
- **Index Constituents**: Filter by Nifty 50, Bank Nifty, FnO stocks, PSE
- **Custom Views**: Toggle fundamentals, moving averages, yearly changes
- **Search**: Multi-field search across symbol, name, sector, industry
- **Favorites**: Star stocks for quick access and tracking

### Technical Analysis
- **Price Changes**: 1D, 1W, 1M, 3M, 6M, 1Y, 5Y performance tracking
- **Moving Averages**: SMA & EMA (50, 100, 200-day) with divergence indicators
- **Range Analysis**: Day/week/month/year high-low ranges with current position
- **Volume Analysis**: 10-day average volume with change indicators
- **Highlights**: Automatic detection of 200MA, 100MA, 6M low, volume spikes

### Fundamental Analysis
- **Valuation Metrics**: P/E, Forward P/E, PEG, P/B, P/S ratios
- **Profitability**: ROE, EPS growth, revenue growth
- **Financial Health**: Current ratio, debt-to-equity, dividend yield
- **Sector Comparison**: Compare P/E ratios against sector averages

### Data Visualization
- **Interactive Tables**: Sortable columns, color-coded metrics
- **Index Cards**: Visual cards for major indices with contributors
- **Insight Cards**: Market sentiment indicators (Crazy Buying/Selling, etc.)
- **Range Bars**: Visual representation of price position within ranges

## 🏗️ Architecture

### Technology Stack
- **Framework**: Next.js 14 (App Router)
- **UI Library**: Tremor React + Tailwind CSS
- **State Management**: React Hooks (custom hooks for data management)
- **Data Grid**: AG Grid React (for fundamentals view)
- **HTTP Client**: Axios
- **Database**: LowDB (JSON-based local storage)
- **Date Utilities**: date-fns
- **Icons**: Remix Icons

### Project Structure
```
src/
├── app/
│   ├── api/                    # API routes (Next.js route handlers)
│   │   ├── stocks-scanner/     # Main stock data endpoint
│   │   ├── indices/            # NSE indices data
│   │   ├── constituents/       # Index constituents
│   │   ├── contributors-v2/    # Index contributor analysis
│   │   ├── favorite-stocks/    # User favorites CRUD
│   │   ├── stock-groups/       # FnO stocks, groups
│   │   ├── etf-scanner/        # ETF data
│   │   ├── options-scanner/    # Options chain data
│   │   └── nse-stats/          # NSE statistics
│   ├── dashboard/              # Main dashboard page
│   ├── dashboard-new/          # Alternative dashboard layout
│   ├── dashboard-fundamentals/ # Fundamentals-focused view
│   ├── fo-dashboard/           # Futures & Options dashboard
│   ├── options/                # Options chain analyzer
│   ├── stats/                  # Market statistics page
│   └── stocks-analysis/        # Detailed stock analysis
├── components/
│   ├── stock/                  # Stock-related components
│   │   ├── StockDataTable/     # Main table components
│   │   │   ├── StockTableHeader.tsx
│   │   │   ├── StockTableRow.tsx
│   │   │   ├── StockTableFooter.tsx
│   │   │   └── useStockTableInsights.ts
│   │   └── StockDataTableCard/ # Table container & filters
│   │       ├── StockFilters.tsx
│   │       ├── useIndexData.ts
│   │       ├── useStockGroups.ts
│   │       └── useStockFilters.ts
│   ├── market/                 # Market-wide components
│   ├── etf/                    # ETF components
│   ├── fno/                    # Futures & Options components
│   └── shared/                 # Reusable UI components
├── lib/
│   ├── data-format.ts          # Data transformation & formatting
│   ├── number-format.ts        # Number formatting utilities
│   ├── common.ts               # Common utility functions
│   └── types.ts                # TypeScript type definitions
└── database/
    ├── db.json                 # Local database (favorites, cache)
    └── helpers.ts              # Database helper functions
```

## 📡 API Endpoints

### Stock Data
- `GET /api/stocks-scanner` - Fetch filtered stock data
- `GET /api/favorite-stocks` - Get user's favorite stocks
- `PATCH /api/favorite-stocks` - Toggle stock favorite status
- `GET /api/stock-groups?group_name=fno` - Get FnO stocks list

### Market Data
- `GET /api/indices` - Get NSE indices data (Nifty 50, Bank Nifty, etc.)
- `GET /api/constituents` - Get index constituents
- `GET /api/contributors-v2?indexId=nifty` - Get index contributors
- `GET /api/nse-stats` - NSE market statistics

### Other
- `GET /api/etf-scanner` - ETF data
- `GET /api/options-scanner` - Options chain data
- `GET /api/news` - Market news headlines

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd stock-scanner
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Run the development server:
```bash
pnpm dev
# or
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001) in your browser

### Available Scripts

```bash
pnpm dev          # Start development server on port 3001
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm format       # Format all .ts and .tsx files with Prettier
pnpm scan         # Run with React Scan for performance analysis
```

## 🔧 Configuration

### Market Cap Filter
Default market cap filter is set to 75 billion. Adjust in query params:
```
/dashboard?market_cap_in_billions=100
```

### Data Sources
- **TradingView Scanner API**: Primary stock data source
- **NSE India APIs**: Index data, constituents, FnO stocks
- **Local Cache**: 15-day cache for FnO stocks to reduce API calls

## 📊 Component Architecture

### Custom Hooks
- **`useIndexData`**: Fetches and manages Nifty/Bank Nifty metrics with contributors
- **`useStockGroups`**: Manages FnO stocks and user favorites
- **`useStockFilters`**: Centralized filtering logic for stocks
- **`useStockTableInsights`**: Calculates table-level metrics and averages

### Key Components
- **`StockDataTable`**: Main table with 70 lines (refactored from 1071)
- **`StockDataTableCard`**: Table container with filters (531 lines)
- **`StockFilters`**: Comprehensive filter UI component
- **`IndexInsights`**: Index metrics with contributors display
- **`ETFDataTableCard`**: ETF scanner table

## 🎨 Features in Detail

### Change Type Categories
Stocks are automatically categorized based on daily performance:
- **Crazy Buying/Selling**: >5% change
- **Heavy Buying/Selling**: 3-5% change
- **Moderate Buying/Selling**: 1-3% change
- **Neutral**: <1% change

### Stock Highlights
Automatic detection of notable conditions:
- Near 200/100 day moving averages
- At 6-month low
- Unusual volume (>2x average)
- High gains (>50% in 6M)
- Low gains (<-20% in 6M)

### Market Cap Categories
- **Large Cap**: >₹1000 billion
- **Mid Cap**: ₹500-1000 billion
- **Small Cap**: <₹500 billion

## 📈 Performance Optimizations

- Component memoization with `React.memo`
- Custom hooks for data fetching and state management
- Debounced search (500ms)
- Transition-wrapped filter updates for non-blocking UI
- Local caching for frequently accessed data (15-day cache)
- Extracted sub-components from monolithic tables (93.5% size reduction)

## 🔐 Data Privacy

- All data stored locally in `database/db.json`
- No external database or user authentication required
- Favorites and preferences persist across sessions

## 🚀 Future Enhancements

- Options chain analysis improvements
- Historical data charting
- Portfolio tracking
- Price alerts and notifications
- Mobile-responsive improvements
- Real-time WebSocket updates

## 📝 License

Private project

## 🤝 Contributing

This is a private project. For inquiries, please contact the repository owner.
