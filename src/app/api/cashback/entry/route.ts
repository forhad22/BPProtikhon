import { NextRequest, NextResponse } from "next/server";
import { db, pool } from "@/db";
import {
  users,
  cashbackTransactions,
  walletTransactions,
  funds,
  fundTransactions,
  notifications,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

const MILESTONES: Record<number, string> = {
  20: "মোবাইল ফোন",
  40: "রাইস কুকার",
  80: "ফ্রিজ",
};

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const { customerId, amount } = body;

    if (!customerId || !amount) {
      return NextResponse.json(
        { error: "কাস্টমার আইডি এবং অ্যামাউন্ট দেওয়া আবশ্যক" },
        { status: 400 }
      );
    }

    const totalAmount = parseFloat(amount);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      return NextResponse.json(
        { error: "সঠিক অ্যামাউন্ট দিন" },
        { status: 400 }
      );
    }

    // New distribution percentages:
    // গ্রাহক: ৩৫% (0.35)
    // কোম্পানি: ২০% (0.20)
    // জেনারেশন/রেফারার: ১৫% (0.15)
    // ইনসেন্টিভ ফান্ড: ৩০% (0.30)
    const customerShare = parseFloat((totalAmount * 0.35).toFixed(2));
    const companyShare = parseFloat((totalAmount * 0.20).toFixed(2));
    const referrerShare = parseFloat((totalAmount * 0.15).toFixed(2));
    const incentiveShare = parseFloat((totalAmount * 0.30).toFixed(2));

    // Find customer
    const [customer] = await db
      .select()
      .from(users)
      .where(eq(users.id, customerId))
      .limit(1);

    if (!customer) {
      return NextResponse.json(
        { error: "কাস্টমার পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    if (customer.role !== "customer") {
      return NextResponse.json(
        { error: "শুধুমাত্র কাস্টমারের জন্য ক্যাশব্যাক এন্ট্রি করা যাবে" },
        { status: 400 }
      );
    }

    // Get referrer if exists
    let referrer = null;
    if (customer.referredBy) {
      const [ref] = await db
        .select()
        .from(users)
        .where(eq(users.id, customer.referredBy))
        .limit(1);
      referrer = ref || null;
    }

    // Get current funds (auto-initialize if not yet created in DB)
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

    if (!currentFunds) {
      return NextResponse.json(
        { error: "ফান্ড রেকর্ড পাওয়া যায়নি এবং তৈরি করা সম্ভব হয়নি" },
        { status: 500 }
      );
    }

    // Calculate new wallet balance
    const newWalletBalance = parseFloat(customer.walletBalance) + customerShare;

    // Golden customer logic: based on TOTAL cashback amount (total_amount), not wallet balance
    const oldTotalCashback = parseFloat(customer.totalCashbackAmount || "0");
    const newTotalCashback = oldTotalCashback + totalAmount;
    const oldGoldenCount = customer.goldenCustomerCount;
    const newGoldenCount = Math.floor(newTotalCashback / 500);
    const newGoldenEarned = newGoldenCount - oldGoldenCount;
    const isGolden = newGoldenEarned > 0;

    const achievedMilestones = customer.milestonesAchieved
      ? customer.milestonesAchieved.split(",").filter(Boolean).map(Number)
      : [];

    // Perform all updates atomically using a raw MySQL transaction
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Update customer wallet, total cashback amount, and golden count
      await connection.execute(
        "UPDATE users SET wallet_balance = ?, total_cashback_amount = ?, golden_customer_count = ? WHERE id = ?",
        [newWalletBalance.toFixed(2), newTotalCashback.toFixed(2), newGoldenCount, customer.id]
      );

      // 2. Create cashback transaction record (use 1/0 for boolean in MySQL prepared statement)
      const [cashbackInsertResult] = await connection.execute(
        `INSERT INTO cashback_transactions (customer_id, total_amount, customer_share, referrer_share, referrer_id, incentive_fund_share, company_fund_share, is_golden, referrer_claimed, entered_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customer.id,
          totalAmount.toFixed(2),
          customerShare.toFixed(2),
          referrerShare.toFixed(2),
          referrer?.id ?? null,
          incentiveShare.toFixed(2),
          companyShare.toFixed(2),
          isGolden ? 1 : 0,
          referrer !== null ? 1 : 0,
          session.userId,
        ]
      );
      const cashbackTxId = (cashbackInsertResult as any).insertId;

      // 3. Create wallet transaction for customer
      await connection.execute(
        "INSERT INTO wallet_transactions (user_id, amount, type, description, cashback_transaction_id, balance_after) VALUES (?, ?, 'cashback_customer', ?, ?, ?)",
        [
          customer.id,
          customerShare.toFixed(2),
          `ক্যাশব্যাক প্রাপ্তি - মোট ${totalAmount} টাকার ৩৫%`,
          cashbackTxId,
          newWalletBalance.toFixed(2),
        ]
      );

      // 4. Handle referrer income
      const newIncentiveBalance =
        parseFloat(currentFunds.incentiveFundBalance) + incentiveShare;
      const newCompanyBalance =
        parseFloat(currentFunds.companyFundBalance) + companyShare;
      let newUnclaimedBalance = parseFloat(currentFunds.unclaimedFundBalance);

      if (referrer) {
        const newReferrerBalance =
          parseFloat(referrer.walletBalance) + referrerShare;
        await connection.execute(
          "UPDATE users SET wallet_balance = ? WHERE id = ?",
          [newReferrerBalance.toFixed(2), referrer.id]
        );

        await connection.execute(
          "INSERT INTO wallet_transactions (user_id, amount, type, description, cashback_transaction_id, balance_after) VALUES (?, ?, 'cashback_referrer', ?, ?, ?)",
          [
            referrer.id,
            referrerShare.toFixed(2),
            `জেনারেশন ইনকাম - ${customer.name} এর ক্যাশব্যাক থেকে`,
            cashbackTxId,
            newReferrerBalance.toFixed(2),
          ]
        );
      } else {
        newUnclaimedBalance += referrerShare;
        await connection.execute(
          "INSERT INTO fund_transactions (fund_type, amount, cashback_transaction_id, balance_after) VALUES ('unclaimed', ?, ?, ?)",
          [
            referrerShare.toFixed(2),
            cashbackTxId,
            newUnclaimedBalance.toFixed(2),
          ]
        );
      }

      // 5. Update funds
      await connection.execute(
        "UPDATE funds SET incentive_fund_balance = ?, company_fund_balance = ?, unclaimed_fund_balance = ?, updated_at = NOW() WHERE id = ?",
        [
          newIncentiveBalance.toFixed(2),
          newCompanyBalance.toFixed(2),
          newUnclaimedBalance.toFixed(2),
          currentFunds.id,
        ]
      );

      // 6. Fund transactions
      await connection.execute(
        "INSERT INTO fund_transactions (fund_type, amount, cashback_transaction_id, balance_after) VALUES ('incentive', ?, ?, ?)",
        [incentiveShare.toFixed(2), cashbackTxId, newIncentiveBalance.toFixed(2)]
      );

      await connection.execute(
        "INSERT INTO fund_transactions (fund_type, amount, cashback_transaction_id, balance_after) VALUES ('company', ?, ?, ?)",
        [companyShare.toFixed(2), cashbackTxId, newCompanyBalance.toFixed(2)]
      );

      // 7. Milestone check (only if new golden counts were earned)
      const milestoneNotifications: Array<{
        milestone: "20" | "40" | "80";
        rewardName: string;
      }> = [];

      if (isGolden) {
        // Check which milestones were crossed
        for (let g = oldGoldenCount + 1; g <= newGoldenCount; g++) {
          for (const [milestoneCount, rewardName] of Object.entries(MILESTONES)) {
            const mc = parseInt(milestoneCount);
            if (g === mc && !achievedMilestones.includes(mc)) {
              milestoneNotifications.push({
                milestone: milestoneCount as "20" | "40" | "80",
                rewardName,
              });
            }
          }
        }

        if (milestoneNotifications.length > 0) {
          const newMilestones = [
            ...achievedMilestones,
            ...milestoneNotifications.map((n) => parseInt(n.milestone)),
          ];
          await connection.execute(
            "UPDATE users SET milestones_achieved = ? WHERE id = ?",
            [newMilestones.join(","), customer.id]
          );

          for (const notif of milestoneNotifications) {
            await connection.execute(
              "INSERT INTO notifications (customer_id, milestone, reward_name, is_read) VALUES (?, ?, ?, 0)",
              [customer.id, notif.milestone, notif.rewardName]
            );
          }
        }
      }

      await connection.commit();

      return NextResponse.json({
        message: "ক্যাশব্যাক এন্ট্রি সফল হয়েছে",
        data: {
          transactionId: cashbackTxId,
          customerName: customer.name,
          totalAmount,
          customerShare,
          referrerShare,
          incentiveShare,
          companyShare,
          isGolden,
          referrerClaimed: referrer !== null,
          newGoldenCount,
          milestones: milestoneNotifications,
        },
      });
    } catch (txError) {
      await connection.rollback();
      throw txError;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Cashback entry error:", error);
    const msg =
      error instanceof Error ? error.message : "ক্যাশব্যাক এন্ট্রি ব্যর্থ হয়েছে";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
