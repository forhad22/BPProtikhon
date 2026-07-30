
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
  { count: 20, reward: "মোবাইল ফোন", icon: "📱" },
  { count: 40, reward: "রাইস কুকার", icon: "🍚" },
  { count: 80, reward: "ফ্রিজ", icon: "❄️" },
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
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-semibold mt-3">অপেক্ষা করুন...</p>
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
      {/* Welcome & Info */}
      <div className="flex justify-between items-center bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-800">
            আসসালামু আলাইকুম, {userData.name}!
          </h1>
          <p className="text-slate-400 text-xs mt-1">আপনার ব্যালেন্স এবং রিওয়ার্ড অগ্রগতি</p>
        </div>
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl font-bold">
          🎉
        </div>
      </div>

      {/* Customer ID Premium Card */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
          <span className="text-[120px] select-none">💳</span>
        </div>
        
        <p className="text-indigo-200 text-xs font-semibold tracking-wider uppercase mb-1">কাস্টমার আইডি</p>
        <div className="flex items-center justify-between">
          <p className="text-3xl font-black tracking-widest font-mono">
            {userData.customerId}
          </p>
          <button
            onClick={copyId}
            className="bg-white/10 hover:bg-white/20 active:scale-95 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-md"
          >
            {copied ? "✅ কপি হয়েছে" : "📋 আইডি কপি করুন"}
          </button>
        </div>
        <div className="border-t border-white/10 mt-5 pt-4 flex justify-between text-xs text-indigo-100/80">
          <span>বাজারপ্রতীক্ষণ ডিজিটাল লয়্যালটি</span>
          <span>সদস্যপদ সক্রিয়</span>
        </div>
      </div>

      {/* Wallet Balance Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex items-center justify-between transition-all hover:shadow-md">
        <div className="space-y-1">
          <p className="text-slate-400 text-xs font-bold tracking-wide uppercase">বর্তমান জমানো ব্যালেন্স</p>
          <p className="text-3xl font-black text-emerald-600">
            {formatAmount(userData.walletBalance)}
          </p>
          <Link
            href="/customer/wallet"
            className="inline-block text-xs font-bold text-indigo-600 hover:text-indigo-800 transition pt-1.5"
          >
            লেনদেন হিস্ট্রি দেখুন →
          </Link>
        </div>
        <div className="w-16 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
          👛
        </div>
      </div>

      {/* Golden Loyalty Progress Tracker */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-slate-800 text-base">গোল্ডেন কাস্টমার অগ্রগতি</h2>
            <p className="text-slate-400 text-xs">মাইলস্টোন অর্জনের জন্য গোল্ডেন পয়েন্ট বাড়ান</p>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-4 py-2 rounded-2xl">
            <span className="text-lg">⭐</span>
            <span className="font-extrabold text-amber-700 text-base">
              {userData.goldenCustomerCount}
            </span>
          </div>
        </div>

        {nextMilestone ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1">
                {nextMilestone.icon} পরবর্তী পুরস্কার: <span className="text-indigo-600">{nextMilestone.reward}</span>
              </span>
              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg text-[10px]">
                আর {progressLeft} বার বাকি
              </span>
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-amber-400 via-orange-400 to-indigo-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${progressPercent}%` }}
              >
                {progressPercent > 20 && (
                  <span className="text-white text-[9px] font-black">
                    {Math.round(progressPercent)}%
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>{userData.goldenCustomerCount} বার এন্ট্রি</span>
              <span>টার্গেট: {nextMilestone.count} বার</span>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
            <p className="text-emerald-700 font-bold text-sm">
              🏆 অভিনন্দন! আপনি সব মাইলস্টোন অর্জন করেছেন!
            </p>
          </div>
        )}

        {/* Milestone Badges */}
        <div className="grid grid-cols-3 gap-2.5 pt-2">
          {MILESTONES.map((m) => {
            const isAchieved = achieved.includes(m.count);
            return (
              <div
                key={m.count}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                  isAchieved
                    ? "bg-emerald-50/50 border-emerald-100 text-emerald-800"
                    : "bg-slate-50/50 border-slate-100 text-slate-400"
                }`}
              >
                <span className={`text-2xl mb-1 ${isAchieved ? "grayscale-0" : "grayscale opacity-50"}`}>
                  {m.icon}
                </span>
                <span className="text-[10px] font-bold">{m.count} গোল্ডেন</span>
                <span className="text-[9px] font-medium truncate max-w-full mt-0.5">{m.reward}</span>
                {isAchieved && (
                  <span className="text-[10px] text-emerald-600 mt-1 font-bold">অর্জি ত</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/customer/referrals"
          className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all flex items-center gap-3.5 group"
        >
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl transition-transform group-hover:scale-110">
            📢
          </div>
          <div>
            <p className="font-extrabold text-slate-800 text-xs">রেফার করুন</p>
            <p className="text-slate-400 text-[10px] mt-0.5">জেনারেশন ইনকাম পান</p>
          </div>
        </Link>
        <Link
          href="/customer/wallet"
          className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all flex items-center gap-3.5 group"
        >
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl transition-transform group-hover:scale-110">
            📜
          </div>
          <div>
            <p className="font-extrabold text-slate-800 text-xs">লেনদেন লিস্ট</p>
            <p className="text-slate-400 text-[10px] mt-0.5">সব ট্রানজেকশন ট্র্যাকিং</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
