import { api, APIError } from "encore.dev/api";
import { expenseDB } from "./db";
import type { Expense } from "./types";

export interface ExpenseSplitInput {
  memberId: number;
  amount: number;
}

export interface AddExpenseRequest {
  description: string;
  amount: number;
  payerId: number;
  splits: ExpenseSplitInput[];
}

// Adds a new expense with custom splits.
export const addExpense = api<AddExpenseRequest, Expense>(
  { expose: true, method: "POST", path: "/expenses" },
  async (req) => {
    // Validate that splits sum to the total amount
    const totalSplits = req.splits.reduce((sum, split) => sum + split.amount, 0);
    if (Math.abs(totalSplits - req.amount) > 0.01) {
      throw APIError.invalidArgument("splits must sum to the total amount");
    }

    // Start a transaction
    await using tx = await expenseDB.begin();

    // Insert the expense
    const expenseRow = await tx.queryRow<{
      id: number;
      description: string;
      amount: number;
      payer_id: number;
      created_at: Date;
    }>`
      INSERT INTO expenses (description, amount, payer_id)
      VALUES (${req.description}, ${req.amount}, ${req.payerId})
      RETURNING id, description, amount, payer_id, created_at
    `;

    if (!expenseRow) {
      throw APIError.internal("failed to create expense");
    }

    // Insert the splits
    for (const split of req.splits) {
      await tx.exec`
        INSERT INTO expense_splits (expense_id, member_id, amount)
        VALUES (${expenseRow.id}, ${split.memberId}, ${split.amount})
      `;
    }

    await tx.commit();

    // Get the payer name and splits with member names
    const payerRow = await expenseDB.queryRow<{ name: string }>`
      SELECT name FROM members WHERE id = ${req.payerId}
    `;

    const splits = [];
    for (const split of req.splits) {
      const memberRow = await expenseDB.queryRow<{ name: string }>`
        SELECT name FROM members WHERE id = ${split.memberId}
      `;
      splits.push({
        id: 0, // Will be set by the database
        expenseId: expenseRow.id,
        memberId: split.memberId,
        memberName: memberRow!.name,
        amount: split.amount,
      });
    }

    return {
      id: expenseRow.id,
      description: expenseRow.description,
      amount: expenseRow.amount,
      payerId: expenseRow.payer_id,
      payerName: payerRow!.name,
      createdAt: expenseRow.created_at,
      splits,
    };
  }
);
