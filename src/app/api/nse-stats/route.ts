import Excel from "exceljs";
import fs from "fs/promises";
import path from "path";
import * as XLSX from "xlsx";
import { format } from "date-fns";

import * as fsAll from "fs";
XLSX.set_fs(fsAll);

function getFIIStatsTable(data) {
  const rowIds = [4, 5, 6, 7, 8, 10, 11, 12, 13, 14];
  return {
    header: [
      "Type",
      "Buy Contracts",
      "Buy Contracts Amount (Cr)",
      "Sell Contracts",
      "Sell Contracts Amount (Cr)",
      "EOD Contacts",
      "EOD Contracts Amount (Cr)",
    ],
    dataItems: rowIds.map((item) => [
      data["A" + item]?.v,
      parseFloat(data["B" + item]?.v),
      parseFloat(data["C" + item]?.v),
      parseFloat(data["D" + item]?.v),
      parseFloat(data["E" + item]?.v),
      parseFloat(data["F" + item]?.v),
      parseFloat(data["G" + item]?.v),
    ]),
  };
}

function removeNullValues(arr: Array<any>) {
  return arr?.filter((item) => !!item);
}

async function handler(request) {
  const requestUrl = new URL(request.url);
  const statsDate = requestUrl.searchParams.get("stats_date") || Date.now();

  // FO Participants OI
  const csvFileName =
    "fao_participant_oi_" + format(new Date(statsDate), "ddMMyyyy") + ".csv";
  const fileUrl =
    "https://nsearchives.nseindia.com/content/nsccl/" + csvFileName;
  const fileResponse = await fetch(fileUrl, { cache: "no-store" });
  const text = await fileResponse.text();
  const fileName = path.resolve("./temp/" + csvFileName);
  const csvText = text.split("\n").slice(1).join("\n");
  await fs.writeFile("./temp/" + csvFileName, csvText);
  const workbook = new Excel.Workbook();
  const worksheet = await workbook.csv.readFile(fileName);
  const values = worksheet.getSheetValues();
  const notNullRows = removeNullValues(values);
  const headerRow = removeNullValues(notNullRows[0]);
  const dataRows = notNullRows.slice(1).map((item) => removeNullValues(item));

  // FII Stats
  const xlsFileName =
    "fii_stats_" + format(new Date(statsDate), "dd-MMM-yyyy") + ".xls";
  const xlsFileUrl =
    "https://nsearchives.nseindia.com/content/fo/" + xlsFileName;
  const newFileResponse = await fetch(xlsFileUrl, { cache: "no-store" });
  const newFileData = await newFileResponse.arrayBuffer();
  const newWorkbook = XLSX.read(newFileData);
  const newWorksheet = newWorkbook.Sheets[newWorkbook.SheetNames[0]];
  const result = getFIIStatsTable(newWorksheet);
  // await fs.rm(fileName);
  // await fs.rm(newFileName);

  return Response.json({
    header: headerRow,
    dataItems: dataRows,
    otherHeader: result.header,
    otherDataItems: result.dataItems,
  });
}

export async function GET(request: Request) {
  try {
    const result = await handler(request);
    return result;
  } catch (err) {
    return Response.json({});
  }
}
