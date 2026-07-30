import {
  mysqlTable,
  mysqlEnum,
  int,
  varchar,
  decimal,
  boolean,
  timestamp,
  text,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

// Users table
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  customerId: varchar("customer_id", { length: 50 }).notNull().unique(), // e.g. BP-0001
  name: varchar("name", { length: 255 }).notNull(),
  mobile: varchar("mobile", { length: 20 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["admin", "customer"]).notNull().default("customer"),
  referredBy: int("referred_by"), // nullable, FK to users.id
  walletBalance: decimal("wallet_balance", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  totalCashbackAmount: decimal("total_cashback_amount", { precision: 12, scale: 2 })
    .notNull()
    .default("0"), // sum of all total_amount from cashback_transactions
  goldenCustomerCount: int("golden_customer_count").notNull().default(0),
  milestonesAchieved: varchar("milestones_achieved", { length: 100 }).notNull().default(""), // comma-separated e.g. "20,40"
  createdAt: timestamp("created_at", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Cashback transactions table
export const cashbackTransactions = mysqlTable("cashback_transactions", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customer_id").notNull(), // FK to users.id
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  customerShare: decimal("customer_share", { precision: 12, scale: 2 }).notNull(),
  referrerShare: decimal("referrer_share", { precision: 12, scale: 2 }).notNull(),
  referrerId: int("referrer_id"), // nullable
  incentiveFundShare: decimal("incentive_fund_share", {
    precision: 12,
    scale: 2,
  }).notNull(),
  companyFundShare: decimal("company_fund_share", {
    precision: 12,
    scale: 2,
  }).notNull(),
  isGolden: boolean("is_golden").notNull().default(false),
  referrerClaimed: boolean("referrer_claimed").notNull().default(true), // false if unclaimed
  enteredBy: int("entered_by").notNull(), // admin user id
  createdAt: timestamp("created_at", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Wallet transactions table (extensible for future withdraw)
export const walletTransactions = mysqlTable("wallet_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(), // FK to users.id
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(), // positive = credit, negative = debit
  type: mysqlEnum("type", [
    "cashback_customer",
    "cashback_referrer",
    "cashback_incentive",
    "cashback_company",
    "cashback_unclaimed",
  ]).notNull(),
  description: text("description").notNull(),
  cashbackTransactionId: int("cashback_transaction_id"), // nullable, ref to cashback_transactions
  balanceAfter: decimal("balance_after", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Funds table (single row)
export const funds = mysqlTable("funds", {
  id: int("id").autoincrement().primaryKey(),
  incentiveFundBalance: decimal("incentive_fund_balance", {
    precision: 12,
    scale: 2,
  })
    .notNull()
    .default("0"),
  companyFundBalance: decimal("company_fund_balance", {
    precision: 12,
    scale: 2,
  })
    .notNull()
    .default("0"),
  unclaimedFundBalance: decimal("unclaimed_fund_balance", {
    precision: 12,
    scale: 2,
  })
    .notNull()
    .default("0"),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
});

// Fund transactions table (history for each fund)
export const fundTransactions = mysqlTable("fund_transactions", {
  id: int("id").autoincrement().primaryKey(),
  fundType: varchar("fund_type", { length: 50 }).notNull(), // "incentive" | "company" | "unclaimed"
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  cashbackTransactionId: int("cashback_transaction_id").notNull(),
  balanceAfter: decimal("balance_after", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Notifications table
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customer_id").notNull(), // FK to users.id
  milestone: mysqlEnum("milestone", ["20", "40", "80"]).notNull(),
  rewardName: varchar("reward_name", { length: 255 }).notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});