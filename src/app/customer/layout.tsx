import { AuthProvider } from "@/context/AuthContext";
import CustomerNav from "@/components/customer/CustomerNav";
import { ReactNode } from "react";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <CustomerNav />
        <main className="pb-20 lg:pb-0 lg:pt-0 pt-16">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
