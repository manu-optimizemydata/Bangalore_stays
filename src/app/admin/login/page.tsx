import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/app/admin/login/login-form";
import { getAdminSession } from "@/lib/admin-auth";

export const metadata = {
  title: "Admin sign in",
};

export default async function AdminLoginPage() {
  const admin = await getAdminSession().catch(() => null);
  if (admin) {
    redirect("/admin");
  }

  return <AdminLoginForm />;
}
