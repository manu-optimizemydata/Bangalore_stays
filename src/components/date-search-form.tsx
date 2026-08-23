import { todayDateString } from "@/lib/dates";

type DateSearchFormProps = {
  checkIn?: string;
  checkOut?: string;
  error?: string | null;
};

export function DateSearchForm({ checkIn, checkOut, error }: DateSearchFormProps) {
  const minDate = todayDateString();

  return (
    <form
      action="/"
      method="get"
      className="grid gap-4 rounded-2xl bg-[var(--paper)] p-4 shadow-[0_18px_50px_rgba(47,36,22,0.08)] sm:grid-cols-[1fr_1fr_auto] sm:items-end"
    >
      <label className="grid gap-1 text-sm">
        <span className="font-medium text-[var(--muted)]">Check-in</span>
        <input
          type="date"
          name="checkIn"
          defaultValue={checkIn}
          min={minDate}
          className="h-12 rounded-xl border border-[var(--border)] bg-white px-3 text-[var(--ink)] outline-none focus:border-[var(--accent)]"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium text-[var(--muted)]">Check-out</span>
        <input
          type="date"
          name="checkOut"
          defaultValue={checkOut}
          min={checkIn || minDate}
          className="h-12 rounded-xl border border-[var(--border)] bg-white px-3 text-[var(--ink)] outline-none focus:border-[var(--accent)]"
        />
      </label>
      <button
        type="submit"
        className="h-12 rounded-xl bg-[var(--accent)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dark)]"
      >
        Show availability
      </button>
      {error ? (
        <p className="text-sm text-[var(--danger)] sm:col-span-3">{error}</p>
      ) : null}
    </form>
  );
}
