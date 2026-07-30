import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, walletTransactions } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
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
    const userId = parseInt(id);

    if (session.role === "customer" && session.userId !== userId) {
      return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস" }, { status: 403 });
    }

    // Get referred customers
    const referredCustomers = await db
      .select({
        id: users.id,
        customerId: users.customerId,
        name: users.name,
        mobile: users.mobile,
        walletBalance: users.walletBalance,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.referredBy, userId))
      .orderBy(desc(users.createdAt));

    // Get generation income transactions
    const generationTransactions = await db
      .select()
      .from(walletTransactions)
      .where(
        and(
          eq(walletTransactions.userId, userId),
          eq(walletTransactions.type, "cashback_referrer")
        )
      )
      .orderBy(desc(walletTransactions.createdAt));

    const totalGenerationIncome = generationTransactions.reduce(
      (sum, tx) => sum + parseFloat(tx.amount),
      0
    );

    return NextResponse.json({
      referredCustomers,
      generationTransactions,
      totalGenerationIncome: totalGenerationIncome.toFixed(2),
    });
  } catch (error) {
    console.error("Referrals error:", error);
    return NextResponse.json({ error: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}
