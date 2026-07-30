import { NextResponse } from "next/server";
import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const allNotifications = await db
      .select({
        id: notifications.id,
        customerId: notifications.customerId,
        milestone: notifications.milestone,
        rewardName: notifications.rewardName,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt,
        customerName: users.name,
        customerCustomerId: users.customerId,
        customerMobile: users.mobile,
      })
      .from(notifications)
      .leftJoin(users, eq(notifications.customerId, users.id))
      .orderBy(desc(notifications.createdAt));

    const unreadCount = allNotifications.filter((n) => !n.isRead).length;

    return NextResponse.json({ notifications: allNotifications, unreadCount });
  } catch (error) {
    console.error("Notifications error:", error);
    const msg =
      error instanceof Error ? error.message : "সার্ভার ত্রুটি";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
