import { api } from "encore.dev/api";
import { expenseDB } from "./db";
import type { Expense } from "./types";

export interface ListExpensesResponse {
  expenses: Expense[];
}

// Retrieves all expenses with their splits.
export const listExpenses = api<void, ListExpensesResponse>(
  { expose: true, method: "GET", path: "/expenses" },
  async () => {
    const expenses: Expense[] = [];
    
    // Get all expenses with payer names
    for await (const row of expenseDB.query<{
      id: number;
      description: string;
      amount: number;
      payer_id: number;
      payer_name: string;
      created_at: Date;
    }>`
      SELECT e.id, e.description, e.amount, e.payer_id, m.name as payer_name, e.created_at
      FROM expenses e
      JOIN members m ON e.payer_id = m.id
      ORDER BY e.created_at DESC
    `) {
      // Get splits for this expense
      const splits = [];
      for await (const splitRow of expenseDB.query<{
        id: number;
        expense_id: number;
        member_id: number;
        member_name: string;
        amount: number;
      }>`
        SELECT es.id, es.expense_id, es.member_id, m.name as member_name, es.amount
        FROM expense_splits es
        JOIN members m ON es.member_id = m.id
        WHERE es.expense_id = ${row.id}
        ORDER BY m.name
      `) {
        splits.push({
          id: splitRow.id,
          expenseId: splitRow.expense_id,
          memberId: splitRow.member_id,
          memberName: splitRow.member_name,
          amount: splitRow.amount,
        });
      }

      expenses.push({
        id: row.id,
        description: row.description,
        amount: row.amount,
        payerId: row.payer_id,
        payerName: row.payer_name,
        createdAt: row.created_at,
        splits,
      });
    }

    return { expenses };
  }
);
