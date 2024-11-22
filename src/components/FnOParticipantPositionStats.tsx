"use client";

import { memo, useCallback, useEffect, useState } from "react";
import {
  Card,
  DatePicker,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Switch,
  Flex,
  Callout,
  TabList,
  TabGroup,
  Tab,
} from "@tremor/react";
import axios from "axios";
import { numberFormat } from "@/lib/number-format";
import { RiErrorWarningLine } from "@remixicon/react";
import {
  TFnOParticipantsOpenInterest,
  TForeignInstitutionsStats,
} from "@/lib/types";

function FnOParticipantPositionStats() {
  const [errorMessage, setErrorMessage] = useState(null);
  const [toggle, setToggle] = useState(false);
  const [selectedView, setSelectedView] = useState(1);
  const [dataItems, setDataItems] = useState<
    Array<TFnOParticipantsOpenInterest>
  >([]);
  const [otherDataItems, setOtherDataItems] = useState<
    Array<TForeignInstitutionsStats>
  >([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const getStats = useCallback(async () => {
    if (selectedDate) {
      const statsUrl =
        "/api/nse-stats?stats_date=" + selectedDate.toISOString();
      const response = await axios.get(statsUrl);
      if (response.data.type === "error") {
        throw new Error(response.data.message);
      }
      const dataItems: Array<any> = response.data.dataItems || [];
      const formattedDateItems: Array<TFnOParticipantsOpenInterest> =
        dataItems.map((item) => ({
          clientType: item[0],
          futureIndexLong: numberFormat(item[1]),
          futureIndexShort: numberFormat(item[2]),
          futureStockLong: numberFormat(item[3]),
          futureStockShort: numberFormat(item[4]),
          optionIndexCallLong: numberFormat(item[5]),
          optionIndexPutLong: numberFormat(item[6]),
          optionIndexCallShort: numberFormat(item[7]),
          optionIndexPutShort: numberFormat(item[8]),
          optionStockCallLong: numberFormat(item[9]),
          optionStockPutLong: numberFormat(item[10]),
          optionStockCallShort: numberFormat(item[11]),
          optionStockPutShort: numberFormat(item[12]),
          totalLong: numberFormat(item[13]),
          totalShort: numberFormat(item[14]),
        }));
      setDataItems(formattedDateItems);
      const otherDataItems: Array<any> = response.data.otherDataItems || [];
      const formattedOtherDateItems: Array<TForeignInstitutionsStats> =
        otherDataItems.map((item) => ({
          type: item[0],
          buyContracts: numberFormat(item[1]),
          buyContractAmount: numberFormat(item[2]),
          sellContracts: numberFormat(item[3]),
          sellContractsAmount: numberFormat(item[4]),
          netContracts: numberFormat(item[1] - item[3]),
          netContractsAmount: numberFormat(item[2] - item[4]),
          eodContacts: numberFormat(item[5]),
          eodContactsAmount: numberFormat(item[6]),
        }));
      setOtherDataItems(formattedOtherDateItems);
      setErrorMessage(null);
    }
  }, [selectedDate]);

  useEffect(() => {
    getStats().catch((err) => {
      setErrorMessage(err.message);
      setDataItems([]);
      setOtherDataItems([]);
    });
  }, [getStats]);

  return (
    <Card className="w-full mb-4">
      {errorMessage && (
        <Callout
          className="mb-4"
          title="Data Error"
          color="rose"
          icon={RiErrorWarningLine}
        >
          There was an error in api call - {errorMessage}
        </Callout>
      )}
      <Flex justifyContent="between">
        <DatePicker
          className="w-[278px]"
          value={selectedDate}
          onValueChange={(newDate) => setSelectedDate(newDate)}
          maxDate={new Date()}
        />
        <TabGroup
          className="w-auto"
          index={selectedView}
          onIndexChange={setSelectedView}
        >
          <TabList variant="solid">
            <Tab>All</Tab>
            <Tab>Participant Positions</Tab>
            <Tab>FII Derivative</Tab>
          </TabList>
        </TabGroup>
      </Flex>
      {(selectedView === 0 || selectedView === 1) && (
        <Table className="w-full mt-4">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell className="text-right">
                Future Long
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                Future Short
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                Option Call Long
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                Option Put Long
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                Option Call Short
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                Option Put Short
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                Total Long Contracts
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                Total Short Contracts
              </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataItems.length === 0 && (
              <TableRow>
                <TableCell className="text-center" colSpan={9}>
                  No data to show
                </TableCell>
              </TableRow>
            )}
            {dataItems.map((item, index) => (
              <TableRow key={"item-" + index}>
                <TableCell>{item.clientType}</TableCell>
                <TableCell className="text-right">
                  {item.futureIndexLong}
                </TableCell>
                <TableCell className="text-right">
                  {item.futureIndexShort}
                </TableCell>
                <TableCell className="text-right">
                  {item.optionIndexCallLong}
                </TableCell>
                <TableCell className="text-right">
                  {item.optionIndexPutLong}
                </TableCell>
                <TableCell className="text-right">
                  {item.optionIndexCallShort}
                </TableCell>
                <TableCell className="text-right">
                  {item.optionIndexPutShort}
                </TableCell>
                <TableCell className="text-right">{item.totalLong}</TableCell>
                <TableCell className="text-right">{item.totalShort}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {selectedView === 0 && <Divider />}
      {(selectedView === 0 || selectedView === 2) && (
        <Table className="w-full mt-4">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell className="text-right">
                Buy Contracts
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                Buy Contracts Amount (Cr)
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                Sell Contracts
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                Sell Contracts Amount (Cr)
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                Net Contracts
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                Net Contracts Amount (Cr)
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                EOD Contacts
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                EOD Contracts Amount (Cr)
              </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {otherDataItems.length === 0 && (
              <TableRow>
                <TableCell className="text-center" colSpan={9}>
                  No data to show
                </TableCell>
              </TableRow>
            )}
            {otherDataItems.map((item, index) => (
              <TableRow key={"item-" + index}>
                <TableCell>{item.type}</TableCell>
                <TableCell className="text-right">
                  {item.buyContracts}
                </TableCell>
                <TableCell className="text-right">
                  {item.buyContractAmount}
                </TableCell>
                <TableCell className="text-right">
                  {item.sellContracts}
                </TableCell>
                <TableCell className="text-right">
                  {item.sellContractsAmount}
                </TableCell>
                <TableCell className="text-right">
                  {item.netContracts}
                </TableCell>
                <TableCell className="text-right">
                  {item.netContractsAmount}
                </TableCell>
                <TableCell className="text-right">{item.eodContacts}</TableCell>
                <TableCell className="text-right">
                  {item.eodContactsAmount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

export default memo(FnOParticipantPositionStats);
