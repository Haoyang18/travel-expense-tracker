import { api } from "encore.dev/api";
import { expenseDB } from "./db";
import type { Member } from "./types";

export interface ListMembersResponse {
  members: Member[];
}

// Retrieves all members in the travel group.
export const listMembers = api<void, ListMembersResponse>(
  { expose: true, method: "GET", path: "/members" },
  async () => {
    const members: Member[] = [];
    
    for await (const row of expenseDB.query<{
      id: number;
      name: string;
      created_at: Date;
    }>`SELECT id, name, created_at FROM members ORDER BY name`) {
      members.push({
        id: row.id,
        name: row.name,
        createdAt: row.created_at,
      });
    }

    return { members };
  }
);
