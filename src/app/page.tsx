import { DateSearchForm } from "@/components/date-search-form";
import { PropertyCard } from "@/components/property-card";
import { listAvailableProperties, parseStayDates } from "@/lib/availability";
import { formatStayRange } from "@/lib/dates";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ checkIn?: string; checkOut?: string }>;
}) {
  const { checkIn, checkOut } = await searchParams;
  const { dates, error } = parseStayDates(checkIn, checkOut);
  let properties: Awaited<ReturnType<typeof listAvailableProperties>> = [];
  let loadError: string | null = null;
  try {
    properties = await listAvailableProperties(dates);
  } catch (cause) {
    loadError = cause instanceof Error ? cause.message : "Could not load homes.";
  }

  return (
    <div>
      <section className="bg-[var(--ink)] text-[var(--paper)]">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-16 md:py-20">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--sand)]">
            Bengaluru and nearby
          </p>
          <h1 className="max-w-3xl font-serif text-4xl leading-tight md:text-6xl">
            Six homes. Pick dates. See what is free.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[var(--sand)] md:text-lg">
            A small booking portal for properties in Indiranagar, Whitefield,
            Sarjapur, Bannerghatta, Nandi Hills, and Ramanagara.
          </p>
          <DateSearchForm checkIn={checkIn} checkOut={checkOut} error={error} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-12">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-serif text-3xl text-[var(--ink)]">
            {dates
              ? `${properties.length} ${properties.length === 1 ? "home" : "homes"} available`
              : "All homes"}
          </h2>
          {dates ? (
            <p className="text-sm text-[var(--muted)]">
              {formatStayRange(dates.checkIn, dates.checkOut)} · {dates.nights}{" "}
              {dates.nights === 1 ? "night" : "nights"}
            </p>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              Add dates to hide homes that are already booked.
            </p>
          )}
        </div>

        {loadError ? (
          <div className="rounded-2xl bg-[var(--paper)] p-8 text-[var(--danger)]">
            Could not load homes. {loadError}
          </div>
        ) : properties.length === 0 ? (
          <div className="rounded-2xl bg-[var(--paper)] p-8 text-[var(--muted)]">
            No homes are free for those dates. Try a different range.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                nights={dates?.nights}
                checkIn={checkIn}
                checkOut={checkOut}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
