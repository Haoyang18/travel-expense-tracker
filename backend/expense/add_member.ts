import { api } from "encore.dev/api";
import { expenseDB } from "./db";
import type { Member } from "./types";

export interface AddMemberRequest {
  name: string;
}

// Adds a new member to the travel group.
export const addMember = api<AddMemberRequest, Member>(
  { expose: true, method: "POST", path: "/members" },
  async (req) => {
    const row = await expenseDB.queryRow<{
      id: number;
      name: string;
      created_at: Date;
    }>`
      INSERT INTO members (name)
      VALUES (${req.name})
      RETURNING id, name, created_at
    `;

    return {
      id: row!.id,
      name: row!.name,
      createdAt: row!.created_at,
    };
  }
);
