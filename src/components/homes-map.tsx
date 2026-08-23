"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { PixelHouse } from "@/components/pixel-house";
import { formatInr } from "@/lib/money";
import { houseVariant, spotForProperty } from "@/lib/map-spots";
import type { PropertyType } from "@/generated/prisma/client";

export type MapHome = {
  id: string;
  name: string;
  city: string;
  propertyType: PropertyType;
  basePricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  amenities: string[];
  available: boolean;
  occupied: boolean;
};

const AMENITY_OFFSETS = [
  { dx: "-4.6rem", dy: "-0.35rem" },
  { dx: "1.7rem", dy: "-0.85rem" },
  { dx: "-4.9rem", dy: "2.1rem" },
  { dx: "1.55rem", dy: "2.35rem" },
] as const;

type HomesMapProps = {
  homes: MapHome[];
  checkIn?: string;
  checkOut?: string;
  nights?: number;
};

export function HomesMap({ homes, checkIn, checkOut, nights }: HomesMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(homes[0]?.id ?? null);
  const selected = homes.find((home) => home.id === selectedId) ?? homes[0];

  return (
    <div className="grid gap-4">
      <div className="pixel-frame overflow-hidden">
        <div className="relative aspect-[16/10] min-h-[34rem] w-full overflow-visible pixel-floor px-6 pb-12 pt-6 sm:min-h-[40rem]">
          <MapWorld />
          {homes.map((home, index) => {
            const spot = spotForProperty(home.city, index);
            const search = new URLSearchParams();
            if (checkIn) search.set("checkIn", checkIn);
            if (checkOut) search.set("checkOut", checkOut);
            const href = `/properties/${home.id}${search.size ? `?${search}` : ""}`;

            return (
              <div
                key={home.id}
                className={`absolute -translate-x-1/2 ${selectedId === home.id ? "z-20" : "z-10"}`}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                onMouseEnter={() => setSelectedId(home.id)}
              >
                <div className="group relative flex flex-col items-center">
                  <Link
                    href={href}
                    onClick={() => setSelectedId(home.id)}
                    className="relative flex flex-col items-center outline-none"
                  >
                    <span
                      className={`pixel-shadow transition-transform ${home.occupied ? "opacity-45 grayscale" : ""} ${
                        selectedId === home.id ? "scale-110" : "group-hover:scale-110"
                      }`}
                    >
                      <PixelHouse variant={houseVariant(home.propertyType)} booked={home.occupied} />
                    </span>
                    <span className="pixel-label mt-1 bg-[var(--paper)] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[var(--ink)]">
                      {home.city}
                    </span>
                  </Link>
                  <AmenityBurst amenities={home.amenities} />
                </div>
              </div>
            );
          })}

          <div className="speech pointer-events-none absolute left-3 top-3 max-w-[13rem] px-2 py-1 text-[11px] leading-4">
            Hover a house to see what’s inside.
          </div>
          <div className="absolute bottom-3 right-3 hidden text-[10px] uppercase tracking-[0.16em] text-[#2f2416]/70 sm:block">
            Bengaluru belt
          </div>
        </div>
      </div>

      {selected ? (
        <div className="pixel-frame grid gap-3 bg-[var(--paper)] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{selected.city}</p>
            <h2 className="font-serif text-2xl">{selected.name}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {selected.maxGuests} guests · {selected.bedrooms}{" "}
              {selected.bedrooms === 1 ? "bedroom" : "bedrooms"} · {formatInr(selected.basePricePerNight)} / night
              {nights ? ` · ${formatInr(selected.basePricePerNight * nights)} stay` : ""}
            </p>
            {selected.amenities.length > 0 ? (
              <p className="mt-2 text-sm text-[var(--ink)]">{selected.amenities.slice(0, 5).join(" · ")}</p>
            ) : null}
            {!selected.available ? (
              <p className="mt-1 text-sm text-[var(--danger)]">Booked for the dates you picked.</p>
            ) : null}
          </div>
          {selected.available ? (
            <Link
              href={`/properties/${selected.id}${checkIn && checkOut ? `?checkIn=${checkIn}&checkOut=${checkOut}` : ""}`}
              className="btn-primary inline-flex items-center justify-center"
            >
              Open this home
            </Link>
          ) : (
            <p className="text-sm text-[var(--muted)]">Try another house on the map.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function amenityLabel(amenity: string) {
  if (amenity === "Air conditioning") return "AC";
  if (amenity === "Free parking") return "Parking";
  if (amenity === "Power backup") return "Backup";
  if (amenity === "Pets allowed") return "Pets";
  return amenity;
}

function AmenityBurst({ amenities }: { amenities: string[] }) {
  return (
    <ul className="pointer-events-none absolute inset-0" aria-hidden>
      {amenities.slice(0, 4).map((amenity, index) => {
        const offset = AMENITY_OFFSETS[index];
        if (!offset) return null;

        return (
          <li
            key={amenity}
            className="amenity-pop pixel-label bg-[var(--paper)] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[var(--ink)]"
            style={
              {
                "--i": index,
                "--dx": offset.dx,
                "--dy": offset.dy,
              } as CSSProperties
            }
          >
            {amenityLabel(amenity)}
          </li>
        );
      })}
    </ul>
  );
}

function MapWorld() {
  return (
    <svg viewBox="0 0 160 120" className="pixel-sprite absolute inset-0 h-full w-full" aria-hidden>
      <rect width="160" height="120" fill="#7f9a64" />
      <rect x="0" y="0" width="160" height="28" fill="#6d8a56" />
      <polygon points="18,28 32,8 46,28" fill="#6d7f8d" />
      <polygon points="38,28 58,4 78,28" fill="#5c6e7a" />
      <polygon points="68,28 86,12 102,28" fill="#6d7f8d" />
      <rect x="70" y="34" width="8" height="52" fill="#c9b48a" />
      <rect x="22" y="56" width="96" height="8" fill="#c9b48a" />
      <rect x="22" y="56" width="8" height="40" fill="#c9b48a" />
      <rect x="96" y="34" width="8" height="54" fill="#c9b48a" />
      <rect x="108" y="50" width="22" height="16" fill="#d9c7a4" />
      <rect x="110" y="46" width="6" height="6" fill="#9a4a24" />
      <rect x="118" y="46" width="6" height="6" fill="#7c3919" />
      <rect x="126" y="52" width="4" height="4" fill="#8fb8c9" />
      <circle cx="22" cy="42" r="4" fill="#3f6b38" />
      <circle cx="118" cy="24" r="5" fill="#355c30" />
      <circle cx="132" cy="48" r="4" fill="#3f6b38" />
      <circle cx="14" cy="88" r="5" fill="#4d7a3c" />
      <circle cx="108" cy="92" r="4" fill="#355c30" />
      <ellipse cx="128" cy="86" rx="10" ry="5" fill="#6aa8c2" />
      <rect x="8" y="96" width="18" height="10" fill="#8fa36a" />
      <rect x="10" y="98" width="4" height="4" fill="#c9a36a" />
      <rect x="16" y="98" width="4" height="4" fill="#d8b56a" />
    </svg>
  );
}
