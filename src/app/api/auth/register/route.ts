import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";
import { generateCustomerId } from "@/lib/generateCustomerId";
import { initializeDatabase } from "@/lib/initDb";

export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();

    const body = await req.json();
    const { name, mobile, password, referralCode } = body;

    if (!name || !mobile || !password) {
      return NextResponse.json(
        { error: "নাম, মোবাইল নাম্বার এবং পাসওয়ার্ড দেওয়া আবশ্যক" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" },
        { status: 400 }
      );
    }

    // Check if mobile already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.mobile, mobile))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "এই মোবাইল নাম্বার দিয়ে ইতিমধ্যে অ্যাকাউন্ট রয়েছে" },
        { status: 409 }
      );
    }

    // Find referrer
    let referredById: number | null = null;
    if (referralCode && referralCode.trim()) {
      const referrer = await db
        .select()
        .from(users)
        .where(eq(users.customerId, referralCode.trim().toUpperCase()))
        .limit(1);
      if (referrer.length > 0 && referrer[0].role === "customer") {
        referredById = referrer[0].id;
      }
    }

    const hashedPassword = await hashPassword(password);
    const customerId = await generateCustomerId();

    await db.insert(users).values({
      customerId,
      name,
      mobile,
      password: hashedPassword,
      role: "customer",
      referredBy: referredById ?? undefined,
      walletBalance: "0",
      goldenCustomerCount: 0,
      milestonesAchieved: "",
    });

    return NextResponse.json({
      message: "রেজিস্ট্রেশন সফল হয়েছে",
      customerId,
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}