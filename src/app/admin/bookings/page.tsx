import Link from "next/link";
import { markBookingCompleted } from "@/app/admin/bookings/actions";
import { requireAdmin } from "@/lib/admin-auth";
import { parseDateOnly, formatStayRange, todayDateString } from "@/lib/dates";
import { bookingStatusLabel } from "@/lib/listing";
import { formatInr } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import type { BookingStatus } from "@/generated/prisma/client";

export const metadata = {
  title: "Bookings",
};

const FILTERS: { value: "all" | BookingStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Awaiting payment" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const filter = FILTERS.some((item) => item.value === status)
    ? (status as "all" | BookingStatus)
    : "all";
  const today = parseDateOnly(todayDateString());

  const bookings = await prisma.booking.findMany({
    where: filter === "all" ? undefined : { status: filter },
    include: {
      property: { select: { id: true, name: true, city: true } },
      ledger: { select: { id: true } },
    },
    orderBy: { checkIn: "desc" },
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-serif text-4xl">Bookings</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          You can mark a confirmed stay completed after checkout. Refunds and cancellations are not
          in this screen yet.
        </p>
      </div>
      <nav className="flex flex-wrap gap-3 text-sm">
        {FILTERS.map((item) => (
          <Link
            key={item.value}
            href={item.value === "all" ? "/admin/bookings" : `/admin/bookings?status=${item.value}`}
            className={filter === item.value ? "text-[var(--accent)]" : "text-[var(--muted)]"}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {bookings.length === 0 ? (
        <p className="rounded-2xl bg-[var(--paper)] p-6 text-[var(--muted)]">No bookings in this view.</p>
      ) : (
        <div className="grid gap-3">
          {bookings.map((booking) => {
            const canComplete =
              today !== null &&
              booking.status === "confirmed" &&
              booking.checkOut.getTime() <= today.getTime();

            return (
              <article key={booking.id} className="grid gap-3 rounded-2xl bg-[var(--paper)] p-5">
                <div className="sm:flex sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                      {bookingStatusLabel(booking.status)}
                      {booking.ledger.length === 0 ? " · no ledger row yet" : ""}
                    </p>
                    <h2 className="font-serif text-2xl">{booking.property.name}</h2>
                    <p className="text-sm text-[var(--muted)]">
                      {booking.property.city} · {formatStayRange(booking.checkIn, booking.checkOut)} ·{" "}
                      {formatInr(booking.totalAmount)}
                    </p>
                    <p className="mt-1 text-sm">
                      {booking.guestName} · {booking.guestEmail} · {booking.guestPhone}
                    </p>
                  </div>
                  <Link
                    href={`/admin/listings/${booking.property.id}`}
                    className="text-sm text-[var(--accent)]"
                  >
                    Listing
                  </Link>
                </div>
                {canComplete ? (
                  <form action={markBookingCompleted}>
                    <input type="hidden" name="id" value={booking.id} />
                    <button className="btn-secondary" type="submit">
                      Mark completed
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
