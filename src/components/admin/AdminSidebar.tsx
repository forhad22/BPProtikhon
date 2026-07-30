"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/admin/dashboard", icon: "📊", label: "ড্যাশবোর্ড" },
  { href: "/admin/cashback", icon: "💰", label: "ক্যাশব্যাক এন্ট্রি" },
  { href: "/admin/customers", icon: "👥", label: "কাস্টমার তালিকা" },
  { href: "/admin/notifications", icon: "🔔", label: "নোটিফিকেশন" },
  { href: "/admin/funds", icon: "🏦", label: "ফান্ড ম্যানেজমেন্ট" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUnread() {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadCount ?? 0);
        }
      } catch {}
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-indigo-700">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛒</span>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">
              BazarProtikhon
            </h1>
            <p className="text-indigo-300 text-xs">অ্যাডমিন প্যানেল</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium text-sm ${
                isActive
                  ? "bg-white text-indigo-700 shadow-md"
                  : "text-indigo-100 hover:bg-indigo-700"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
              {item.href === "/admin/notifications" && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="p-4 border-t border-indigo-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-indigo-400 rounded-full flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0) || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.name || "অ্যাডমিন"}
            </p>
            <p className="text-indigo-300 text-xs">অ্যাডমিন</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full py-2 px-3 bg-indigo-700 hover:bg-indigo-600 text-white text-sm rounded-lg transition"
        >
          লগআউট
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-indigo-800 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛒</span>
          <span className="text-white font-bold">BazarProtikhon</span>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
              {unreadCount}
            </span>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white text-2xl"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-indigo-800 transform transition-transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-indigo-800 flex-col z-20">
        <SidebarContent />
      </div>
    </>
  );
}
