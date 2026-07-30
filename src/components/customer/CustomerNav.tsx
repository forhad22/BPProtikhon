"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/customer/dashboard", icon: "💎", label: "হোম" },
  { href: "/customer/wallet", icon: "👛", label: "ওয়ালেট" },
  { href: "/customer/referrals", icon: "📣", label: "রেফার" },
  { href: "/customer/profile", icon: "👤", label: "প্রোফাইল" },
];

export default function CustomerNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Desktop Top Navbar */}
      <header className="hidden lg:flex fixed top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm h-16 items-center px-8 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white text-xl shadow-md">
            🛒
          </div>
          <div>
            <span className="font-extrabold text-slate-800 text-lg tracking-tight">Bazar</span>
            <span className="font-medium text-indigo-600 text-lg">Protikhon</span>
          </div>
        </div>
        
        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800">{user?.name}</p>
            <p className="text-xs font-semibold font-mono text-indigo-500 bg-indigo-50/50 px-2 py-0.5 rounded mt-0.5">
              {user?.customerId}
            </p>
          </div>
          <button
            onClick={logout}
            className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300"
          >
            লগআউট
          </button>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-indigo-950 px-4 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛒</span>
          <span className="text-white font-black tracking-wide">BazarProtikhon</span>
        </div>
        <div className="text-right">
          <p className="text-white text-sm font-bold">{user?.name}</p>
          <p className="text-indigo-300 text-xs font-mono font-medium">{user?.customerId}</p>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-slate-100 flex shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-3 text-xs font-bold transition-all ${
                isActive ? "text-indigo-600" : "text-slate-400"
              }`}
            >
              <span className={`text-xl mb-1 transition-transform duration-300 ${isActive ? "scale-110" : "scale-100"}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
