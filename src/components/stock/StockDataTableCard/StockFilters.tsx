import { Button, Flex, Metric, MultiSelect, MultiSelectItem, Select, SelectItem, Tab, TabGroup, TabList, TextInput } from "@tremor/react";
import { memo, useCallback, useMemo, useState } from "react";
import { useStockFilters } from "./useStockFilters";
import { RiSearch2Line, RiSearchLine } from "@remixicon/react";
import { TStockDataItem } from "@/lib/types";


interface IStockFilterProps {
    data: Array<TStockDataItem>;
    favoriteStocks: Array<string>;
    fnoStocks: Array<string>;
    filtered: Array<TStockDataItem>;
    filteredWithFavorites: Array<TStockDataItem>;
    setFiltered: (items: Array<TStockDataItem>) => void;
    selectedViews: Array<string>;
    onChangeViews: (views: Array<string>) => void;
}

function StockFilters({
    data,
    favoriteStocks,
    fnoStocks,
    filtered,
    filteredWithFavorites,
    setFiltered,
    selectedViews,
    onChangeViews
}: IStockFilterProps) {
    const [searchText, setSearchText] = useState("");
    const [searchType, setSearchType] = useState("All");

    const { sectors, indices, indicesMappings } = useMemo(() => {
        let sectorMappings: Record<string, number> = {};
        let indicesMappings: Record<string, string[]> = {};

        data.forEach((item) => {
            if (sectorMappings[item.industry]) {
                sectorMappings[item.industry] += 1;
            } else {
                sectorMappings[item.industry] = 1;
            }

            item.indexes.forEach((elem) => {
                if (indicesMappings[elem.name]) {
                    indicesMappings[elem.name].push(item.name);
                } else {
                    indicesMappings[elem.name] = [item.name];
                }
            });
        });

        const sectors = Object.keys(sectorMappings)
            .sort((a, b) => sectorMappings[b] - sectorMappings[a])
            .map((item) => `[${sectorMappings[item]}] ${item}`);

        const indices = Object.keys(indicesMappings)
            .sort((a, b) => indicesMappings[b].length - indicesMappings[a].length)
            .map((item) => `[${indicesMappings[item].length}] ${item}`);

        return {
            sectors,
            indicesMappings,
            indices,
        };
    }, [data]);

    const {
        selectedStockType,
        selectMCapIndex,
        selectedChangeType,
        selectedHighlight,
        selectedSector,
        onChangeStockType,
        onChangeMCapType,
        onChangeDayChangeType,
        onChangeHighlight,
        onChangeSector, } = useStockFilters({
            data,
            searchText,
            indicesMappings,
            favoriteStocks,
            fnoStocks,
            filtered,
            setFiltered,
        })

    const onChangeSearchText = useCallback((newText: string) => {
        setSearchText(newText ? newText.toLowerCase() : "");
    }, []);

    return (
        <>
            <Flex justifyContent="between">
                <Flex className="w-[30vw]">
                    <Metric>Stocks ({filteredWithFavorites.length})</Metric>
                </Flex>
                <Flex className="w-[70vw] gap-2" justifyContent="end">
                    <MultiSelect value={selectedViews} onValueChange={onChangeViews}>
                        <MultiSelectItem value="Basic">Basic</MultiSelectItem>
                        <MultiSelectItem value="Fundamentals">
                            Fundamentals
                        </MultiSelectItem>
                        <MultiSelectItem value="YearlyChange">
                            Yearly Change
                        </MultiSelectItem>
                        <MultiSelectItem value="MovingAverages">
                            Moving Averages
                        </MultiSelectItem>
                        <MultiSelectItem value="UFLandDFH">UFL and DFH</MultiSelectItem>
                    </MultiSelect>
                    <Select
                        value={selectedChangeType}
                        onValueChange={onChangeDayChangeType}
                        enableClear={false}
                    >
                        <SelectItem value="All">All</SelectItem>
                        <SelectItem value="Crazy Selling">Crazy Selling</SelectItem>
                        <SelectItem value="Heavy Selling">Heavy Selling</SelectItem>
                        <SelectItem value="Moderate Selling">Moderate Selling</SelectItem>
                        <SelectItem value="Neutral">Neutral</SelectItem>
                        <SelectItem value="Moderate Buying">Moderate Buying</SelectItem>
                        <SelectItem value="Heavy Buying">Heavy Buying</SelectItem>
                        <SelectItem value="Crazy Buying">Crazy Buying</SelectItem>
                    </Select>
                    <Select
                        value={selectedHighlight}
                        onValueChange={onChangeHighlight}
                        enableClear={false}
                    >
                        <SelectItem value="All">All</SelectItem>
                        <SelectItem value="200 MA">200 MA</SelectItem>
                        <SelectItem value="100 MA">100 MA</SelectItem>
                        <SelectItem value="6M Low">6M Low</SelectItem>
                        <SelectItem value="Volume">Volume</SelectItem>
                        <SelectItem value="Low Gains">Low Gains (6M)</SelectItem>
                        <SelectItem value="High Gains">High Gains (6M)</SelectItem>
                    </Select>
                    <Select
                        value={selectedSector}
                        onValueChange={onChangeSector}
                        enableClear={false}
                    >
                        <SelectItem value="All">[{data.length}] All</SelectItem>
                        {sectors.map((item) => (
                            <SelectItem key={item} value={item}>
                                {item}
                            </SelectItem>
                        ))}
                    </Select>
                    <Select
                        value={selectedStockType}
                        onValueChange={onChangeStockType}
                        enableClear={false}
                    >
                        <SelectItem value="All">[{data.length}] All</SelectItem>
                        <SelectItem value="Starred">
                            [{favoriteStocks.length}] Starred
                        </SelectItem>
                        <SelectItem value="Cash">
                            [{data.length - fnoStocks.length}] Cash
                        </SelectItem>
                        <SelectItem value="FnO">
                            [{fnoStocks.length}] Future and Options
                        </SelectItem>
                        {indices.map((item) => (
                            <SelectItem key={item} value={item}>
                                {item}
                            </SelectItem>
                        ))}
                    </Select>
                    <TabGroup index={selectMCapIndex} onIndexChange={onChangeMCapType}>
                        <TabList variant="solid">
                            <Tab>All</Tab>
                            <Tab>Large</Tab>
                            <Tab>Mid</Tab>
                            <Tab>Small</Tab>
                        </TabList>
                    </TabGroup>
                </Flex>
            </Flex>
            <Flex className="mt-4 gap-4">
                <div className="w-48">
                    <Select
                        value={searchType}
                        onValueChange={(newType) => setSearchType(newType)}
                        enableClear={false}
                    >
                        <SelectItem value="All">All</SelectItem>
                        <SelectItem value="Symbol">Symbol</SelectItem>
                        <SelectItem value="Name">Name</SelectItem>
                        <SelectItem value="Sector">Sector</SelectItem>
                        <SelectItem value="Industry">Industry</SelectItem>
                    </Select>
                </div>
                <TextInput
                    icon={RiSearchLine}
                    placeholder="Search..."
                    value={searchText}
                    onValueChange={onChangeSearchText}
                />
                <Button variant="secondary" icon={RiSearch2Line}>
                    Search
                </Button>
            </Flex>
        </>
    )
}

export default memo(StockFilters) 