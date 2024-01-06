import { JSONFilePreset } from "lowdb/node";

export async function GET() {
  const defaultData = { favorite_stocks: [] };
  const db = await JSONFilePreset("src/database/db.json", defaultData);

  return Response.json({
    favorite_stocks: db.data.favorite_stocks,
  });
}

export async function PATCH(request: Request) {
  const { stock_id } = await request.json();

  const defaultData = { favorite_stocks: [] };
  const db = await JSONFilePreset("src/database/db.json", defaultData);

  const dataIndex = db.data.favorite_stocks.indexOf(stock_id);
  if (dataIndex !== -1) {
    db.update(() => {
      db.data.favorite_stocks.splice(dataIndex, 1);
    });
  } else {
    db.update(() => {
      db.data.favorite_stocks.push(stock_id);
    });
  }

  return Response.json({
    favorite_stocks: db.data.favorite_stocks,
  });
}
