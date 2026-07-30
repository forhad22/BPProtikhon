"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface ReferredCustomer {
  id: number;
  customerId: string;
  name: string;
  mobile: string;
  walletBalance: string;
  createdAt: string;
}

interface GenerationTransaction {
  id: number;
  amount: string;
  description: string;
  balanceAfter: string;
  createdAt: string;
}

function formatAmount(amount: string | number) {
  return `৳${parseFloat(String(amount)).toLocaleString("bn-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function ReferralsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [referredCustomers, setReferredCustomers] = useState<ReferredCustomer[]>([]);
  const [generationTransactions, setGenerationTransactions] = useState<GenerationTransaction[]>([]);
  const [totalIncome, setTotalIncome] = useState("0");
  const [fetching, setFetching] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"referred" | "income">("referred");

  useEffect(() => {
    if (!loading && (!user || user.role !== "customer")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "customer") {
      fetch(`/api/referrals/${user.id}`)
        .then((r) => r.json())
        .then((data) => {
          setReferredCustomers(data.referredCustomers || []);
          setGenerationTransactions(data.generationTransactions || []);
          setTotalIncome(data.totalGenerationIncome || "0");
        })
        .finally(() => setFetching(false));
    }
  }, [user]);

  function copyReferralCode() {
    if (user?.customerId) {
      navigator.clipboard.writeText(user.customerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

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
        <h1 className="text-2xl font-bold text-gray-800">রেফারেল সিস্টেম</h1>
        <p className="text-gray-500 text-sm mt-1">বন্ধুদের রেফার করুন, ইনকাম করুন</p>
      </div>

      {/* Referral Code Card */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 mb-5 text-white shadow-xl">
        <p className="text-blue-100 text-sm mb-1">আপনার রেফারেল কোড</p>
        <p className="text-3xl font-bold font-mono tracking-wide mb-3">
          {user?.customerId}
        </p>
        <p className="text-blue-100 text-xs mb-4">
          এই কোড দিয়ে রেজিস্ট্রেশন করলে আপনি জেনারেশন ইনকাম পাবেন
        </p>
        <button
          onClick={copyReferralCode}
          className="bg-white/20 hover:bg-white/30 px-5 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2"
        >
          {copied ? "✅ কপি হয়েছে!" : "📋 রেফারেল কোড কপি করুন"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{referredCustomers.length}</p>
          <p className="text-gray-500 text-xs mt-1">মোট রেফারেল</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{formatAmount(totalIncome)}</p>
          <p className="text-gray-500 text-xs mt-1">মোট জেনারেশন ইনকাম</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab("referred")}
            className={`flex-1 py-3.5 text-sm font-medium transition ${
              activeTab === "referred"
                ? "text-indigo-700 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            রেফার করা কাস্টমার ({referredCustomers.length})
          </button>
          <button
            onClick={() => setActiveTab("income")}
            className={`flex-1 py-3.5 text-sm font-medium transition ${
              activeTab === "income"
                ? "text-indigo-700 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ইনকাম হিস্ট্রি ({generationTransactions.length})
          </button>
        </div>

        {activeTab === "referred" && (
          <div className="divide-y divide-gray-50">
            {referredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl">👥</span>
                <p className="text-gray-400 mt-3 text-sm">
                  এখনো কাউকে রেফার করেননি
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  আপনার রেফারেল কোড শেয়ার করুন
                </p>
              </div>
            ) : (
              referredCustomers.map((c) => (
                <div key={c.id} className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{c.name}</p>
                      <p className="text-xs text-gray-400">
                        {c.customerId} • {c.mobile}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString("bn-BD")}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "income" && (
          <div className="divide-y divide-gray-50">
            {generationTransactions.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl">💰</span>
                <p className="text-gray-400 mt-3 text-sm">
                  এখনো কোনো জেনারেশন ইনকাম নেই
                </p>
              </div>
            ) : (
              generationTransactions.map((tx) => (
                <div key={tx.id} className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      জেনারেশন ইনকাম
                    </p>
                    <p className="text-xs text-gray-400">{tx.description}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.createdAt).toLocaleString("bn-BD")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">
                      +{formatAmount(tx.amount)}
                    </p>
                    <p className="text-xs text-gray-400">
                      ব্যালেন্স: {formatAmount(tx.balanceAfter)}
                    </p>
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
