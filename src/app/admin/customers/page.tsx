"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Customer {
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

function formatAmount(amount: string | number) {
  return `৳${parseFloat(String(amount)).toLocaleString("bn-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export default function CustomersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filtered, setFiltered] = useState<Customer[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetch("/api/customers/list")
        .then((r) => r.json())
        .then((data) => {
          setCustomers(data.customers || []);
          setFiltered(data.customers || []);
        })
        .finally(() => setFetching(false));
    }
  }, [user]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(customers);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFiltered(
      customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.mobile.includes(q) ||
          c.customerId.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, customers]);

  const milestoneLabels: Record<string, string> = {
    "20": "📱",
    "40": "🍚",
    "80": "🎁",
  };

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

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">কাস্টমার তালিকা</h1>
          <p className="text-gray-500 text-sm mt-1">
            মোট {customers.length} জন কাস্টমার
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 outline-none"
          placeholder="নাম, মোবাইল বা কাস্টমার আইডি দিয়ে সার্চ করুন"
        />
      </div>

      {/* Table / Cards */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                কাস্টমার
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                মোবাইল
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                ওয়ালেট
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                গোল্ডেন
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                মাইলস্টোন
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                রেজিস্ট্রেশন
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((c) => {
              const achieved = c.milestonesAchieved
                ? c.milestonesAchieved.split(",").filter(Boolean)
                : [];
              return (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-800">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.customerId}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.mobile}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-emerald-600">
                      {formatAmount(c.walletBalance)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold ${
                        c.goldenCustomerCount > 0
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {c.goldenCustomerCount > 0 ? "⭐" : ""}{" "}
                      {c.goldenCustomerCount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {achieved.map((m) => (
                        <span key={m} title={`${m} গোল্ডেন`}>
                          {milestoneLabels[m] || m}
                        </span>
                      ))}
                      {achieved.length === 0 && (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString("bn-BD")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="text-indigo-600 text-sm hover:underline font-medium"
                    >
                      বিস্তারিত
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-12 text-sm">
            কোনো কাস্টমার পাওয়া যায়নি
          </p>
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((c) => {
          const achieved = c.milestonesAchieved
            ? c.milestonesAchieved.split(",").filter(Boolean)
            : [];
          return (
            <div
              key={c.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-400">
                    {c.customerId} • {c.mobile}
                  </p>
                </div>
                {c.goldenCustomerCount > 0 && (
                  <span className="bg-yellow-50 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full">
                    ⭐ {c.goldenCustomerCount}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400">ওয়ালেট ব্যালেন্স</p>
                  <p className="font-bold text-emerald-600">
                    {formatAmount(c.walletBalance)}
                  </p>
                </div>
                <Link
                  href={`/admin/customers/${c.id}`}
                  className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-100 transition"
                >
                  বিস্তারিত →
                </Link>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">
            কোনো কাস্টমার পাওয়া যায়নি
          </p>
        )}
      </div>
    </div>
  );
}
