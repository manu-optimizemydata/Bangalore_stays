import Link from "next/link";
import { markPayoutPaid } from "@/app/admin/payouts/actions";
import { requireAdmin } from "@/lib/admin-auth";
import { formatStayRange } from "@/lib/dates";
import { payoutStatusLabel } from "@/lib/listing";
import { formatInr } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import type { PayoutStatus } from "@/generated/prisma/client";

export const metadata = {
  title: "Payouts",
};

const FILTERS: { value: "all" | PayoutStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
];

export default async function AdminPayoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const filter = FILTERS.some((item) => item.value === status)
    ? (status as "all" | PayoutStatus)
    : "all";

  const rows = await prisma.ledger.findMany({
    where: filter === "all" ? undefined : { payoutStatus: filter },
    include: {
      booking: {
        include: {
          property: {
            include: {
              owner: {
                select: {
                  fullName: true,
                  email: true,
                  bankName: true,
                  bankAccountName: true,
                  bankAccountNumber: true,
                  bankIfsc: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingTotal = rows
    .filter((row) => row.payoutStatus === "pending")
    .reduce((sum, row) => sum + row.ownerPayout, 0);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-serif text-4xl">Payouts</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          Guests pay 100% on PhonePe. After a payment is confirmed, the 80% owner share sits here as
          pending until you transfer it from the bank details below. Amounts on a ledger row cannot
          be edited.
        </p>
        {filter !== "paid" ? (
          <p className="mt-2 text-sm text-[var(--ink)]">
            Pending in this list: {formatInr(pendingTotal)}
          </p>
        ) : null}
      </div>
      <nav className="flex flex-wrap gap-3 text-sm">
        {FILTERS.map((item) => (
          <Link
            key={item.value}
            href={item.value === "all" ? "/admin/payouts" : `/admin/payouts?status=${item.value}`}
            className={filter === item.value ? "text-[var(--accent)]" : "text-[var(--muted)]"}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {rows.length === 0 ? (
        <p className="rounded-2xl bg-[var(--paper)] p-6 text-[var(--muted)]">
          No ledger rows yet. They are created when a booking payment is confirmed.
        </p>
      ) : (
        <div className="grid gap-3">
          {rows.map((row) => {
            const owner = row.booking.property.owner;
            return (
              <article key={row.id} className="grid gap-3 rounded-2xl bg-[var(--paper)] p-5">
                <div className="sm:flex sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                      {payoutStatusLabel(row.payoutStatus)} · {row.currency}
                    </p>
                    <h2 className="font-serif text-2xl">{row.booking.property.name}</h2>
                    <p className="text-sm text-[var(--muted)]">
                      {formatStayRange(row.booking.checkIn, row.booking.checkOut)} · guest paid{" "}
                      {formatInr(row.totalAmount)} · commission {formatInr(row.platformCommission)} ·
                      owner {formatInr(row.ownerPayout)}
                    </p>
                    {owner ? (
                      <p className="mt-2 text-sm">
                        Pay {owner.bankAccountName} · {owner.bankName} · {owner.bankAccountNumber} ·{" "}
                        {owner.bankIfsc}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        No owner bank details on this home.
                      </p>
                    )}
                  </div>
                  <Link href={`/admin/bookings`} className="text-sm text-[var(--accent)]">
                    Bookings
                  </Link>
                </div>
                {row.payoutStatus === "pending" ? (
                  <form action={markPayoutPaid}>
                    <input type="hidden" name="id" value={row.id} />
                    <button className="btn-primary" type="submit">
                      Mark owner share paid
                    </button>
                  </form>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
