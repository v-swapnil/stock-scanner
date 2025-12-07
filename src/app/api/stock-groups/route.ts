import { getDBInstance } from "@/database/helpers";
import differenceInDays from "date-fns/differenceInDays";

async function handler(request: Request) {
  const searchParams = new URL(request.url).searchParams;

  if (searchParams.get("group_name") !== "fno") {
    return [];
  }

  const db = await getDBInstance();

  if (db.data.stock_groups?.last_updated) {
    const differenceBetweenLastCache = differenceInDays(
      new Date(),
      new Date(db.data.stock_groups?.last_updated),
    );
    if (differenceBetweenLastCache <= 15) {
      return db.data.stock_groups.fno;
    }
  }

  // FnO Stocks
  const fnoStocksUrl = "https://www.nseindia.com/api/master-quote";
  const response = await fetch(fnoStocksUrl, { cache: "no-store" });
  const responseJson = await response.json();

  await db.update(() => {
    db.data.stock_groups.fno = responseJson || [];
    db.data.stock_groups.last_updated = new Date().toISOString();
  });

  return responseJson;
}

export async function GET(request: Request) {
  try {
    const result = await handler(request);
    return Response.json(result);
  } catch (err) {
    return Response.json([]);
  }
}
