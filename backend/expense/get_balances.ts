import { api } from "encore.dev/api";
import { expenseDB } from "./db";
import type { Balance } from "./types";

export interface GetBalancesResponse {
  balances: Balance[];
}

// Calculates the balance for each member (how much they owe or are owed).
export const getBalances = api<void, GetBalancesResponse>(
  { expose: true, method: "GET", path: "/balances" },
  async () => {
    const balances: Balance[] = [];
    
    // Get all members
    for await (const member of expenseDB.query<{
      id: number;
      name: string;
    }>`SELECT id, name FROM members ORDER BY name`) {
      // Calculate total paid by this member
      const paidRow = await expenseDB.queryRow<{ total: number }>`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM expenses
        WHERE payer_id = ${member.id}
      `;
      const totalPaid = paidRow?.total || 0;

      // Calculate total owed by this member
      const owedRow = await expenseDB.queryRow<{ total: number }>`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM expense_splits
        WHERE member_id = ${member.id}
      `;
      const totalOwed = owedRow?.total || 0;

      const balance = totalPaid - totalOwed;

      balances.push({
        memberId: member.id,
        memberName: member.name,
        totalPaid,
        totalOwed,
        balance,
      });
    }

    return { balances };
  }
);
