import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, walletTransactions, funds } from "@/db/schema";
import { eq, sql, isNotNull, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    // 1. Total referred customers
    const [referredCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(isNotNull(users.referredBy));

    // 2. Total generation income distributed
    const [totalIncomeResult] = await db
      .select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
      .from(walletTransactions)
      .where(eq(walletTransactions.type, "cashback_referrer"));

    // 3. Unclaimed fund balance
    const [fundResult] = await db.select().from(funds).limit(1);

    // 4. Full referral list (with referrer details)
    const referralList = await db
      .select({
        customerId: users.id,
        customerName: users.name,
        customerCode: users.customerId,
        customerMobile: users.mobile,
        customerBalance: users.walletBalance,
        joinedAt: users.createdAt,
        referrerId: users.referredBy,
      })
      .from(users)
      .where(isNotNull(users.referredBy))
      .orderBy(desc(users.createdAt))
      .limit(100);

    // Get referrer profiles for the list
    const referrerIds = Array.from(new Set(referralList.map((r) => r.referrerId).filter(Boolean))) as number[];
    const referrerMap = new Map<number, { name: string; customerId: string; mobile: string }>();

    if (referrerIds.length > 0) {
      const referrers = await db
        .select({
          id: users.id,
          name: users.name,
          customerId: users.customerId,
          mobile: users.mobile,
        })
        .from(users)
        .where(sql`${users.id} IN (${sql.join(referrerIds, sql`, `)})`);

      for (const ref of referrers) {
        referrerMap.set(ref.id, ref);
      }
    }

    const enrichedReferralList = referralList.map((r) => {
      const refUser = r.referrerId ? referrerMap.get(r.referrerId) : null;
      return {
        ...r,
        referrerName: refUser?.name || "অজানা",
        referrerCode: refUser?.customerId || "N/A",
        referrerMobile: refUser?.mobile || "N/A",
      };
    });

    // 5. Top Referrers leaderboard
    const topReferrers = await db
      .select({
        id: users.id,
        name: users.name,
        customerId: users.customerId,
        mobile: users.mobile,
        referralCount: sql<number>`count(*)`,
      })
      .from(users)
      .innerJoin(
        sql`users as referred`,
        sql`referred.referred_by = ${users.id}`
      )
      .groupBy(users.id, users.name, users.customerId, users.mobile)
      .orderBy(sql`count(*) DESC`)
      .limit(5);

    return NextResponse.json({
      stats: {
        totalReferrals: Number(referredCountResult.count),
        totalGenerationIncome: totalIncomeResult.total,
        unclaimedFund: fundResult?.unclaimedFundBalance ?? "0",
      },
      topReferrers,
      referralList: enrichedReferralList,
    });
  } catch (error) {
    console.error("Admin referrals error:", error);
    const msg = error instanceof Error ? error.message : "সার্ভার ত্রুটি";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
