import { useCallback, useEffect, useMemo, useState } from "react";
import { TStockDataItem, TConsolidatedHighlights } from "@/lib/types";

interface UseStockFiltersProps {
    data: Array<TStockDataItem>;
    searchText: string;
    indicesMappings: Record<string, string[]>;
    favoriteStocks: Array<string>;
    fnoStocks: Array<string>;
    filtered: Array<TStockDataItem>;
    setFiltered: (items: Array<TStockDataItem>) => void;
}

export function useStockFilters({
    data,
    searchText,
    indicesMappings,
    favoriteStocks,
    fnoStocks,
    filtered,
    setFiltered,
}: UseStockFiltersProps) {
    const [selectedStockType, setSelectedStockType] = useState("All");
    const [selectMCapIndex, setSelectedMCapIndex] = useState(0);
    const [selectedChangeType, setSelectedChangeType] = useState("All");
    const [selectedHighlight, setSelectedHighlight] = useState("All");
    const [selectedSector, setSelectedSector] = useState("All");

    // Search filtering
    useEffect(() => {
        if (!searchText) {
            setFiltered(data);
            return;
        }
        const timeoutId = setTimeout(() => {
            setFiltered(data.filter((item) => item.searchTerms.includes(searchText)));
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [data, searchText]);

    const onChangeStockType = useCallback(
        (newStockType: string) => {
            const stockTypeToCompare = newStockType.replace(/\[\d*\] /, "");
            setSelectedStockType(newStockType);
            const list =
                indicesMappings[stockTypeToCompare] ||
                (stockTypeToCompare === "Starred" ? favoriteStocks : fnoStocks);
            const cmp = stockTypeToCompare === "Cash" ? false : true;
            setFiltered(
                stockTypeToCompare === "All"
                    ? data
                    : data.filter((item) => list.includes(item.name) === cmp)
            );
        },
        [favoriteStocks, fnoStocks, indicesMappings, data]
    );

    const onChangeMCapType = useCallback(
        (newIndex: number) => {
            setSelectedMCapIndex(newIndex);
            const lowerBound = newIndex === 1 ? 1000 : newIndex === 2 ? 500 : 0;
            const upperBound = newIndex === 2 ? 1000 : newIndex === 3 ? 500 : null;
            setFiltered(
                newIndex === 0
                    ? data
                    : data.filter(
                        (item) =>
                            item.marketCapInBillions > lowerBound &&
                            (upperBound ? item.marketCapInBillions <= upperBound : true)
                    )
            );
        },
        [data]
    );

    const onChangeDayChangeType = useCallback(
        (newType: string) => {
            setSelectedChangeType(newType);
            setFiltered(
                newType === "All"
                    ? data
                    : data.filter((item) => item.dayChangeType === newType)
            );
        },
        [data]
    );

    const onChangeHighlight = useCallback(
        (newType: string) => {
            setSelectedHighlight(newType);
            setFiltered(
                newType === "All"
                    ? data
                    : data.filter((item) =>
                        item.consolidatedHighlights.includes(
                            newType as TConsolidatedHighlights
                        )
                    )
            );
        },
        [data]
    );

    const onChangeSector = useCallback(
        (newSector: string, isSector?: boolean) => {
            setSelectedSector(newSector);
            const sectorToCompare = newSector.replace(/\[\d*\] /, "");
            setFiltered(
                newSector === "All"
                    ? data
                    : data.filter((item) =>
                        isSector
                            ? item.sector === sectorToCompare
                            : item.industry === sectorToCompare
                    )
            );
        },
        [data]
    );

    return {
        selectedStockType,
        selectMCapIndex,
        selectedChangeType,
        selectedHighlight,
        selectedSector,
        onChangeStockType,
        onChangeMCapType,
        onChangeDayChangeType,
        onChangeHighlight,
        onChangeSector,
    };
}
