import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { listingStatusLabel, propertyTypeLabel } from "@/lib/listing";
import { formatInr } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import type { ListingStatus } from "@/generated/prisma/client";

export const metadata = {
  title: "Listings",
};

const FILTERS: { value: "all" | ListingStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending_review", label: "Under review" },
  { value: "active", label: "Live" },
  { value: "rejected", label: "Rejected" },
];

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const filter = FILTERS.some((item) => item.value === status)
    ? (status as "all" | ListingStatus)
    : "all";

  const properties = await prisma.property.findMany({
    where: filter === "all" ? undefined : { listingStatus: filter },
    include: { owner: { select: { fullName: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-serif text-4xl">Listings</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          New owner submissions stay hidden until you approve them.
        </p>
      </div>
      <nav className="flex flex-wrap gap-3 text-sm">
        {FILTERS.map((item) => (
          <Link
            key={item.value}
            href={item.value === "all" ? "/admin/listings" : `/admin/listings?status=${item.value}`}
            className={filter === item.value ? "text-[var(--accent)]" : "text-[var(--muted)]"}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {properties.length === 0 ? (
        <p className="rounded-2xl bg-[var(--paper)] p-6 text-[var(--muted)]">No listings in this view.</p>
      ) : (
        <div className="grid gap-3">
          {properties.map((property) => (
            <Link
              key={property.id}
              href={`/admin/listings/${property.id}`}
              className="grid gap-1 rounded-2xl bg-[var(--paper)] p-5 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                  {listingStatusLabel(property.listingStatus)}
                  {property.listingStatus === "active" && !property.active ? " · unpublished" : ""}
                </p>
                <h2 className="font-serif text-2xl">{property.name}</h2>
                <p className="text-sm text-[var(--muted)]">
                  {propertyTypeLabel(property.propertyType)} · {property.city} ·{" "}
                  {formatInr(property.basePricePerNight)} / night
                  {property.owner ? ` · ${property.owner.fullName}` : " · seeded home"}
                </p>
              </div>
              <span className="text-sm text-[var(--accent)]">Review</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
