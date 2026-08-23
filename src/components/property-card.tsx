import Link from "next/link";
import { formatInr } from "@/lib/money";
import type { Property } from "@/generated/prisma/client";

type PropertyCardProps = {
  property: Property;
  nights?: number;
  checkIn?: string;
  checkOut?: string;
};

export function PropertyCard({ property, nights, checkIn, checkOut }: PropertyCardProps) {
  const photo = property.photos[0];
  const search = new URLSearchParams();
  if (checkIn) search.set("checkIn", checkIn);
  if (checkOut) search.set("checkOut", checkOut);
  const href = `/properties/${property.id}${search.size ? `?${search}` : ""}`;

  return (
    <article className="overflow-hidden rounded-2xl bg-[var(--paper)] shadow-[0_10px_30px_rgba(47,36,22,0.06)]">
      <Link href={href} className="block">
        <div className="relative aspect-[4/3] bg-[var(--sand)]">
          {photo ? (
            // Local SVGs for now; swap to next/image when real photos are in storage.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={property.name} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="grid gap-3 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              {property.city}
            </p>
            <h2 className="mt-1 font-serif text-2xl text-[var(--ink)]">{property.name}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {property.maxGuests} guests · {property.bedrooms}{" "}
              {property.bedrooms === 1 ? "bedroom" : "bedrooms"}
            </p>
          </div>
          <p className="line-clamp-2 text-sm leading-6 text-[var(--muted)]">
            {property.description}
          </p>
          <ul className="flex flex-wrap gap-2">
            {property.amenities.slice(0, 4).map((amenity) => (
              <li
                key={amenity}
                className="rounded-full bg-[var(--sand)] px-2.5 py-1 text-xs text-[var(--ink)]"
              >
                {amenity}
              </li>
            ))}
          </ul>
          <div className="flex items-end justify-between pt-1">
            <p>
              <span className="font-semibold text-[var(--ink)]">
                {formatInr(property.basePricePerNight)}
              </span>
              <span className="text-sm text-[var(--muted)]"> / night</span>
            </p>
            {nights ? (
              <p className="text-sm text-[var(--muted)]">
                {formatInr(property.basePricePerNight * nights)} for {nights}{" "}
                {nights === 1 ? "night" : "nights"}
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
