import { AuthProvider } from "@/context/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 lg:ml-64 min-h-screen">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
