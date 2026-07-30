import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cashbackTransactions, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "অননুমোদিত" }, { status: 401 });
    }

    const { id } = await params;
    const customerId = parseInt(id);

    // Customer can only see their own history
    if (session.role === "customer" && session.userId !== customerId) {
      return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস" }, { status: 403 });
    }

    const transactions = await db
      .select({
        id: cashbackTransactions.id,
        totalAmount: cashbackTransactions.totalAmount,
        customerShare: cashbackTransactions.customerShare,
        referrerShare: cashbackTransactions.referrerShare,
        incentiveFundShare: cashbackTransactions.incentiveFundShare,
        companyFundShare: cashbackTransactions.companyFundShare,
        isGolden: cashbackTransactions.isGolden,
        referrerClaimed: cashbackTransactions.referrerClaimed,
        createdAt: cashbackTransactions.createdAt,
      })
      .from(cashbackTransactions)
      .where(eq(cashbackTransactions.customerId, customerId))
      .orderBy(desc(cashbackTransactions.createdAt));

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Cashback history error:", error);
    return NextResponse.json({ error: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}
