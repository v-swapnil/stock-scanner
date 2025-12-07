"use client";

import { RiSearchLine, RiSearch2Line } from "@remixicon/react";
import {
  Flex,
  Metric,
  TabGroup,
  TabList,
  Tab,
  Card,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Select,
  SelectItem,
  TextInput,
  Badge,
  BadgeDelta,
} from "@tremor/react";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import SortableColumn from "../shared/SortableColumn";

const ETFDataTableCard = () => {
  const [dataItems, setDataItems] = useState([]);
  const [filteredDataItems, setFilteredDataItems] = useState([]);
  const [selectedType, setSelectedType] = useState(0);

  useEffect(() => {
    const getETFData = async () => {
      const response = await axios.get("/api/etf-scanner");
      setDataItems(response.data || []);
      setFilteredDataItems(response.data || []);
    };
    getETFData();
  }, []);

  const onChangeSelectedTypeHandler = useCallback(
    (newIndex: number) => {
      setSelectedType(newIndex);
      const classType = newIndex === 1 ? "Equity" : "Commodities";
      setFilteredDataItems(
        newIndex === 0
          ? dataItems
          : dataItems.filter((item: any) => item.assetClassType === classType),
      );
    },
    [dataItems],
  );

  const onSortItems = useCallback((keyName: string, direction: string) => {
    setFilteredDataItems((prevFiltered) =>
      prevFiltered
        .sort((a: any, b: any) =>
          direction === "desc"
            ? b[keyName] - a[keyName]
            : a[keyName] - b[keyName],
        )
        .map((item) => item),
    );
  }, []);

  return (
    <Card className="mt-4 w-[calc(100%-3rem)]">
      <Flex justifyContent="between">
        <Metric>Exchange Traded Funds ({filteredDataItems.length})</Metric>
        <TabGroup
          className="w-auto"
          index={selectedType}
          onIndexChange={onChangeSelectedTypeHandler}
        >
          <TabList variant="solid">
            <Tab>All</Tab>
            <Tab>Equity</Tab>
            <Tab>Commodities</Tab>
          </TabList>
        </TabGroup>
      </Flex>
      <Flex className="mt-4 gap-4">
        <div className="w-48">
          <Select enableClear={false}>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Equity">Equity</SelectItem>
            <SelectItem value="Commodities">Commodities</SelectItem>
          </Select>
        </div>
        <TextInput icon={RiSearchLine} placeholder="Search..." />
        <Button variant="secondary" icon={RiSearch2Line}>
          Search
        </Button>
      </Flex>
      <Table className="mt-4 stock-details-table dark:bg-gray-950">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Details</TableHeaderCell>
            <TableHeaderCell className="text-right">
              <SortableColumn
                id="currentPriceExact"
                title="Price"
                onSortItems={onSortItems}
              />
            </TableHeaderCell>
            <TableHeaderCell className="text-right">
              <SortableColumn
                id="assetsUnderManagementExact"
                title="AUM"
                onSortItems={onSortItems}
              />
            </TableHeaderCell>
            <TableHeaderCell className="text-right" title="Expense Ratio">
              <SortableColumn
                id="expenseRatioExact"
                title="ER"
                onSortItems={onSortItems}
              />
            </TableHeaderCell>
            <TableHeaderCell className="text-right">
              <SortableColumn
                id="dayChangeExact"
                title="1D-CG"
                onSortItems={onSortItems}
              />
            </TableHeaderCell>
            <TableHeaderCell className="text-right">
              <SortableColumn
                id="weekChangeExact"
                title="1W-CG"
                onSortItems={onSortItems}
              />
            </TableHeaderCell>
            <TableHeaderCell className="text-right">
              <SortableColumn
                id="monthChangeExact"
                title="1M-CG"
                onSortItems={onSortItems}
              />
            </TableHeaderCell>
            <TableHeaderCell className="text-right">
              <SortableColumn
                id="threeMonthChangeExact"
                title="3M-CG"
                onSortItems={onSortItems}
              />
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredDataItems.map((item: any) => (
            <TableRow key={item.name}>
              <TableCell>
                {item.description}
                <Badge className="ml-2 fixed-badge-in-container">
                  {item.name}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Badge color="gray">{item.currentPrice}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Badge color="gray">{item.assetsUnderManagement}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Badge color="gray">{item.expenseRatio}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <BadgeDelta deltaType={item.dayChangeDeltaType}>
                  {item.dayChange}%
                </BadgeDelta>
              </TableCell>
              <TableCell className="text-right">
                <BadgeDelta deltaType={item.weekChangeDeltaType}>
                  {item.weekChange}%
                </BadgeDelta>
              </TableCell>
              <TableCell className="text-right">
                <BadgeDelta deltaType={item.monthChangeDeltaType}>
                  {item.monthChange}%
                </BadgeDelta>
              </TableCell>
              <TableCell className="text-right">
                <BadgeDelta deltaType={item.threeMonthChangeDeltaType}>
                  {item.threeMonthChange}%
                </BadgeDelta>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default ETFDataTableCard;
