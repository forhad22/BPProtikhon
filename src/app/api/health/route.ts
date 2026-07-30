import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { initializeDatabase } from "@/lib/initDb";

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    await initializeDatabase();
    return NextResponse.json({ status: "ok", message: "BazarProtikhon API সক্রিয়" });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json({ status: "error", message: "ডেটাবেজ সংযোগ ব্যর্থ" }, { status: 500 });
  }
}