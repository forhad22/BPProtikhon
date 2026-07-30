import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, cashbackTransactions, walletTransactions } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
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

    // Customer can only view their own profile
    if (session.role === "customer" && session.userId !== userId) {
      return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস" }, { status: 403 });
    }

    const [customer] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!customer) {
      return NextResponse.json(
        { error: "কাস্টমার পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    // Get referrer info
    let referrerInfo = null;
    if (customer.referredBy) {
      const [ref] = await db
        .select({ id: users.id, customerId: users.customerId, name: users.name })
        .from(users)
        .where(eq(users.id, customer.referredBy))
        .limit(1);
      referrerInfo = ref || null;
    }

    // Get referred customers
    const referredCustomers = await db
      .select({
        id: users.id,
        customerId: users.customerId,
        name: users.name,
        mobile: users.mobile,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.referredBy, userId))
      .orderBy(desc(users.createdAt));

    // Get total cashback received from referrals (generation income)
    const generationIncome = await db
      .select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
      .from(walletTransactions)
      .where(
        eq(walletTransactions.userId, userId)
      );

    return NextResponse.json({
      customer: {
        ...customer,
        password: undefined,
      },
      referrerInfo,
      referredCustomers,
    });
  } catch (error) {
    console.error("Customer detail error:", error);
    return NextResponse.json({ error: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}
