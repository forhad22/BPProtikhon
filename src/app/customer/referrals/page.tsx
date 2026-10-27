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
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<"referred" | "income">("referred");
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "customer")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

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

  const referralLink = user?.customerId
    ? `${baseUrl}/register?ref=${user.customerId}`
    : "";

  function copyReferralLink() {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  }

  function copyReferralCode() {
    if (user?.customerId) {
      navigator.clipboard.writeText(user.customerId);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  }

  function shareWhatsApp() {
    if (!referralLink) return;
    const msg = `আসসালামু আলাইকুম! বাজার প্রতীক্ষণে কেনাকাটা করে আকর্ষণীয় ক্যাশব্যাক ও দারুণ সব উপহার জিতুন। আমার রেফারেল লিংকে ক্লিক করে অ্যাকাউন্ট খুলুন:\n\n${referralLink}\n\nরেফারেল কোড: ${user?.customerId}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  }

  async function shareDirect() {
    if (!referralLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "বাজার প্রতীক্ষণ রেফারেল",
          text: `বাজার প্রতীক্ষণে যুক্ত হয়ে ক্যাশব্যাক উপভোগ করুন! রেফারেল কোড: ${user?.customerId}`,
          url: referralLink,
        });
      } catch {}
    } else {
      copyReferralLink();
    }
  }

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

  return (
    <div className="lg:pt-24 p-4 lg:p-8 max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">রেফারেল হাব</h1>
        <p className="text-slate-500 text-xs mt-1">
          বন্ধুদের রেফার করে প্রতি কেনাকাটায় পান ১৫% নগদ জেনারেশন ইনকাম
        </p>
      </div>

      {/* Main Referral Card with Link Generator */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
          <span className="text-[120px] select-none">📣</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="bg-white/20 text-indigo-100 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
              ১৫% জেনারেশন বোনাস সক্রিয়
            </span>
            <p className="text-xs text-indigo-200 mt-2">আপনার রেফারেল কোড</p>
            <p className="text-3xl font-black font-mono tracking-widest mt-0.5">
              {user?.customerId}
            </p>
          </div>
          <button
            onClick={copyReferralCode}
            className="bg-white/10 hover:bg-white/20 active:scale-95 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 backdrop-blur-md"
          >
            {copiedCode ? "✅ কপি হয়েছে" : "📋 কোড কপি"}
          </button>
        </div>

        {/* Shareable Link Box */}
        <div className="mt-4 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-2">
          <label className="text-[11px] font-semibold text-indigo-200 block">
            আপনার সরাসরি ইনভাইট লিংক:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="w-full bg-black/20 text-white text-xs px-3 py-2.5 rounded-xl font-mono outline-none border border-white/10"
            />
            <button
              onClick={copyReferralLink}
              className="bg-white text-indigo-800 hover:bg-indigo-50 active:scale-95 px-4 py-2.5 rounded-xl text-xs font-black transition flex-shrink-0 shadow-sm"
            >
              {copiedLink ? "✅ কপি হয়েছে!" : "লিংক কপি"}
            </button>
          </div>
        </div>

        {/* 1-Click Social Share Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={shareWhatsApp}
            className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>💬</span> হোয়াটসঅ্যাপে পাঠান
          </button>
          <button
            onClick={shareDirect}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>🔗</span> অন্য অ্যাপে শেয়ার
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black">
            👥
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{referredCustomers.length}</p>
            <p className="text-slate-400 text-xs font-medium">মোট রেফার করা গ্রাহক</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl font-black">
            💰
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-600">{formatAmount(totalIncome)}</p>
            <p className="text-slate-400 text-xs font-medium">মোট জেনারেশন আয়</p>
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab("referred")}
            className={`flex-1 py-3 text-xs font-bold rounded-2xl transition ${
              activeTab === "referred"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            রেফার করা সদস্যবৃন্দ ({referredCustomers.length})
          </button>
          <button
            onClick={() => setActiveTab("income")}
            className={`flex-1 py-3 text-xs font-bold rounded-2xl transition ${
              activeTab === "income"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            আয়ের স্টেটমেন্ট ({generationTransactions.length})
          </button>
        </div>

        {/* Tab 1: Referred Customer List */}
        {activeTab === "referred" && (
          <div className="divide-y divide-slate-100">
            {referredCustomers.length === 0 ? (
              <div className="text-center py-16 px-4">
                <span className="text-5xl">🎁</span>
                <p className="text-slate-700 font-bold text-sm mt-3">
                  এখনো কাউকে রেফার করা হয়নি
                </p>
                <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">
                  উপরের রেফারেল লিংকটি আপনার বন্ধুদের সাথে শেয়ার করুন এবং তারা কেনাকাটা করলেই ১৫% বোনাস উপভোগ করুন!
                </p>
              </div>
            ) : (
              referredCustomers.map((c) => (
                <div key={c.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-sm">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{c.name}</p>
                      <p className="text-xs text-indigo-600 font-mono mt-0.5">
                        {c.customerId} • {c.mobile}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full">
                      সক্রিয়
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(c.createdAt).toLocaleDateString("bn-BD")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Generation Income Statement */}
        {activeTab === "income" && (
          <div className="divide-y divide-slate-100">
            {generationTransactions.length === 0 ? (
              <div className="text-center py-16 px-4">
                <span className="text-5xl">💳</span>
                <p className="text-slate-700 font-bold text-sm mt-3">
                  কোনো জেনারেশন আয় হয়নি
                </p>
                <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">
                  আপনার রেফার করা সদস্যরা দোকানে কেনাকাটা করলে স্বয়ংক্রিয়ভাবে ১৫% বোনাস আপনার ওয়ালেটে জমা হবে।
                </p>
              </div>
            ) : (
              generationTransactions.map((tx) => (
                <div key={tx.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/50 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">💎</span>
                      <p className="text-sm font-bold text-slate-800">
                        জেনারেশন বোনাস প্রাপ্তি
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{tx.description}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(tx.createdAt).toLocaleString("bn-BD")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-emerald-600 text-base">
                      +{formatAmount(tx.amount)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
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
