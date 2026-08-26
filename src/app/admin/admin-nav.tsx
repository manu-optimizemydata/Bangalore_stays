"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAdmin } from "@/app/admin/logout/actions";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/payouts", label: "Payouts" },
  { href: "/admin/owners", label: "Owners" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="mb-8 mt-4 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
      <nav className="flex flex-wrap gap-3 text-sm">
        {LINKS.map((link) => {
          const active =
            link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                active ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--ink)]"
              }
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <form action={logoutAdmin}>
        <button type="submit" className="text-sm text-[var(--muted)]">
          Sign out
        </button>
      </form>
    </div>
  );
}
