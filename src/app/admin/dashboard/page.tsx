
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DashboardData {
  stats: {
    totalCustomers: number;
    totalCashbackDistributed: string;
    totalCustomerShare: string;
    incentiveFundBalance: string;
    companyFundBalance: string;
    unclaimedFundBalance: string;
    unreadNotifications: number;
  };
  recentEntries: Array<{
    id: number;
    totalAmount: string;
    customerShare: string;
    isGolden: boolean;
    createdAt: string;
    customerName: string;
    customerCustomerId: string;
  }>;
  goldenTop: Array<{
    id: number;
    customerId: string;
    name: string;
    goldenCustomerCount: number;
  }>;
}

function StatCard({
  icon,
  label,
  value,
  sub,
  gradient,
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  gradient: string;
}) {
  return (
    <div className={`${gradient} rounded-2xl p-5 text-white shadow-md relative overflow-hidden transition-all duration-300 hover:scale-[1.02]`}>
      <div className="absolute right-0 top-0 opacity-10 translate-x-2 -translate-y-2">
        <span className="text-7xl select-none">{icon}</span>
      </div>
      <div className="flex flex-col justify-between h-full">
        <div>
          <p className="text-xs opacity-75 font-semibold uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-black mt-2">{value}</p>
        </div>
        {sub && <p className="text-[10px] opacity-75 mt-3">{sub}</p>}
      </div>
    </div>
  );
}

function formatAmount(amount: string | number) {
  return `৳${parseFloat(String(amount)).toLocaleString("bn-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetch("/api/admin/dashboard")
        .then((r) => r.json())
        .then(setData)
        .finally(() => setFetching(false));
    }
  }, [user]);

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-semibold mt-3">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, recentEntries, goldenTop } = data;

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8 space-y-6 max-w-5xl mx-auto">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">অ্যাডমিন ড্যাশবোর্ড</h1>
          <p className="text-slate-400 text-xs mt-1">BazarProtikhon লয়্যালটি ম্যানেজমেন্টের সার্বিক অবস্থা</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/cashback"
            className="gradient-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm hover:opacity-95 transition"
          >
            + ক্যাশব্যাক এন্ট্রি
          </Link>
          <Link
            href="/admin/customers"
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition"
          >
            কাস্টমার অনুসন্ধান
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          icon="👥"
          label="মোট কাস্টমার"
          value={stats.totalCustomers}
          gradient="gradient-primary"
        />
        <StatCard
          icon="💳"
          label="মোট ক্যাশব্যাক বন্টন"
          value={formatAmount(stats.totalCashbackDistributed)}
          gradient="gradient-success"
        />
        <StatCard
          icon="🎯"
          label="ইনসেন্টিভ ফান্ড ব্যালেন্স"
          value={formatAmount(stats.incentiveFundBalance)}
          gradient="gradient-gold"
        />
        <StatCard
          icon="🏢"
          label="কোম্পানি ফান্ড"
          value={formatAmount(stats.companyFundBalance)}
          gradient="bg-gradient-to-br from-blue-600 to-cyan-600"
        />
        <StatCard
          icon="📦"
          label="আনক্লেইমড ফান্ড"
          value={formatAmount(stats.unclaimedFundBalance)}
          gradient="gradient-slate"
        />
        <StatCard
          icon="🔔"
          label="অপঠিত নোটিফিকেশন"
          value={stats.unreadNotifications}
          gradient="bg-gradient-to-br from-rose-500 to-pink-600"
          sub={stats.unreadNotifications > 0 ? "মাইলস্টোন রিওয়ার্ড পেন্ডিং" : "সব পড়া হয়েছে"}
        />
      </div>

      {/* Dashboard Tables / Columns */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Transactions List */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <h2 className="font-extrabold text-slate-800 text-sm">সাম্প্রতিক ক্যাশব্যাক এন্ট্রি</h2>
            <Link href="/admin/funds" className="text-indigo-600 hover:underline text-xs font-bold">
              সব দেখুন →
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentEntries.length === 0 ? (
              <p className="text-center text-slate-400 py-12 text-xs">এখনো কোনো ট্রানজেকশন হয়নি</p>
            ) : (
              recentEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/50 transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${
                      entry.isGolden ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-slate-50 text-slate-500"
                    }`}>
                      {entry.isGolden ? "⭐" : "💳"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{entry.customerName}</p>
                      <p className="text-[10px] font-semibold text-slate-400 font-mono mt-0.5">{entry.customerCustomerId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-800">{formatAmount(entry.totalAmount)}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      {new Date(entry.createdAt).toLocaleDateString("bn-BD")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Gold Members List */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50">
            <h2 className="font-extrabold text-slate-800 text-sm">শীর্ষ গোল্ডেন কাস্টমার</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {goldenTop.length === 0 ? (
              <p className="text-center text-slate-400 py-12 text-xs">কোনো গোল্ডেন কাস্টমার নেই</p>
            ) : (
              goldenTop.map((c, idx) => (
                <div key={c.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{c.name}</p>
                      <p className="text-[10px] font-semibold text-slate-400 font-mono mt-0.5">{c.customerId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-3 py-1 rounded-xl">
                    <span className="text-xs">⭐</span>
                    <span className="text-xs font-black text-amber-700">{c.goldenCustomerCount}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
