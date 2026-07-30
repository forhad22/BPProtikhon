"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface WalletTransaction {
  id: number;
  amount: string;
  type: string;
  description: string;
  balanceAfter: string;
  createdAt: string;
}

const txTypeLabels: Record<string, { label: string; color: string; icon: string }> = {
  cashback_customer: { label: "ক্যাশব্যাক প্রাপ্তি", color: "text-emerald-600", icon: "💰" },
  cashback_referrer: { label: "জেনারেশন ইনকাম", color: "text-blue-600", icon: "👥" },
  cashback_incentive: { label: "ইনসেন্টিভ", color: "text-orange-600", icon: "🎯" },
  cashback_company: { label: "কোম্পানি", color: "text-purple-600", icon: "🏢" },
  cashback_unclaimed: { label: "আনক্লেইমড", color: "text-gray-600", icon: "📦" },
};

function formatAmount(amount: string | number) {
  return `৳${parseFloat(String(amount)).toLocaleString("bn-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function WalletPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [walletBalance, setWalletBalance] = useState("0");
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "customer")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "customer") {
      fetch(`/api/wallet/${user.id}`)
        .then((r) => r.json())
        .then((data) => {
          setWalletBalance(data.walletBalance || "0");
          setTransactions(data.transactions || []);
        })
        .finally(() => setFetching(false));
    }
  }, [user]);

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-3">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:pt-16 p-4 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">ওয়ালেট</h1>
        <p className="text-gray-500 text-sm mt-1">আপনার ব্যালেন্স ও লেনদেনের হিস্ট্রি</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 mb-6 text-white shadow-xl">
        <p className="text-emerald-100 text-sm mb-1">বর্তমান ব্যালেন্স</p>
        <p className="text-4xl font-bold">{formatAmount(walletBalance)}</p>
        <p className="text-emerald-200 text-xs mt-3">
          মোট {transactions.length} টি ট্রানজেকশন
        </p>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50">
          <h2 className="font-bold text-gray-800">লেনদেন হিস্ট্রি</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl">💰</span>
            <p className="text-gray-400 mt-3 text-sm">
              এখনো কোনো লেনদেন নেই
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map((tx) => {
              const txInfo = txTypeLabels[tx.type] || {
                label: tx.type,
                color: "text-gray-600",
                icon: "💳",
              };
              const isPositive = parseFloat(tx.amount) > 0;

              return (
                <div key={tx.id} className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl">
                      {txInfo.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {txInfo.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {tx.description}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(tx.createdAt).toLocaleString("bn-BD")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold text-base ${
                        isPositive ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {formatAmount(tx.amount)}
                    </p>
                    <p className="text-xs text-gray-400">
                      ব্যালেন্স: {formatAmount(tx.balanceAfter)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
