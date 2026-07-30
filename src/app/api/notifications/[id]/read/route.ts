import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const notifId = parseInt(id);

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notifId));

    return NextResponse.json({ message: "পঠিত হিসেবে চিহ্নিত হয়েছে" });
  } catch (error) {
    console.error("Notification read error:", error);
    const msg =
      error instanceof Error ? error.message : "সার্ভার ত্রুটি";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
