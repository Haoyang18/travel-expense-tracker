import { SQLDatabase } from "encore.dev/storage/sqldb";

export const expenseDB = new SQLDatabase("expense", {
  migrations: "./migrations",
});
