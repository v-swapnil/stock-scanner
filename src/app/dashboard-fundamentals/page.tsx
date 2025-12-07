"use client";

import DataGrid from "@/components/shared/DataGrid";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";

const DashboardFundamentals = () => {
  const [isLoading, setLoading] = useState(true);
  const [stocksDataItems, setStocksDataItems] = useState([]);

  useEffect(() => {
    const getStockData = async () => {
      const response = await axios.get("/api/stocks-scanner");
      setStocksDataItems(response.data || []);
      setLoading(false);
    };
    getStockData();
  }, []);

  const columnDefs = useMemo(() => {
    return [
      { field: "name" },
      { field: "currentPrice" },
      { field: "priceEarningTTM" },
      { field: "forwardPriceEarning" },
      { field: "priceBookTTM" },
    ];
  }, []);

  return (
    <div>
      <DataGrid
        height="100vh"
        loading={isLoading}
        columnDefs={columnDefs}
        rowData={stocksDataItems}
      />
    </div>
  );
};

export default DashboardFundamentals;
