import { api, APIError } from "encore.dev/api";
import { expenseDB } from "./db";

export interface DeleteExpenseRequest {
  id: number;
}

// Deletes an expense and all its splits.
export const deleteExpense = api<DeleteExpenseRequest, void>(
  { expose: true, method: "DELETE", path: "/expenses/:id" },
  async (req) => {
    // Check if expense exists
    const expense = await expenseDB.queryRow<{ id: number }>`
      SELECT id FROM expenses WHERE id = ${req.id}
    `;

    if (!expense) {
      throw APIError.notFound("expense not found");
    }

    // Delete the expense (splits will be deleted automatically due to CASCADE)
    await expenseDB.exec`
      DELETE FROM expenses WHERE id = ${req.id}
    `;
  }
);
