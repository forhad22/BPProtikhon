import { NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function PATCH() {
  try {
    await requireAdmin();

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.isRead, false));

    return NextResponse.json({ message: "সব নোটিফিকেশন পঠিত হিসেবে চিহ্নিত হয়েছে" });
  } catch (error) {
    console.error("Read all notifications error:", error);
    const msg =
      error instanceof Error ? error.message : "সার্ভার ত্রুটি";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
