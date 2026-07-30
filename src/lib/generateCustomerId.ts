import { db } from "@/db";
import { users } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function generateCustomerId(): Promise<string> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);
  const count = Number(result[0]?.count ?? 0);
  const num = (count + 1).toString().padStart(5, "0");
  return `BP-${num}`;
}
