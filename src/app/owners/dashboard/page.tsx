import { redirect } from "next/navigation";
import { logoutOwner } from "@/app/owners/logout/actions";
import { listingStatusLabel, propertyTypeLabel } from "@/lib/listing";
import { formatInr } from "@/lib/money";
import { getOwnerSession } from "@/lib/owner-auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Owner dashboard",
};

function maskAccount(value: string) {
  if (value.length <= 4) return value;
  return `${"•".repeat(Math.max(4, value.length - 4))}${value.slice(-4)}`;
}

export default async function OwnerDashboardPage() {
  const owner = await getOwnerSession();
  if (!owner) {
    redirect("/owners/login");
  }

  const record = await prisma.owner.findUnique({
    where: { id: owner.id },
    include: {
      properties: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!record) {
    redirect("/owners/login");
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 px-5 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Owner portal</p>
          <h1 className="mt-2 font-serif text-4xl">Hello, {record.fullName.split(" ")[0]}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">{record.email}</p>
        </div>
        <form action={logoutOwner}>
          <button type="submit" className="text-sm text-[var(--muted)]">
            Sign out
          </button>
        </form>
      </div>

      <section className="grid gap-4">
        <h2 className="font-serif text-2xl">Your listings</h2>

        {record.properties.length === 0 ? (
          <p className="rounded-2xl bg-[var(--paper)] p-6 text-[var(--muted)]">
            You have not submitted a home yet.
          </p>
        ) : (
          <div className="grid gap-4">
            {record.properties.map((property) => (
              <article
                key={property.id}
                className="grid gap-4 rounded-2xl bg-[var(--paper)] p-5 sm:grid-cols-[8rem_1fr] sm:items-center"
              >
                <div className="overflow-hidden rounded-xl bg-[var(--sand)]">
                  {property.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={property.photos[0]}
                      alt={property.name}
                      className="aspect-[4/3] h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="grid gap-1">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                    {listingStatusLabel(property.listingStatus)}
                  </p>
                  <h3 className="font-serif text-2xl">{property.name}</h3>
                  <p className="text-sm text-[var(--muted)]">
                    {propertyTypeLabel(property.propertyType)} · {property.city} ·{" "}
                    {formatInr(property.basePricePerNight)} / night
                  </p>
                  {property.listingStatus === "pending_review" ? (
                    <p className="pt-1 text-sm text-[var(--muted)]">
                      Guests cannot see this home yet. We will review the details and payout
                      information before it goes live.
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-[var(--paper)] p-6 text-sm text-[var(--muted)]">
        <h2 className="font-serif text-2xl text-[var(--ink)]">Payout account on file</h2>
        <p className="mt-3">
          {record.bankName} · {maskAccount(record.bankAccountNumber)} · {record.bankIfsc}
        </p>
        <p className="mt-2">
          Payouts are not automated. After a confirmed stay, the 80% owner share is marked pending
          in the ledger and settled separately.
        </p>
      </section>
    </div>
  );
}
