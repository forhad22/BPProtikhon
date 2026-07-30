import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    if (session.role === "admin") {
      redirect("/admin/dashboard");
    } else {
      redirect("/customer/dashboard");
    }
  }

  redirect("/login");
}
