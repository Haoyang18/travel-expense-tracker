import { api, APIError } from "encore.dev/api";
import { expenseDB } from "./db";
import type { Expense } from "./types";

export interface AddEqualExpenseRequest {
  description: string;
  amount: number;
  payerId: number;
  memberIds: number[];
}

// Adds a new expense split equally among specified members.
export const addEqualExpense = api<AddEqualExpenseRequest, Expense>(
  { expose: true, method: "POST", path: "/expenses/equal" },
  async (req) => {
    if (req.memberIds.length === 0) {
      throw APIError.invalidArgument("at least one member must be specified");
    }

    const splitAmount = req.amount / req.memberIds.length;

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
    for (const memberId of req.memberIds) {
      await tx.exec`
        INSERT INTO expense_splits (expense_id, member_id, amount)
        VALUES (${expenseRow.id}, ${memberId}, ${splitAmount})
      `;
    }

    await tx.commit();

    // Get the payer name and splits with member names
    const payerRow = await expenseDB.queryRow<{ name: string }>`
      SELECT name FROM members WHERE id = ${req.payerId}
    `;

    const splits = [];
    for (const memberId of req.memberIds) {
      const memberRow = await expenseDB.queryRow<{ name: string }>`
        SELECT name FROM members WHERE id = ${memberId}
      `;
      splits.push({
        id: 0, // Will be set by the database
        expenseId: expenseRow.id,
        memberId,
        memberName: memberRow!.name,
        amount: splitAmount,
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
