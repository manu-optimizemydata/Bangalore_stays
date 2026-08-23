export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--border)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-5 py-8 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
        <p>Bangalore Stays · bookings for a small set of homes</p>
        <p>
          <a href="/owners" className="hover:text-[var(--ink)]">
            List your home
          </a>
          {" · "}
          Prices in INR · checkout day is free for the next guest
        </p>
      </div>
    </footer>
  );
}
