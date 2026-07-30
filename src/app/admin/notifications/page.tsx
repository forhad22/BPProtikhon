"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Notification {
  id: number;
  customerId: number;
  milestone: string;
  rewardName: string;
  isRead: boolean;
  createdAt: string;
  customerName: string;
  customerCustomerId: string;
  customerMobile: string;
}

const milestoneIcons: Record<string, string> = {
  "20": "📱",
  "40": "🍚",
  "80": "❄️",
};

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [fetching, setFetching] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    if (user?.role === "admin") {
      fetchNotifications();
    }
  }, [user]);

  async function markAsRead(id: number) {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }

  async function markAllRead() {
    setMarkingAll(true);
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setMarkingAll(false);
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
    <div className="p-4 lg:p-8 pt-20 lg:pt-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">নোটিফিকেশন</h1>
          <p className="text-gray-500 text-sm mt-1">
            মাইলস্টোন অর্জনের তথ্য
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} অপঠিত
              </span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={markingAll}
            className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-100 transition"
          >
            {markingAll ? "..." : "সব পড়া হয়েছে"}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <span className="text-5xl">🔔</span>
          <p className="text-gray-400 mt-4">কোনো নোটিফিকেশন নেই</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`bg-white rounded-xl border p-5 transition ${
                notif.isRead
                  ? "border-gray-100 opacity-70"
                  : "border-indigo-200 shadow-sm"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                    notif.isRead ? "bg-gray-100" : "bg-yellow-50"
                  }`}
                >
                  {milestoneIcons[notif.milestone] || "🏆"}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-gray-800">
                        {notif.customerName}
                        <span className="ml-2 text-xs font-mono font-normal text-gray-400">
                          ({notif.customerCustomerId})
                        </span>
                      </p>
                      <p className="text-gray-600 text-sm mt-0.5">
                        <span className="font-semibold text-yellow-700">
                          {notif.milestone} গোল্ডেন কাউন্ট
                        </span>{" "}
                        অর্জন করেছেন!
                      </p>
                      <div className="mt-2 inline-flex items-center gap-2 bg-purple-50 text-purple-800 px-3 py-1.5 rounded-lg text-sm font-medium">
                        <span>🎁</span>
                        <span>
                          পুরস্কার: <strong>{notif.rewardName}</strong>
                        </span>
                      </div>
                    </div>
                    {!notif.isRead && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="text-xs text-indigo-600 hover:underline whitespace-nowrap"
                      >
                        পড়া হয়েছে
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notif.createdAt).toLocaleString("bn-BD")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
