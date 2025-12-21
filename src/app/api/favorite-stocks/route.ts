import { getDBInstance } from "@/database/helpers";
import { z } from "zod";

const toggleSchema = z.object({
  stockId: z.string().min(1),
});

export async function GET() {
  const db = await getDBInstance();
  const favoriteStocks = db.data.favorite_stocks;

  return Response.json(favoriteStocks);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const parsed = toggleSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ type: "error", message: "Invalid payload" }, { status: 400 });
  }

  const { stockId } = parsed.data;

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
