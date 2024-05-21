"use client";

import {
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";

import "./styles.css";
import classNames from "classnames";
import { useEffect, useMemo, useState } from "react";

import sample from "./sample.json";

function Options() {
  const [optionExpiries, setOptionExpiries] = useState<any[]>([]);
  const [selectedExpiry, setSelectedExpiry] = useState<string>("");

  const [optionsData, setOptionsData] = useState([]);

  useEffect(() => {
    // const getOptionsData = async () => {
    //   const response = await axios.get("/api/options-scanner?");
    //   setOptionsData(response.data || []);
    // };
    // getOptionsData();

    // getFormattedOptionsDataItems

    const field = sample.fields;
    const symbolsMapped = sample.symbols.map((item) => {
      const result: any = {};
      field.forEach((key, idx) => {
        result[key] =
          key === "iv"
            ? ((item.f[idx] as number) * 100).toFixed(2)
            : typeof item.f[idx] === "number"
            ? (item.f[idx] as number).toFixed(2)
            : item.f[idx];
      });
      return result;
    });

    const groupedByExpiry = symbolsMapped.reduce((acc, item) => {
      if (acc[item.expiration]) {
        acc[item.expiration].push(item);
      } else {
        acc[item.expiration] = [item];
      }
      return acc;
    }, {});

    const expiries = Object.keys(groupedByExpiry)
      .map((item) => {
        const expiryDate = new Date(
          [
            item.substring(0, 4),
            item.substring(4, 6),
            item.substring(6, 8),
          ].join("-")
        );
        const mappings: any = {};
        groupedByExpiry[item].forEach((elem: any) => {
          if (mappings[elem.strike]) {
            mappings[elem.strike][elem["option-type"]] = elem;
          } else {
            mappings[elem.strike] = {
              strike: elem.strike,
              strikeExact: parseFloat(elem.strike),
              [elem["option-type"]]: elem,
            };
          }
          return mappings;
        });
        return {
          expiryId: item,
          expiryIdExact: parseInt(item),
          expiryDate: new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
          }).format(expiryDate),
          expiryDateISO: expiryDate.toISOString(),
          dataItems: Object.values(mappings).sort(
            (a, b) => a.strikeExact - b.strikeExact
          ),
        };
      })
      .sort((a, b) => a.expiryIdExact - b.expiryIdExact);

    console.log(expiries);
    setOptionExpiries(expiries);
  }, []);

  const optionDataItems = useMemo(() => {
    return (
      optionExpiries.find((item) => item.expiryId === selectedExpiry)
        ?.dataItems || []
    );
  }, [optionExpiries, selectedExpiry]);

  const atmIndex = optionDataItems.length / 2;

  const data = new Array(20).fill(0);

  return (
    <main className="flex min-h-screen flex-col">
      <Select
        className="w-[240px]"
        value={selectedExpiry}
        onValueChange={(newValue) => setSelectedExpiry(newValue)}
        enableClear={false}
      >
        {optionExpiries.map((item) => (
          <SelectItem key={item.expiryId} value={item.expiryId}>
            {item.expiryDate}
          </SelectItem>
        ))}
      </Select>

      <Table className="options-table-container mx-6 overflow-visible">
        <TableHead>
          <TableRow className="border-b border-gray-800">
            <TableHeaderCell className="text-center" colSpan={7}>
              Calls
            </TableHeaderCell>
            <TableHeaderCell className="text-center" colSpan={7}>
              Puts
            </TableHeaderCell>
          </TableRow>
          <TableRow className="border-b border-gray-800">
            <TableHeaderCell className="text-center">Theta</TableHeaderCell>
            <TableHeaderCell className="text-center">Delta</TableHeaderCell>
            <TableHeaderCell className="text-center">Price</TableHeaderCell>
            <TableHeaderCell className="text-center">Bid</TableHeaderCell>
            <TableHeaderCell className="text-center">Ask</TableHeaderCell>
            <TableHeaderCell className="text-center">Spread</TableHeaderCell>
            {/* <TableHeaderCell className="text-center strike-bg">
              IV
            </TableHeaderCell> */}
            <TableHeaderCell className="text-center strike-bg">
              Strike
            </TableHeaderCell>
            <TableHeaderCell className="text-center strike-bg">
              IV
            </TableHeaderCell>
            <TableHeaderCell className="text-center">Spread</TableHeaderCell>
            <TableHeaderCell className="text-center">Ask</TableHeaderCell>
            <TableHeaderCell className="text-center">Bid</TableHeaderCell>
            <TableHeaderCell className="text-center">Price</TableHeaderCell>
            <TableHeaderCell className="text-center">Delta</TableHeaderCell>
            <TableHeaderCell className="text-center">Theta</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {optionDataItems.map((item: any, index: number) => (
            <TableRow key={item + index}>
              <TableCell
                className={classNames("text-center", {
                  "itm-bg": index <= atmIndex,
                })}
              >
                {item.call.theta}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "itm-bg": index <= atmIndex,
                })}
              >
                {item.call.delta}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "itm-bg": index <= atmIndex,
                })}
              >
                {item.call.theoPrice}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "itm-bg": index <= atmIndex,
                })}
              >
                {item.call.bid}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "itm-bg": index <= atmIndex,
                })}
              >
                {item.call.ask}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "itm-bg": index <= atmIndex,
                })}
              >
                {(item.call.ask - item.call.bid).toFixed(2)}
              </TableCell>
              {/* <TableCell
                className={classNames("text-center", "strike-bg", {
                  "atm-bg": index === atmIndex,
                })}
              >
                {item.call.iv}
              </TableCell> */}
              <TableCell
                className={classNames("text-center", "strike-bg", {
                  "atm-bg": index === atmIndex,
                })}
              >
                {item.strike}
              </TableCell>
              <TableCell
                className={classNames("text-center", "strike-bg", {
                  "atm-bg": index === atmIndex,
                })}
              >
                {item.put.iv}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "itm-bg": index >= atmIndex,
                })}
              >
                {(item.put.ask - item.put.bid)?.toFixed(2)}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "itm-bg": index >= atmIndex,
                })}
              >
                {item.put.ask}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "itm-bg": index >= atmIndex,
                })}
              >
                {item.put.bid}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "itm-bg": index >= atmIndex,
                })}
              >
                {item.put.theoPrice}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "itm-bg": index >= atmIndex,
                })}
              >
                {item.put.delta}
              </TableCell>
              <TableCell
                className={classNames("text-center", {
                  "itm-bg": index >= atmIndex,
                })}
              >
                {item.put.theta}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}

export default Options;
