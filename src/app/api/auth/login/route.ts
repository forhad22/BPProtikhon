import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { comparePassword, signToken } from "@/lib/auth";
import { initializeDatabase } from "@/lib/initDb";

export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();

    const body = await req.json();
    const { mobile, password } = body;

    if (!mobile || !password) {
      return NextResponse.json(
        { error: "মোবাইল নাম্বার এবং পাসওয়ার্ড দেওয়া আবশ্যক" },
        { status: 400 }
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.mobile, mobile))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "মোবাইল নাম্বার বা পাসওয়ার্ড সঠিক নয়" },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "মোবাইল নাম্বার বা পাসওয়ার্ড সঠিক নয়" },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user.id,
      customerId: user.customerId,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      message: "লগইন সফল হয়েছে",
      user: {
        id: user.id,
        customerId: user.customerId,
        name: user.name,
        role: user.role,
        mobile: user.mobile,
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
