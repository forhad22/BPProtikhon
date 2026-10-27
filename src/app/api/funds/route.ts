import { NextResponse } from "next/server";
import { db } from "@/db";
import { funds, fundTransactions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    let [currentFunds] = await db.select().from(funds).limit(1);

    if (!currentFunds) {
      await db.insert(funds).values({
        incentiveFundBalance: "0",
        companyFundBalance: "0",
        unclaimedFundBalance: "0",
      });
      const [newFunds] = await db.select().from(funds).limit(1);
      currentFunds = newFunds;
    }

    const incentiveHistory = await db
      .select()
      .from(fundTransactions)
      .where(eq(fundTransactions.fundType, "incentive"))
      .orderBy(desc(fundTransactions.createdAt))
      .limit(20);

    const companyHistory = await db
      .select()
      .from(fundTransactions)
      .where(eq(fundTransactions.fundType, "company"))
      .orderBy(desc(fundTransactions.createdAt))
      .limit(20);

    const unclaimedHistory = await db
      .select()
      .from(fundTransactions)
      .where(eq(fundTransactions.fundType, "unclaimed"))
      .orderBy(desc(fundTransactions.createdAt))
      .limit(20);

    return NextResponse.json({
      funds: currentFunds,
      history: {
        incentive: incentiveHistory,
        company: companyHistory,
        unclaimed: unclaimedHistory,
      },
    });
  } catch (error) {
    console.error("Funds error:", error);
    const msg =
      error instanceof Error ? error.message : "সার্ভার ত্রুটি";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
