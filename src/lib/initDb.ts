import { db } from "@/db";
import { users, funds } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";

export async function initializeDatabase() {
  try {
    // Check if admin exists
    const adminMobile = process.env.ADMIN_MOBILE || "01700000000";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin1234";

    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.mobile, adminMobile))
      .limit(1);

    if (existingAdmin.length === 0) {
      const hashedPassword = await hashPassword(adminPassword);
      await db.insert(users).values({
        customerId: "ADMIN",
        name: "অ্যাডমিন",
        mobile: adminMobile,
        password: hashedPassword,
        role: "admin",
        walletBalance: "0",
        goldenCustomerCount: 0,
        milestonesAchieved: "",
      });
      console.log("✅ Admin user created");
    }

    // Check if funds row exists
    const existingFunds = await db.select().from(funds).limit(1);
    if (existingFunds.length === 0) {
      await db.insert(funds).values({
        incentiveFundBalance: "0",
        companyFundBalance: "0",
        unclaimedFundBalance: "0",
      });
      console.log("✅ Funds row created");
    }
  } catch (error) {
    console.error("DB init error:", error);
  }
}
