import { api, APIError } from "encore.dev/api";
import { expenseDB } from "./db";

export interface DeleteMemberRequest {
  id: number;
}

// Deletes a member if they have no associated expenses or splits.
export const deleteMember = api<DeleteMemberRequest, void>(
  { expose: true, method: "DELETE", path: "/members/:id" },
  async (req) => {
    // Check if member exists
    const member = await expenseDB.queryRow<{ id: number }>`
      SELECT id FROM members WHERE id = ${req.id}
    `;

    if (!member) {
      throw APIError.notFound("member not found");
    }

    // Check if member has any expenses they paid for
    const paidExpenses = await expenseDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM expenses WHERE payer_id = ${req.id}
    `;

    if (paidExpenses && paidExpenses.count > 0) {
      throw APIError.failedPrecondition("cannot delete member who has paid for expenses");
    }

    // Check if member has any expense splits
    const expenseSplits = await expenseDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM expense_splits WHERE member_id = ${req.id}
    `;

    if (expenseSplits && expenseSplits.count > 0) {
      throw APIError.failedPrecondition("cannot delete member who is part of expense splits");
    }

    // Delete the member
    await expenseDB.exec`
      DELETE FROM members WHERE id = ${req.id}
    `;
  }
);
