import Link from "next/link";
import { notFound } from "next/navigation";
import { getPropertyById, isPropertyAvailable, parseStayDates } from "@/lib/availability";
import { formatStayRange } from "@/lib/dates";
import { formatInr } from "@/lib/money";

export default async function PropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checkIn?: string; checkOut?: string }>;
}) {
  const { id } = await params;
  const { checkIn, checkOut } = await searchParams;
  const property = await getPropertyById(id);

  if (!property) {
    notFound();
  }

  const { dates, error } = parseStayDates(checkIn, checkOut);
  const available = dates ? await isPropertyAvailable(property.id, dates) : null;
  const stayTotal = dates ? property.basePricePerNight * dates.nights : null;

  return (
    <article className="mx-auto w-full max-w-6xl px-5 py-10">
      <Link href={checkIn && checkOut ? `/?checkIn=${checkIn}&checkOut=${checkOut}` : "/"} className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">
        ← All homes
      </Link>

      <div className={`mt-6 grid gap-3 ${property.photos.length > 1 ? "md:grid-cols-2" : ""}`}>
        {property.photos.slice(0, 2).map((photo) => (
          <div key={photo} className="overflow-hidden rounded-2xl bg-[var(--sand)]">
            {/* Local SVGs for now; swap to next/image when real photos are in storage. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt={property.name} className="aspect-[16/9] w-full object-cover" />
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
        <div className="grid gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              {property.city}
            </p>
            <h1 className="mt-2 font-serif text-4xl text-[var(--ink)]">{property.name}</h1>
            <p className="mt-2 text-[var(--muted)]">{property.address}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {property.maxGuests} guests · {property.bedrooms}{" "}
              {property.bedrooms === 1 ? "bedroom" : "bedrooms"} · {property.beds}{" "}
              {property.beds === 1 ? "bed" : "beds"} · {property.bathrooms}{" "}
              {property.bathrooms === 1 ? "bathroom" : "bathrooms"}
            </p>
          </div>
          <p className="max-w-2xl text-base leading-7 text-[var(--ink)]">{property.description}</p>
          {property.houseRules ? (
            <div>
              <h2 className="font-serif text-2xl">House rules</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Check-in {property.checkInTime} · check-out {property.checkOutTime} ·{" "}
                {property.minNights} night minimum. {property.houseRules}
              </p>
            </div>
          ) : null}
          <div>
            <h2 className="font-serif text-2xl">What is included</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {property.amenities.map((amenity) => (
                <li
                  key={amenity}
                  className="rounded-full bg-[var(--paper)] px-3 py-1.5 text-sm text-[var(--ink)]"
                >
                  {amenity}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="h-fit rounded-2xl bg-[var(--paper)] p-6 shadow-[0_12px_32px_rgba(47,36,22,0.06)]">
          <p>
            <span className="font-serif text-3xl">{formatInr(property.basePricePerNight)}</span>
            <span className="text-[var(--muted)]"> / night</span>
          </p>

          {error ? <p className="mt-4 text-sm text-[var(--danger)]">{error}</p> : null}

          {dates && available ? (
            <div className="mt-4 grid gap-2 text-sm">
              <p className="text-[var(--muted)]">{formatStayRange(dates.checkIn, dates.checkOut)}</p>
              <p>
                {dates.nights} {dates.nights === 1 ? "night" : "nights"} · {formatInr(stayTotal ?? 0)}
              </p>
              <p className="text-[var(--ink)]">This home is free for those dates.</p>
            </div>
          ) : null}

          {dates && available === false ? (
            <p className="mt-4 text-sm text-[var(--danger)]">
              Those dates are taken. Go back and try another range.
            </p>
          ) : null}

          {!dates ? (
            <p className="mt-4 text-sm text-[var(--muted)]">
              Choose dates on the listing page to check availability.
            </p>
          ) : null}

          <p className="mt-6 text-xs leading-5 text-[var(--muted)]">
            Booking and PhonePe checkout come next. This page is read-only for now.
          </p>
        </aside>
      </div>
    </article>
  );
}
