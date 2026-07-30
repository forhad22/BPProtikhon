import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, walletTransactions } from "@/db/schema";
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
    const userId = parseInt(id);

    if (session.role === "customer" && session.userId !== userId) {
      return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস" }, { status: 403 });
    }

    const [user] = await db
      .select({
        id: users.id,
        walletBalance: users.walletBalance,
        name: users.name,
        customerId: users.customerId,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "ইউজার পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    const transactions = await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.userId, userId))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(50);

    return NextResponse.json({
      walletBalance: user.walletBalance,
      transactions,
    });
  } catch (error) {
    console.error("Wallet error:", error);
    return NextResponse.json({ error: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}
