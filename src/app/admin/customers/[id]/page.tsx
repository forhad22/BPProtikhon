"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface CustomerDetail {
  id: number;
  customerId: string;
  name: string;
  mobile: string;
  walletBalance: string;
  goldenCustomerCount: number;
  milestonesAchieved: string;
  referredBy: number | null;
  createdAt: string;
}

interface ReferrerInfo {
  id: number;
  customerId: string;
  name: string;
}

interface Transaction {
  id: number;
  totalAmount: string;
  customerShare: string;
  referrerShare: string;
  isGolden: boolean;
  referrerClaimed: boolean;
  createdAt: string;
}

interface ReferredCustomer {
  id: number;
  customerId: string;
  name: string;
  mobile: string;
  createdAt: string;
}

function formatAmount(amount: string | number) {
  return `৳${parseFloat(String(amount)).toLocaleString("bn-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const milestoneRewards: Record<string, string> = {
  "20": "মোবাইল ফোন 📱",
  "40": "রাইস কুকার 🍚",
  "80": "বিশেষ মেগা গিফট 🎁",
};

const MILESTONES = [20, 40, 80];

export default function CustomerDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [referrerInfo, setReferrerInfo] = useState<ReferrerInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [referredCustomers, setReferredCustomers] = useState<ReferredCustomer[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<"transactions" | "referrals">("transactions");

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "admin" && id) {
      Promise.all([
        fetch(`/api/customers/${id}`).then((r) => r.json()),
        fetch(`/api/cashback/history/${id}`).then((r) => r.json()),
      ])
        .then(([customerData, historyData]) => {
          setCustomer(customerData.customer);
          setReferrerInfo(customerData.referrerInfo);
          setReferredCustomers(customerData.referredCustomers || []);
          setTransactions(historyData.transactions || []);
        })
        .finally(() => setFetching(false));
    }
  }, [user, id]);

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 lg:pt-0">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-3">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center text-gray-500">কাস্টমার পাওয়া যায়নি</div>
    );
  }

  const achieved = customer.milestonesAchieved
    ? customer.milestonesAchieved.split(",").filter(Boolean).map(Number)
    : [];

  // Find next milestone
  const nextMilestone = MILESTONES.find((m) => !achieved.includes(m));
  const progressPercent = nextMilestone
    ? Math.min((customer.goldenCustomerCount / nextMilestone) * 100, 100)
    : 100;

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
      {/* Back */}
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-2 text-indigo-600 hover:underline mb-6 text-sm font-medium"
      >
        ← কাস্টমার তালিকায় ফিরুন
      </Link>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {customer.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800">{customer.name}</h1>
            <div className="flex flex-wrap gap-2 mt-1.5">
              <span className="bg-indigo-50 text-indigo-700 text-xs font-mono font-bold px-2.5 py-1 rounded-lg">
                {customer.customerId}
              </span>
              <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-lg">
                📱 {customer.mobile}
              </span>
              {referrerInfo && (
                <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-lg">
                  রেফার: {referrerInfo.name} ({referrerInfo.customerId})
                </span>
              )}
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-gray-400">ওয়ালেট ব্যালেন্স</p>
            <p className="text-2xl font-bold text-emerald-600">
              {formatAmount(customer.walletBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* Golden & Milestones */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">গোল্ডেন কাস্টমার স্ট্যাটাস</h2>
          <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-full">
            <span>⭐</span>
            <span className="font-bold text-yellow-700">
              {customer.goldenCustomerCount}
            </span>
          </div>
        </div>

        {nextMilestone && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1.5">
              <span>
                পরবর্তী মাইলস্টোন: {nextMilestone} ({milestoneRewards[String(nextMilestone)]})
              </span>
              <span>
                {customer.goldenCustomerCount}/{nextMilestone}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {MILESTONES.map((m) => {
            const isAchieved = achieved.includes(m);
            return (
              <div
                key={m}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
                  isAchieved
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-gray-50 text-gray-400 border border-gray-100"
                }`}
              >
                {isAchieved ? "✅" : "⬜"} {m} বার — {milestoneRewards[String(m)]}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex-1 py-3.5 text-sm font-medium transition ${
              activeTab === "transactions"
                ? "text-indigo-700 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ট্রানজেকশন হিস্ট্রি ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab("referrals")}
            className={`flex-1 py-3.5 text-sm font-medium transition ${
              activeTab === "referrals"
                ? "text-indigo-700 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            রেফার করা কাস্টমার ({referredCustomers.length})
          </button>
        </div>

        {activeTab === "transactions" && (
          <div className="divide-y divide-gray-50">
            {transactions.length === 0 ? (
              <p className="text-center text-gray-400 py-12 text-sm">
                কোনো ট্রানজেকশন নেই
              </p>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        tx.isGolden
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {tx.isGolden ? "⭐" : "💳"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        মোট: {formatAmount(tx.totalAmount)}
                      </p>
                      <p className="text-xs text-gray-400">
                        কাস্টমার পেয়েছে: {formatAmount(tx.customerShare)}
                        {!tx.referrerClaimed && " • আনক্লেইমড"}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.createdAt).toLocaleDateString("bn-BD")}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "referrals" && (
          <div className="divide-y divide-gray-50">
            {referredCustomers.length === 0 ? (
              <p className="text-center text-gray-400 py-12 text-sm">
                কোনো রেফারেল নেই
              </p>
            ) : (
              referredCustomers.map((rc) => (
                <div key={rc.id} className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{rc.name}</p>
                    <p className="text-xs text-gray-400">
                      {rc.customerId} • {rc.mobile}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-400">
                      {new Date(rc.createdAt).toLocaleDateString("bn-BD")}
                    </p>
                    <Link
                      href={`/admin/customers/${rc.id}`}
                      className="text-indigo-600 text-xs hover:underline"
                    >
                      দেখুন →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
