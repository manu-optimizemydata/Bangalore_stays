import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { listingStatusLabel } from "@/lib/listing";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Owners",
};

export default async function AdminOwnersPage() {
  await requireAdmin();
  const owners = await prisma.owner.findMany({
    include: {
      properties: {
        select: { id: true, name: true, listingStatus: true, active: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-serif text-4xl">Owners</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Contact and listing status. Bank details for a transfer are on the payouts page.
        </p>
      </div>
      {owners.length === 0 ? (
        <p className="rounded-2xl bg-[var(--paper)] p-6 text-[var(--muted)]">
          No owners have registered yet.
        </p>
      ) : (
        <div className="grid gap-3">
          {owners.map((owner) => (
            <article key={owner.id} className="grid gap-3 rounded-2xl bg-[var(--paper)] p-5">
              <div>
                <h2 className="font-serif text-2xl">{owner.fullName}</h2>
                <p className="text-sm text-[var(--muted)]">
                  {owner.email} · {owner.phone}
                </p>
              </div>
              {owner.properties.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">No listings.</p>
              ) : (
                <ul className="grid gap-1 text-sm">
                  {owner.properties.map((property) => (
                    <li key={property.id}>
                      <Link href={`/admin/listings/${property.id}`} className="text-[var(--accent)]">
                        {property.name}
                      </Link>
                      <span className="text-[var(--muted)]">
                        {" "}
                        · {listingStatusLabel(property.listingStatus)}
                        {property.listingStatus === "active" && !property.active
                          ? " · unpublished"
                          : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
