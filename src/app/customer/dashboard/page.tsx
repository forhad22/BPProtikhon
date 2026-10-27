"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserData {
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

const MILESTONES = [
  { count: 20, reward: "মোবাইল ফোন", icon: "📱", desc: "২০ বার কেনাকাটায় নিশ্চিত উপহার" },
  { count: 40, reward: "রাইস কুকার", icon: "🍚", desc: "৪০ বার কেনাকাটায় আকর্ষণীয় উপহার" },
  { count: 80, reward: "বিশেষ মেগা গিফট", icon: "🎁", desc: "৮০ বার কেনাকাটায় সেরা মেগা পুরস্কার" },
];

function formatAmount(amount: string | number) {
  return `৳${parseFloat(String(amount)).toLocaleString("bn-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function CustomerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [fetching, setFetching] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "customer")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "customer") {
      fetch("/api/auth/me")
        .then((r) => r.json())
        .then((data) => setUserData(data.user))
        .finally(() => setFetching(false));
    }
  }, [user]);

  function copyId() {
    if (userData) {
      navigator.clipboard.writeText(userData.customerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto shadow-md"></div>
          <p className="text-slate-500 font-bold text-sm">ড্যাশবোর্ড প্রস্তুত হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  const achieved = userData.milestonesAchieved
    ? userData.milestonesAchieved.split(",").filter(Boolean).map(Number)
    : [];

  const nextMilestone = MILESTONES.find((m) => !achieved.includes(m.count));
  const progressPercent = nextMilestone
    ? Math.min((userData.goldenCustomerCount / nextMilestone.count) * 100, 100)
    : 100;
  const progressLeft = nextMilestone
    ? nextMilestone.count - userData.goldenCustomerCount
    : 0;

  return (
    <div className="lg:pt-24 p-4 lg:p-8 max-w-2xl mx-auto space-y-6">
      {/* Top Greeting Card */}
      <div className="flex justify-between items-center bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">👋</span>
            <h1 className="text-lg sm:text-xl font-black text-slate-800">
              আসসালামু আলাইকুম, {userData.name}!
            </h1>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            বাজার প্রতীক্ষণ লয়্যালটি মেম্বারশিপে আপনাকে স্বাগতম
          </p>
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center text-xl font-bold shadow-inner flex-shrink-0">
          🛍️
        </div>
      </div>

      {/* Digital Loyalty VIP Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden border border-indigo-500/20">
        {/* Holographic Watermark Background */}
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-6 translate-y-6 select-none pointer-events-none">
          <span className="text-[140px]">💎</span>
        </div>

        {/* Card Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">
                ডিজিটাল প্রিমিয়াম পাস
              </span>
            </div>
            <p className="text-xl font-black tracking-wide text-white mt-1">
              BazarProtikhon
            </p>
          </div>
          <span className="bg-white/10 text-amber-300 text-xs font-black px-3 py-1 rounded-full border border-amber-400/30 backdrop-blur-md flex items-center gap-1 shadow-sm">
            <span>⭐</span> গোল্ডেন: {userData.goldenCustomerCount}
          </span>
        </div>

        {/* Chip & ID */}
        <div className="space-y-1 mb-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
            কাস্টমার মেম্বারশিপ কোড
          </p>
          <div className="flex items-center justify-between">
            <p className="text-2xl sm:text-3xl font-black tracking-widest font-mono text-white">
              {userData.customerId}
            </p>
            <button
              onClick={copyId}
              className="bg-white/15 hover:bg-white/25 active:scale-95 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 backdrop-blur-md shadow-sm"
            >
              {copied ? "✅ কপি হয়েছে!" : "📋 কোড কপি"}
            </button>
          </div>
        </div>

        {/* Card Bottom Meta */}
        <div className="border-t border-white/10 pt-4 flex justify-between items-center text-xs text-indigo-200">
          <span className="font-medium">{userData.name}</span>
          <span className="font-mono text-[11px] opacity-80">{userData.mobile}</span>
        </div>
      </div>

      {/* Wallet Balance Widget */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex items-center justify-between hover:shadow-md transition">
        <div className="space-y-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> জমানো ওয়ালেট ব্যালেন্স
          </span>
          <p className="text-3xl font-black text-emerald-600">
            {formatAmount(userData.walletBalance)}
          </p>
          <Link
            href="/customer/wallet"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition pt-1"
          >
            লেনদেনের পূর্ণাঙ্গ স্টেটমেন্ট দেখুন ➔
          </Link>
        </div>
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl shadow-sm flex-shrink-0">
          👛
        </div>
      </div>

      {/* Golden Loyalty Progress Tracker */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black text-slate-800 text-base flex items-center gap-2">
              <span>🏆</span> গোল্ডেন কাস্টমার রিওয়ার্ড অগ্রগতি
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              প্রতি ৫০০ টাকার কেনাকাটায় ১টি গোল্ডেন পয়েন্ট যুক্ত হয়
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-3.5 py-1.5 rounded-2xl flex-shrink-0 shadow-sm">
            <span className="text-amber-500 text-base">⭐</span>
            <span className="font-black text-amber-700 text-sm">
              {userData.goldenCustomerCount} বার
            </span>
          </div>
        </div>

        {nextMilestone ? (
          <div className="space-y-2.5 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="text-lg">{nextMilestone.icon}</span> 
                পরবর্তী লক্ষ্য: <strong className="text-indigo-700 font-extrabold">{nextMilestone.reward}</strong>
              </span>
              <span className="bg-indigo-100/70 text-indigo-800 px-2.5 py-1 rounded-xl text-[11px] font-bold">
                আর {progressLeft} বার বাকি
              </span>
            </div>

            {/* Modern Progress Bar */}
            <div className="w-full bg-slate-200/80 rounded-full h-3.5 overflow-hidden p-0.5 shadow-inner">
              <div
                className="bg-gradient-to-r from-amber-400 via-orange-500 to-indigo-600 h-full rounded-full transition-all duration-700 flex items-center justify-end pr-1.5"
                style={{ width: `${Math.max(progressPercent, 4)}%` }}
              >
                {progressPercent > 20 && (
                  <span className="text-white text-[9px] font-black">
                    {Math.round(progressPercent)}%
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>বর্তমান: {userData.goldenCustomerCount} বার</span>
              <span>টার্গেট: {nextMilestone.count} বার</span>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-1">
            <span className="text-2xl">🎉</span>
            <p className="text-emerald-800 font-black text-sm">
              অভিনন্দন! আপনি সমস্ত মাইলস্টোন ও মেগা পুরস্কার অর্জন করেছেন!
            </p>
          </div>
        )}

        {/* 3 Milestone Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {MILESTONES.map((m) => {
            const isAchieved = achieved.includes(m.count);
            return (
              <div
                key={m.count}
                className={`flex flex-col items-center justify-between p-4 rounded-2xl border transition-all text-center ${
                  isAchieved
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-900 shadow-sm"
                    : "bg-slate-50/70 border-slate-100 text-slate-500"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-2 bg-white shadow-sm">
                  {m.icon}
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-slate-800">{m.reward}</p>
                  <p className="text-[10px] font-bold text-indigo-600">{m.count} বার গোল্ডেন</p>
                  <p className="text-[9px] text-slate-400 leading-tight">{m.desc}</p>
                </div>
                <div className="mt-3">
                  {isAchieved ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                      ✅ অর্জিত হয়েছে
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full">
                      🔒 অর্জনের অপেক্ষায়
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Access Action Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/customer/referrals"
          className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition flex items-center gap-4 group"
        >
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 flex-shrink-0">
            📢
          </div>
          <div>
            <p className="font-black text-slate-800 text-sm">রেফারেল লিংক</p>
            <p className="text-slate-400 text-xs mt-0.5">১৫% জেনারেশন আয় পান</p>
          </div>
        </Link>

        <Link
          href="/customer/wallet"
          className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition flex items-center gap-4 group"
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 flex-shrink-0">
            💳
          </div>
          <div>
            <p className="font-black text-slate-800 text-sm">ওয়ালেট হিস্ট্রি</p>
            <p className="text-slate-400 text-xs mt-0.5">সব জমা ও ব্যালেন্স</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
