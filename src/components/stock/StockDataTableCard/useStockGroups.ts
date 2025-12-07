import { useEffect, useState } from "react";
import axios from "axios";

export function useStockGroups() {
    const [fnoStocks, setFnOStocks] = useState<Array<string>>([]);
    const [favoriteStocks, setFavoriteStocks] = useState<Array<string>>([]);

    useEffect(() => {
        const fetchStockGroups = async () => {
            const [favoritesRes, fnoRes] = await Promise.all([
                axios.get("/api/favorite-stocks"),
                axios.get("/api/stock-groups?group_name=fno"),
            ]);

            setFavoriteStocks(favoritesRes.data || []);
            setFnOStocks(fnoRes.data || []);
        };

        fetchStockGroups();
    }, []);

    return {
        fnoStocks,
        favoriteStocks,
        setFavoriteStocks,
    };
}
