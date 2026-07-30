import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "অননুমোদিত" }, { status: 401 });
    }

    const [user] = await db
      .select({
        id: users.id,
        customerId: users.customerId,
        name: users.name,
        mobile: users.mobile,
        role: users.role,
        walletBalance: users.walletBalance,
        goldenCustomerCount: users.goldenCustomerCount,
        milestonesAchieved: users.milestonesAchieved,
        referredBy: users.referredBy,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "ইউজার পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json({ error: "সার্ভার ত্রুটি" }, { status: 500 });
  }
}
