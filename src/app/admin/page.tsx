import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { formatInr } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Overview",
};

export default async function AdminOverviewPage() {
  await requireAdmin();

  const [
    pendingListings,
    liveHomes,
    confirmedBookings,
    owners,
    pendingPayout,
    commission,
  ] = await Promise.all([
    prisma.property.count({ where: { listingStatus: "pending_review" } }),
    prisma.property.count({ where: { listingStatus: "active", active: true } }),
    prisma.booking.count({ where: { status: "confirmed" } }),
    prisma.owner.count(),
    prisma.ledger.aggregate({
      where: { payoutStatus: "pending" },
      _sum: { ownerPayout: true },
    }),
    prisma.ledger.aggregate({
      _sum: { platformCommission: true },
    }),
  ]);

  const cards = [
    {
      href: "/admin/listings?status=pending_review",
      label: "Waiting for review",
      value: String(pendingListings),
    },
    {
      href: "/admin/listings?status=active",
      label: "Live homes",
      value: String(liveHomes),
    },
    {
      href: "/admin/bookings?status=confirmed",
      label: "Confirmed stays",
      value: String(confirmedBookings),
    },
    {
      href: "/admin/payouts?status=pending",
      label: "Owner payouts pending",
      value: formatInr(pendingPayout._sum.ownerPayout ?? 0),
    },
    {
      href: "/admin/payouts",
      label: "Platform commission (20%)",
      value: formatInr(commission._sum.platformCommission ?? 0),
    },
    {
      href: "/admin/owners",
      label: "Registered owners",
      value: String(owners),
    },
  ];

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="font-serif text-4xl">Overview</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          Review new homes before guests see them, track stays, and mark the 80% owner share as
          paid after you settle it outside PhonePe. Cancellations and refunds are not handled here
          yet.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl bg-[var(--paper)] p-5 transition-colors hover:bg-[var(--sand)]"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{card.label}</p>
            <p className="mt-3 font-serif text-3xl">{card.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
