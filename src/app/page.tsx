import { DateSearchForm } from "@/components/date-search-form";
import { HomesMap } from "@/components/homes-map";
import {
  listAvailableProperties,
  listLiveProperties,
  listOccupiedPropertyIds,
  parseStayDates,
} from "@/lib/availability";
import { formatStayRange } from "@/lib/dates";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ checkIn?: string; checkOut?: string }>;
}) {
  const { checkIn, checkOut } = await searchParams;
  const { dates, error } = parseStayDates(checkIn, checkOut);
  const [homes, available, occupiedIds] = await Promise.all([
    listLiveProperties(),
    listAvailableProperties(dates),
    listOccupiedPropertyIds(dates),
  ]);
  const availableIds = new Set(available.map((home) => home.id));

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 px-5 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
            A little map of Bengaluru
          </p>
          <h1 className="font-serif text-3xl text-[var(--ink)] md:text-4xl">Walk the map. Pick a house.</h1>
        </div>
        {dates ? (
          <p className="text-sm text-[var(--muted)]">
            {formatStayRange(dates.checkIn, dates.checkOut)} · {available.length} of {homes.length} free
          </p>
        ) : (
          <p className="text-sm text-[var(--muted)]">Pick dates to see which houses are free.</p>
        )}
      </div>

      <DateSearchForm checkIn={checkIn} checkOut={checkOut} error={error} />

      {homes.length === 0 ? (
        <div className="rounded-2xl bg-[var(--paper)] p-8 text-[var(--muted)]">No homes are listed yet.</div>
      ) : (
        <HomesMap
          homes={homes.map((home) => ({
            id: home.id,
            name: home.name,
            city: home.city,
            propertyType: home.propertyType,
            basePricePerNight: home.basePricePerNight,
            maxGuests: home.maxGuests,
            bedrooms: home.bedrooms,
            amenities: home.amenities,
            available: dates ? availableIds.has(home.id) : true,
            occupied: dates ? occupiedIds.has(home.id) : false,
          }))}
          checkIn={checkIn}
          checkOut={checkOut}
          nights={dates?.nights}
        />
      )}
    </div>
  );
}
