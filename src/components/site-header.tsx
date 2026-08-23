import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--paper)]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="font-serif text-xl tracking-tight text-[var(--ink)]">
          Bangalore Stays
        </Link>
        <p className="hidden text-sm text-[var(--muted)] sm:block">
          Six homes in and around Bengaluru
        </p>
      </div>
    </header>
  );
}
