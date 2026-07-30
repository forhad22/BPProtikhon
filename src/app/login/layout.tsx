import { AuthProvider } from "@/context/AuthContext";
import { ReactNode } from "react";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
