"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Spinner from "@/components/Spinner";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("পাসওয়ার্ড মিলছে না");
      return;
    }

    if (form.password.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          mobile: form.mobile,
          password: form.password,
          referralCode: form.referralCode || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
      } else {
        setSuccess(
          `রেজিস্ট্রেশন সফল! আপনার কাস্টমার আইডি: ${data.customerId}`
        );
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch {
      setError("রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary mb-4 shadow-lg">
            <span className="text-3xl">🛒</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">BazarProtikhon</h1>
          <p className="text-gray-500 mt-1">ক্যাশব্যাক লয়্যালটি সিস্টেম</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            নতুন অ্যাকাউন্ট খুলুন
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm font-medium">
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                পুরো নাম <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition"
                placeholder="আপনার নাম লিখুন"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                মোবাইল নাম্বার <span className="text-red-500">*</span>
              </label>
              <input
                name="mobile"
                type="tel"
                value={form.mobile}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition"
                placeholder="০১XXXXXXXXX"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                পাসওয়ার্ড <span className="text-red-500">*</span>
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition"
                placeholder="কমপক্ষে ৬ অক্ষর"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                পাসওয়ার্ড নিশ্চিত করুন <span className="text-red-500">*</span>
              </label>
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition"
                placeholder="পাসওয়ার্ড আবার লিখুন"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                রেফারেল কোড{" "}
                <span className="text-gray-400">(ঐচ্ছিক)</span>
              </label>
              <input
                name="referralCode"
                value={form.referralCode}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition uppercase"
                placeholder="BP-XXXXX"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 gradient-primary text-white font-semibold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 shadow-md mt-2"
            >
              {loading ? <Spinner /> : "রেজিস্ট্রেশন করুন"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
            <Link
              href="/login"
              className="text-indigo-600 font-semibold hover:underline"
            >
              লগইন করুন
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
