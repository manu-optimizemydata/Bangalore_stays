import { AdminNav } from "@/app/admin/admin-nav";
import { getAdminSession } from "@/lib/admin-auth";

export const metadata = {
  title: "Admin",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminSession().catch(() => null);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Platform admin</p>
      {admin ? <AdminNav /> : <div className="h-6" />}
      {children}
    </div>
  );
}
