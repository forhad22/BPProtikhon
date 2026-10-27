"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Spinner from "@/components/Spinner";

interface ReferralItem {
  customerId: number;
  customerName: string;
  customerCode: string;
  customerMobile: string;
  customerBalance: string;
  joinedAt: string;
  referrerId: number;
  referrerName: string;
  referrerCode: string;
  referrerMobile: string;
}

interface TopReferrer {
  id: number;
  name: string;
  customerId: string;
  mobile: string;
  referralCount: number;
}

interface ReferralsData {
  stats: {
    totalReferrals: number;
    totalGenerationIncome: string;
    unclaimedFund: string;
  };
  topReferrers: TopReferrer[];
  referralList: ReferralItem[];
}

function formatAmount(amount: string | number) {
  return `৳${parseFloat(String(amount)).toLocaleString("bn-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function AdminReferralsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ReferralsData | null>(null);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetch("/api/admin/referrals")
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

  const filteredList = data.referralList.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.customerName.toLowerCase().includes(q) ||
      item.customerCode.toLowerCase().includes(q) ||
      item.customerMobile.includes(q) ||
      item.referrerName.toLowerCase().includes(q) ||
      item.referrerCode.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">রেফারেল ট্র্যাকিং</h1>
        <p className="text-slate-500 text-xs mt-1">
          কোম্পানির সমস্ত রেফারেল সংযোগ ও ১৫% জেনারেশন আয়ের কেন্দ্রীয় রিপোর্ট
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
          <p className="text-xs text-blue-100 font-semibold uppercase tracking-wider">মোট রেফারেল সদস্য</p>
          <p className="text-3xl font-black mt-2">{data.stats.totalReferrals}</p>
          <p className="text-[10px] text-blue-200 mt-2">অন্যের রেফারে জয়েন করা গ্রাহক</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
          <p className="text-xs text-emerald-100 font-semibold uppercase tracking-wider">মোট জেনারেশন পে-আউট</p>
          <p className="text-3xl font-black mt-2">{formatAmount(data.stats.totalGenerationIncome)}</p>
          <p className="text-[10px] text-emerald-200 mt-2">রেফারারদের ওয়ালেটে জমা হওয়া ১৫%</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-slate-800 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
          <p className="text-xs text-purple-200 font-semibold uppercase tracking-wider">আনক্লেইমড ফান্ড</p>
          <p className="text-3xl font-black mt-2">{formatAmount(data.stats.unclaimedFund)}</p>
          <p className="text-[10px] text-purple-300 mt-2">রেফারারবিহীন কেনাকাটার ১৫% জমা</p>
        </div>
      </div>

      {/* Top Referrers Leaderboard */}
      {data.topReferrers && data.topReferrers.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <h2 className="font-extrabold text-slate-800 text-base">শীর্ষ রেফারার লিডারবোর্ড</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {data.topReferrers.map((tr, index) => (
              <div
                key={tr.id}
                className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    index === 0 ? "bg-amber-400 text-white" : index === 1 ? "bg-slate-300 text-slate-700" : "bg-orange-200 text-orange-800"
                  }`}>
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg">
                    {tr.referralCount} টি রেফারেল
                  </span>
                </div>
                <div className="mt-3">
                  <p className="font-bold text-slate-800 text-sm truncate">{tr.name}</p>
                  <p className="text-[10px] font-mono text-indigo-600 mt-0.5">{tr.customerId}</p>
                  <p className="text-[10px] text-slate-400">{tr.mobile}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Referral Relationships Searchable Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-extrabold text-slate-800 text-base">রেফারেল সংযোগ তালিকা</h2>
            <p className="text-slate-400 text-xs">কে কার রেফারে জয়েন করেছে তার বিস্তারিত তালিকা</p>
          </div>
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম, মোবাইল বা কোড দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
          </div>
        </div>

        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase border-y border-slate-100">
              <tr>
                <th className="py-3 px-6">কাস্টমার</th>
                <th className="py-3 px-6">রেফারার (যার রেফারে জয়েন)</th>
                <th className="py-3 px-6">যোগদানের তারিখ</th>
                <th className="py-3 px-6">ব্যালেন্স</th>
                <th className="py-3 px-6 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 font-medium">
                    কোনো রেফারেল তথ্য পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.customerId} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{item.customerName}</p>
                      <p className="text-[10px] font-mono text-indigo-600 mt-0.5">
                        {item.customerCode} • {item.customerMobile}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-500">🔗</span>
                        <div>
                          <p className="font-bold text-slate-800">{item.referrerName}</p>
                          <p className="text-[10px] font-mono text-blue-600">
                            {item.referrerCode}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(item.joinedAt).toLocaleDateString("bn-BD")}
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-600">
                      {formatAmount(item.customerBalance)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/customers/${item.customerId}`}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-xl text-[10px] transition"
                      >
                        প্রোফাইল দেখুন →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
