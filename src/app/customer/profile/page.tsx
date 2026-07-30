"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

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

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-3">লোড হচ্ছে...</p>
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

  return (
    <div className="lg:pt-16 p-4 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">প্রোফাইল</h1>
        <p className="text-gray-500 text-sm mt-1">আপনার অ্যাকাউন্টের তথ্য</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {userData.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{userData.name}</h2>
            <p className="text-gray-500 text-sm">📱 {userData.mobile}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-gray-500 text-sm">কাস্টমার আইডি</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-indigo-700">
                {userData.customerId}
              </span>
              <button
                onClick={copyId}
                className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100"
              >
                {copied ? "✅" : "📋"}
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-gray-500 text-sm">ওয়ালেট ব্যালেন্স</span>
            <span className="font-bold text-emerald-600">
              {formatAmount(userData.walletBalance)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-gray-500 text-sm">গোল্ডেন কাউন্ট</span>
            <span className="font-bold text-yellow-600">
              ⭐ {userData.goldenCustomerCount}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-gray-500 text-sm">রেজিস্ট্রেশন তারিখ</span>
            <span className="text-gray-700 text-sm">
              {new Date(userData.createdAt).toLocaleDateString("bn-BD")}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-500 text-sm">রেফারেল কোড</span>
            <span className="font-mono font-bold text-blue-600">
              {userData.customerId}
            </span>
          </div>
        </div>
      </div>

      {/* Progress */}
      {nextMilestone && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <h3 className="font-bold text-gray-800 mb-3">
            পরবর্তী মাইলস্টোন অগ্রগতি
          </h3>
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>
              {nextMilestone.icon} {nextMilestone.reward}
            </span>
            <span>
              {userData.goldenCustomerCount}/{nextMilestone.count}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-400 h-full rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            আরও {nextMilestone.count - userData.goldenCustomerCount} বার গোল্ডেন পেলে পুরস্কার পাবেন
          </p>
        </div>
      )}

      {/* Milestones */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
        <h3 className="font-bold text-gray-800 mb-3">মাইলস্টোন অর্জন</h3>
        <div className="space-y-2">
          {MILESTONES.map((m) => {
            const isAchieved = achieved.includes(m.count);
            return (
              <div
                key={m.count}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  isAchieved
                    ? "bg-green-50 border border-green-100"
                    : "bg-gray-50 border border-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{m.icon}</span>
                  <div>
                    <p className={`text-sm font-medium ${isAchieved ? "text-green-800" : "text-gray-600"}`}>
                      {m.count} বার গোল্ডেন
                    </p>
                    <p className={`text-xs ${isAchieved ? "text-green-600" : "text-gray-400"}`}>
                      পুরস্কার: {m.reward}
                    </p>
                  </div>
                </div>
                <span className="text-xl">{isAchieved ? "✅" : "⬜"}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition border border-red-100"
      >
        লগআউট করুন
      </button>
    </div>
  );
}
