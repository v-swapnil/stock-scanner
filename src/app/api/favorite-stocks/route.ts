import { getDBInstance } from "@/database/helpers";

export async function GET() {
  const db = await getDBInstance();
  const favoriteStocks = db.data.favorite_stocks;

  return Response.json(favoriteStocks);
}

export async function PATCH(request: Request) {
  const { stockId }: { stockId: string } = await request.json();

  const db = await getDBInstance();

  const dataIndex = db.data.favorite_stocks.indexOf(stockId);
  if (dataIndex !== -1) {
    await db.update(() => {
      db.data.favorite_stocks.splice(dataIndex, 1);
    });
  } else {
    await db.update(() => {
      db.data.favorite_stocks.push(stockId);
    });
  }
  const favoriteStocks = db.data.favorite_stocks;

  return Response.json(favoriteStocks);
}
