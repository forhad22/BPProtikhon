import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, ne, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const allCustomers = await db
      .select({
        id: users.id,
        customerId: users.customerId,
        name: users.name,
        mobile: users.mobile,
        walletBalance: users.walletBalance,
        goldenCustomerCount: users.goldenCustomerCount,
        milestonesAchieved: users.milestonesAchieved,
        referredBy: users.referredBy,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.role, "customer"))
      .orderBy(desc(users.createdAt));

    return NextResponse.json({ customers: allCustomers });
  } catch (error) {
    console.error("Customer list error:", error);
    const msg =
      error instanceof Error ? error.message : "সার্ভার ত্রুটি";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
