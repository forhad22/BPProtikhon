"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Spinner from "@/components/Spinner";

export default function LoginPage() {
  const { login } = useAuth();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(mobile, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "লগইন ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary mb-4 shadow-lg">
            <span className="text-3xl">🛒</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">BazarProtikhon</h1>
          <p className="text-gray-500 mt-1">ক্যাশব্যাক লয়্যালটি সিস্টেম</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">লগইন করুন</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                মোবাইল নাম্বার
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition text-gray-800"
                placeholder="০১XXXXXXXXX"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                পাসওয়ার্ড
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition text-gray-800"
                placeholder="পাসওয়ার্ড দিন"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 gradient-primary text-white font-semibold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 shadow-md"
            >
              {loading ? <Spinner /> : "লগইন করুন"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            নতুন অ্যাকাউন্ট নেই?{" "}
            <Link
              href="/register"
              className="text-indigo-600 font-semibold hover:underline"
            >
              রেজিস্ট্রেশন করুন
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
