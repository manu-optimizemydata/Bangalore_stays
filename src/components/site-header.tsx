import Link from "next/link";
import { getOwnerSession } from "@/lib/owner-auth";

export async function SiteHeader() {
  const owner = await getOwnerSession();

  return (
    <header className="border-b border-[var(--border)] bg-[var(--paper)]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="font-serif text-xl tracking-tight text-[var(--ink)]">
          Bangalore Stays
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="hidden text-[var(--muted)] sm:inline">
            Homes
          </Link>
          {owner ? (
            <Link href="/owners/dashboard" className="text-[var(--accent)]">
              Owner dashboard
            </Link>
          ) : (
            <Link href="/owners" className="text-[var(--accent)]">
              List your home
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
