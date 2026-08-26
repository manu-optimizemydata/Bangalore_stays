import Link from "next/link";
import { notFound } from "next/navigation";
import { updateListingStatus } from "@/app/admin/listings/actions";
import { requireAdmin } from "@/lib/admin-auth";
import { listingStatusLabel, propertyTypeLabel } from "@/lib/listing";
import { formatInr } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Listing",
};

export default async function AdminListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id },
    include: { owner: true },
  });

  if (!property) {
    notFound();
  }

  return (
    <div className="grid gap-8">
      <div>
        <Link href="/admin/listings" className="text-sm text-[var(--muted)]">
          ← All listings
        </Link>
        <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          {listingStatusLabel(property.listingStatus)}
          {property.listingStatus === "active" && !property.active ? " · unpublished" : ""}
        </p>
        <h1 className="mt-2 font-serif text-4xl">{property.name}</h1>
        <p className="mt-2 text-[var(--muted)]">
          {propertyTypeLabel(property.propertyType)} · {property.city} · {property.address}
        </p>
      </div>

      {property.photos.length > 0 ? (
        <div className={`grid gap-3 ${property.photos.length > 1 ? "md:grid-cols-2" : ""}`}>
          {property.photos.slice(0, 4).map((photo) => (
            <div key={photo} className="overflow-hidden rounded-2xl bg-[var(--sand)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="" className="aspect-[16/9] w-full object-cover" />
            </div>
          ))}
        </div>
      ) : null}

      <section className="grid gap-4 rounded-2xl bg-[var(--paper)] p-6">
        <h2 className="font-serif text-2xl">Stay details</h2>
        <p className="text-sm text-[var(--muted)]">
          {property.maxGuests} guests · {property.bedrooms} bedrooms · {property.beds} beds ·{" "}
          {property.bathrooms} bathrooms · {formatInr(property.basePricePerNight)} / night ·{" "}
          {property.minNights} night minimum
        </p>
        <p className="leading-7">{property.description}</p>
        {property.houseRules ? (
          <p className="text-sm text-[var(--muted)]">
            Check-in {property.checkInTime} · check-out {property.checkOutTime}. {property.houseRules}
          </p>
        ) : null}
        {property.amenities.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {property.amenities.map((amenity) => (
              <li key={amenity} className="rounded-full bg-[var(--sand)] px-3 py-1.5 text-sm">
                {amenity}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="grid gap-3 rounded-2xl bg-[var(--paper)] p-6">
        <h2 className="font-serif text-2xl">Owner</h2>
        {property.owner ? (
          <div className="grid gap-1 text-sm">
            <p>
              {property.owner.fullName} · {property.owner.email} · {property.owner.phone}
            </p>
            <p className="text-[var(--muted)]">
              PAN {property.owner.pan}
              {property.owner.gstin ? ` · GSTIN ${property.owner.gstin}` : ""}
            </p>
            <p className="text-[var(--muted)]">
              {property.owner.bankName} · {property.owner.bankAccountName} ·{" "}
              {property.owner.bankAccountNumber} · {property.owner.bankIfsc}
            </p>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            This home was seeded without an owner account.
          </p>
        )}
      </section>

      <section className="flex flex-wrap gap-3">
        {property.listingStatus !== "active" ? (
          <form action={updateListingStatus}>
            <input type="hidden" name="id" value={property.id} />
            <input type="hidden" name="intent" value="approve" />
            <button className="btn-primary" type="submit">
              Approve and publish
            </button>
          </form>
        ) : null}
        {property.listingStatus === "active" && property.active ? (
          <form action={updateListingStatus}>
            <input type="hidden" name="id" value={property.id} />
            <input type="hidden" name="intent" value="unpublish" />
            <button className="btn-secondary" type="submit">
              Unpublish
            </button>
          </form>
        ) : null}
        {property.listingStatus === "active" && !property.active ? (
          <form action={updateListingStatus}>
            <input type="hidden" name="id" value={property.id} />
            <input type="hidden" name="intent" value="publish" />
            <button className="btn-primary" type="submit">
              Publish again
            </button>
          </form>
        ) : null}
        {property.listingStatus !== "rejected" ? (
          <form action={updateListingStatus}>
            <input type="hidden" name="id" value={property.id} />
            <input type="hidden" name="intent" value="reject" />
            <button className="btn-secondary" type="submit">
              Reject
            </button>
          </form>
        ) : null}
      </section>
    </div>
  );
}
