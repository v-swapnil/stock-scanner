import { JSONFilePreset } from "lowdb/node";

type DbSchemaType = {
  favorite_stocks: Array<string>;
  stock_groups: {
    fno: Array<string>;
    last_updated: string | null;
  };
};

const defaultData: DbSchemaType = {
  favorite_stocks: [],
  stock_groups: {
    fno: [],
    last_updated: null,
  },
};

export const getDBInstance = async () => {
  const db = await JSONFilePreset<DbSchemaType>(
    "src/database/db.json",
    defaultData
  );
  return db;
};
