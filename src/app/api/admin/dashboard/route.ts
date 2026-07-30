import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, cashbackTransactions, funds, notifications } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    // Total customers
    const [customerCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, "customer"));

    // Total cashback distributed
    const [totalCashback] = await db
      .select({
        total: sql<string>`COALESCE(SUM(total_amount), 0)`,
        totalCustomerShare: sql<string>`COALESCE(SUM(customer_share), 0)`,
      })
      .from(cashbackTransactions);

    // Funds
    const [currentFunds] = await db.select().from(funds).limit(1);

    // Unread notifications count
    const [unreadCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(eq(notifications.isRead, false));

    // Recent cashback entries (last 10)
    const recentEntries = await db
      .select({
        id: cashbackTransactions.id,
        totalAmount: cashbackTransactions.totalAmount,
        customerShare: cashbackTransactions.customerShare,
        isGolden: cashbackTransactions.isGolden,
        createdAt: cashbackTransactions.createdAt,
        customerName: users.name,
        customerCustomerId: users.customerId,
      })
      .from(cashbackTransactions)
      .leftJoin(users, eq(cashbackTransactions.customerId, users.id))
      .orderBy(sql`${cashbackTransactions.createdAt} DESC`)
      .limit(10);

    // Golden customers (top by count)
    const goldenTop = await db
      .select({
        id: users.id,
        customerId: users.customerId,
        name: users.name,
        goldenCustomerCount: users.goldenCustomerCount,
      })
      .from(users)
      .where(eq(users.role, "customer"))
      .orderBy(sql`${users.goldenCustomerCount} DESC`)
      .limit(5);

    return NextResponse.json({
      stats: {
        totalCustomers: Number(customerCount.count),
        totalCashbackDistributed: totalCashback.total,
        totalCustomerShare: totalCashback.totalCustomerShare,
        incentiveFundBalance: currentFunds?.incentiveFundBalance ?? "0",
        companyFundBalance: currentFunds?.companyFundBalance ?? "0",
        unclaimedFundBalance: currentFunds?.unclaimedFundBalance ?? "0",
        unreadNotifications: Number(unreadCount.count),
      },
      recentEntries,
      goldenTop,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    const msg =
      error instanceof Error ? error.message : "সার্ভার ত্রুটি";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
