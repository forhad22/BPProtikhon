"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";

interface Customer {
  id: number;
  customerId: string;
  name: string;
  mobile: string;
  walletBalance: string;
  goldenCustomerCount: number;
  totalCashbackAmount?: string;
}

interface CashbackResult {
  transactionId: number;
  customerName: string;
  totalAmount: number;
  customerShare: number;
  referrerShare: number;
  incentiveShare: number;
  companyShare: number;
  isGolden: boolean;
  referrerClaimed: boolean;
  newGoldenCount: number;
  milestones: Array<{ milestone: string; rewardName: string }>;
}

function formatAmount(amount: number | string) {
  return `৳${parseFloat(String(amount)).toLocaleString("bn-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export default function CashbackEntryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [amount, setAmount] = useState("");
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CashbackResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const searchCustomers = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/customers/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data.customers || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchCustomers(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery, searchCustomers]);

  function selectCustomer(c: Customer) {
    setSelectedCustomer(c);
    setSearchQuery("");
    setSearchResults([]);
    setResult(null);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCustomer) return;
    setError("");
    setResult(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/cashback/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          amount: parseFloat(amount),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "এন্ট্রি ব্যর্থ হয়েছে");
      } else {
        setResult(data.data);
        setAmount("");
        setSelectedCustomer(null);
      }
    } catch {
      setError("সার্ভার ত্রুটি। আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  }

  const numAmount = parseFloat(amount) || 0;
  // Updated allocation: গ্রাহক ৩৫%, কোম্পানি ২০%, জেনারেশন ১৫%, ইনসেন্টিভ ৩০%
  const preview = {
    customer: (numAmount * 0.35).toFixed(2),
    company: (numAmount * 0.20).toFixed(2),
    referrer: (numAmount * 0.15).toFixed(2),
    incentive: (numAmount * 0.30).toFixed(2),
  };
  // Golden count preview based on TOTAL cashback amount
  // Every 500 taka in total_amount = 1 golden count
  const previewOldTotalCashback = selectedCustomer ? parseFloat(selectedCustomer.totalCashbackAmount || "0") : 0;
  const previewNewTotalCashback = previewOldTotalCashback + numAmount;
  const previewOldGolden = selectedCustomer ? selectedCustomer.goldenCustomerCount : 0;
  const previewNewGolden = Math.floor(previewNewTotalCashback / 500);
  const previewGoldenEarned = previewNewGolden - previewOldGolden;
  const previewIsGolden = previewGoldenEarned > 0;
  const previewRemainingForNextGolden = 500 - (previewNewTotalCashback % 500);

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8 max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <span>💳</span> ক্যাশব্যাক এন্ট্রি
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          কাস্টমার ক্রয়ের ওপর ৩৫% ক্যাশব্যাক ও ১৫% জেনারেশন ইনকাম হিসাব করুন
        </p>
      </div>

      {/* Success Result Container */}
      {result && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 space-y-4 shadow-sm animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎉</span>
            <div>
              <h3 className="font-black text-emerald-900 text-sm">ক্যাশব্যাক এন্ট্রি সফল হয়েছে!</h3>
              <p className="text-emerald-700 text-[11px] font-medium">লেনদেন ডাটাবেজে রেকর্ড করা হয়েছে</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-emerald-800">
            <div className="flex justify-between items-center bg-emerald-100/60 rounded-2xl px-3.5 py-2">
              <span className="font-bold text-slate-600">গ্রাহক: {result.customerName}</span>
              <span className="font-black text-emerald-800 text-sm">{formatAmount(result.totalAmount)}</span>
            </div>
            
            <div className="bg-white rounded-2xl p-4 border border-emerald-100 space-y-2.5 text-xs shadow-sm">
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">গ্রাহক শেয়ার (৩৫%)</span>
                <span className="font-black text-emerald-600">{formatAmount(result.customerShare)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">কোম্পানি শেয়ার (২০%)</span>
                <span className="font-black text-purple-600">{formatAmount(result.companyShare)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">{result.referrerClaimed ? "রেফারার আয় (১৫%)" : "আনক্লেইমড ফান্ড (১৫%)"}</span>
                <span className="font-black text-blue-600">{formatAmount(result.referrerShare)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">ইনসেন্টিভ ফান্ড (৩০%)</span>
                <span className="font-black text-amber-600">{formatAmount(result.incentiveShare)}</span>
              </div>
            </div>

            {result.isGolden && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-3.5 py-2.5">
                <span className="text-lg">⭐</span>
                <span className="font-black text-amber-800 text-xs">
                  গোল্ডেন পয়েন্ট আপডেট হয়েছে! মোট অর্জিত: {result.newGoldenCount} বার
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setResult(null)}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-2xl text-xs font-black transition shadow-sm"
          >
            নতুন এন্ট্রি শুরু করুন
          </button>
        </div>
      )}

      {/* Main Entry Panel */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-5">
        {/* Customer Search Section */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wide">
            গ্রাহক নির্বাচন করুন
          </label>
          {selectedCustomer ? (
            <div className="flex items-center justify-between bg-indigo-50/70 border border-indigo-200/80 rounded-2xl px-4 py-3">
              <div>
                <p className="font-black text-slate-800 text-sm">{selectedCustomer.name}</p>
                <p className="text-xs text-indigo-700 font-mono font-bold mt-0.5">
                  {selectedCustomer.customerId} • {selectedCustomer.mobile}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  ব্যালেন্স: {formatAmount(selectedCustomer.walletBalance)} | গোল্ডেন: {selectedCustomer.goldenCustomerCount}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-red-500 text-sm font-bold bg-white px-2.5 py-1 rounded-xl shadow-xs border border-slate-200 transition"
              >
                বদলান
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-200 outline-none text-sm transition font-medium"
                placeholder="মোবাইল বা কাস্টমার আইডি লিখুন..."
              />
              {searching && (
                <div className="absolute right-3.5 top-3.5">
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-xl mt-1.5 z-10 overflow-hidden divide-y divide-slate-50">
                  {searchResults.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectCustomer(c)}
                      className="w-full text-left px-4 py-3 hover:bg-indigo-50/60 transition"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{c.name}</p>
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                            {c.customerId} • {c.mobile}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600">
                          {formatAmount(c.walletBalance)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Transaction Amount Submission */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wide">
              মোট ক্রয় অ্যামাউন্ট (৳)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-400 text-lg font-black">৳</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-200 outline-none text-lg font-black text-slate-800"
                placeholder="অ্যামাউন্ট লিখুন"
                min="1"
                step="0.01"
                required
              />
            </div>

            {/* Quick Amount Pill Shortcuts */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-bold mr-1">কুইক সিলেক্ট:</span>
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(String(val))}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 text-xs font-bold rounded-xl transition"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Allocation Progress Breakdown */}
          {numAmount > 0 && (
            <div className="bg-slate-50/80 rounded-2xl p-4 space-y-3.5 border border-slate-100">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                স্বয়ংক্রিয় বণ্টন প্রিভিউ
              </p>
              
              {/* Graphical Stacked Distribution Bar */}
              <div className="h-3.5 w-full bg-slate-200 rounded-full flex overflow-hidden shadow-inner">
                <div style={{ width: "35%" }} className="bg-emerald-500" title="গ্রাহক (৩৫%)" />
                <div style={{ width: "20%" }} className="bg-purple-500" title="কোম্পানি (২০%)" />
                <div style={{ width: "15%" }} className="bg-blue-500" title="জেনারেশন (১৫%)" />
                <div style={{ width: "30%" }} className="bg-amber-500" title="ইনসেন্টিভ (৩০%)" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> গ্রাহক শেয়ার (৩৫%)
                  </span>
                  <span className="font-bold text-emerald-600">{formatAmount(preview.customer)}</span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> কোম্পানি লাভ (২০%)
                  </span>
                  <span className="font-bold text-purple-600">{formatAmount(preview.company)}</span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> জেনারেশন আয় (১৫%)
                  </span>
                  <span className="font-bold text-blue-600">{formatAmount(preview.referrer)}</span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> ইনসেন্টিভ ফান্ড (৩০%)
                  </span>
                  <span className="font-bold text-amber-600">{formatAmount(preview.incentive)}</span>
                </div>

                {previewIsGolden && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-2 mt-2">
                    <span>⭐</span>
                    <span className="text-[10px] font-bold text-amber-800">
                      মোট {previewNewGolden} বার গোল্ডেন হবে (প্রতি ৫০০ টাকায় ১ বার)
                    </span>
                  </div>
                )}
                {!previewIsGolden && selectedCustomer && (
                  <div className="text-[10px] text-slate-400 mt-2 text-center">
                    পরবর্তী গোল্ডেন হতে আরও {previewRemainingForNextGolden} টাকার ক্রয় বাকি
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !selectedCustomer || !amount}
            className="w-full py-3.5 gradient-primary text-white font-bold rounded-2xl hover:opacity-95 active:scale-98 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Spinner />
            ) : (
              <>
                <span>💳</span> ক্যাশব্যাক হিসাব ও বিতরণ করুন
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
