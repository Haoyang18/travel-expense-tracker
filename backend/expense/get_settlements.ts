import { api } from "encore.dev/api";
import { expenseDB } from "./db";
import type { Settlement } from "./types";

export interface GetSettlementsResponse {
  settlements: Settlement[];
}

// Calculates the optimal settlements to balance all debts.
export const getSettlements = api<void, GetSettlementsResponse>(
  { expose: true, method: "GET", path: "/settlements" },
  async () => {
    // Get all member balances
    const memberBalances: { id: number; name: string; balance: number }[] = [];
    
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
      memberBalances.push({
        id: member.id,
        name: member.name,
        balance,
      });
    }

    // Calculate settlements using a greedy algorithm
    const settlements: Settlement[] = [];
    const debtors = memberBalances.filter(m => m.balance < -0.01).sort((a, b) => a.balance - b.balance);
    const creditors = memberBalances.filter(m => m.balance > 0.01).sort((a, b) => b.balance - a.balance);

    let debtorIndex = 0;
    let creditorIndex = 0;

    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];

      const amount = Math.min(-debtor.balance, creditor.balance);
      
      if (amount > 0.01) {
        settlements.push({
          fromMemberId: debtor.id,
          fromMemberName: debtor.name,
          toMemberId: creditor.id,
          toMemberName: creditor.name,
          amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
        });

        debtor.balance += amount;
        creditor.balance -= amount;
      }

      if (Math.abs(debtor.balance) < 0.01) {
        debtorIndex++;
      }
      if (Math.abs(creditor.balance) < 0.01) {
        creditorIndex++;
      }
    }

    return { settlements };
  }
);
