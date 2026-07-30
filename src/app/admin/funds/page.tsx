"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface FundTransaction {
  id: number;
  fundType: string;
  amount: string;
  cashbackTransactionId: number;
  balanceAfter: string;
  createdAt: string;
}

interface FundsData {
  funds: {
    incentiveFundBalance: string;
    companyFundBalance: string;
    unclaimedFundBalance: string;
  };
  history: {
    incentive: FundTransaction[];
    company: FundTransaction[];
    unclaimed: FundTransaction[];
  };
}

function formatAmount(amount: string | number) {
  return `৳${parseFloat(String(amount)).toLocaleString("bn-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function FundCard({
  label,
  balance,
  icon,
  color,
  history,
  activeTab,
  onTabClick,
  tabKey,
}: {
  label: string;
  balance: string;
  icon: string;
  color: string;
  history: FundTransaction[];
  activeTab: string;
  onTabClick: (key: string) => void;
  tabKey: string;
}) {
  return (
    <div className={`${color} rounded-2xl p-5 text-white shadow-lg cursor-pointer`}
      onClick={() => onTabClick(tabKey)}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{label}</p>
          <p className="text-2xl font-bold mt-1">{formatAmount(balance)}</p>
          <p className="text-xs opacity-70 mt-1">{history.length} টি ট্রানজেকশন</p>
        </div>
        <span className="text-4xl opacity-75">{icon}</span>
      </div>
      {activeTab === tabKey && (
        <div className="mt-2 text-xs font-medium opacity-90 flex items-center gap-1">
          <span>▼</span> হিস্ট্রি দেখানো হচ্ছে
        </div>
      )}
    </div>
  );
}

export default function FundsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<FundsData | null>(null);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState("incentive");

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetch("/api/funds")
        .then((r) => r.json())
        .then(setData)
        .finally(() => setFetching(false));
    }
  }, [user]);

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

  if (!data) return null;

  const fundLabels: Record<string, string> = {
    incentive: "ইনসেন্টিভ ফান্ড",
    company: "কোম্পানি ফান্ড",
    unclaimed: "আনক্লেইমড ফান্ড",
  };

  const activeHistory =
    activeTab === "incentive"
      ? data.history.incentive
      : activeTab === "company"
      ? data.history.company
      : data.history.unclaimed;

  return (
    <div className="p-4 lg:p-8 pt-20 lg:pt-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ফান্ড ম্যানেজমেন্ট</h1>
        <p className="text-gray-500 text-sm mt-1">
          সব ফান্ডের ব্যালেন্স ও হিস্ট্রি
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <FundCard
          label="ইনসেন্টিভ ফান্ড"
          balance={data.funds.incentiveFundBalance}
          icon="🎯"
          color="bg-gradient-to-br from-orange-400 to-rose-500"
          history={data.history.incentive}
          activeTab={activeTab}
          onTabClick={setActiveTab}
          tabKey="incentive"
        />
        <FundCard
          label="কোম্পানি ফান্ড"
          balance={data.funds.companyFundBalance}
          icon="🏢"
          color="bg-gradient-to-br from-blue-500 to-cyan-600"
          history={data.history.company}
          activeTab={activeTab}
          onTabClick={setActiveTab}
          tabKey="company"
        />
        <FundCard
          label="আনক্লেইমড ফান্ড"
          balance={data.funds.unclaimedFundBalance}
          icon="📦"
          color="bg-gradient-to-br from-gray-500 to-slate-600"
          history={data.history.unclaimed}
          activeTab={activeTab}
          onTabClick={setActiveTab}
          tabKey="unclaimed"
        />
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">
            {fundLabels[activeTab]} — ট্রানজেকশন হিস্ট্রি
          </h2>
          <span className="text-xs text-gray-400">সর্বশেষ ২০টি</span>
        </div>

        {activeHistory.length === 0 ? (
          <p className="text-center text-gray-400 py-12 text-sm">
            কোনো ট্রানজেকশন নেই
          </p>
        ) : (
          <div className="divide-y divide-gray-50">
            {activeHistory.map((tx) => (
              <div key={tx.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    ক্যাশব্যাক #{tx.cashbackTransactionId}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.createdAt).toLocaleString("bn-BD")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">
                    +{formatAmount(tx.amount)}
                  </p>
                  <p className="text-xs text-gray-400">
                    ব্যালেন্স: {formatAmount(tx.balanceAfter)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
