import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or, like, and } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q) {
      return NextResponse.json({ customers: [] });
    }

    const customers = await db
      .select({
        id: users.id,
        customerId: users.customerId,
        name: users.name,
        mobile: users.mobile,
        walletBalance: users.walletBalance,
        goldenCustomerCount: users.goldenCustomerCount,
        milestonesAchieved: users.milestonesAchieved,
        totalCashbackAmount: users.totalCashbackAmount,
        referredBy: users.referredBy,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(
        and(
          eq(users.role, "customer"),
          or(
            like(users.customerId, `%${q}%`),
            like(users.mobile, `%${q}%`),
            like(users.name, `%${q}%`)
          )
        )
      )
      .limit(10);

    return NextResponse.json({ customers });
  } catch (error) {
    console.error("Search error:", error);
    const msg =
      error instanceof Error ? error.message : "সার্ভার ত্রুটি";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
