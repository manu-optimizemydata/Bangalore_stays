import type {
  BookingStatus,
  ListingStatus,
  PayoutStatus,
  PropertyType,
} from "@/generated/prisma/client";

export const BANGALORE_AREA_CITIES = [
  "Bengaluru",
  "Indiranagar",
  "Whitefield",
  "Sarjapur",
  "Bannerghatta",
  "Electronic City",
  "Yelahanka",
  "Nandi Hills",
  "Ramanagara",
  "Kanakapura",
  "Jigani",
] as const;

export const PROPERTY_TYPES: { value: PropertyType; label: string; blurb: string }[] = [
  { value: "homestay", label: "Homestay", blurb: "A home you share or host yourself" },
  { value: "apartment", label: "Apartment", blurb: "A flat or serviced apartment" },
  { value: "bungalow", label: "Bungalow", blurb: "An independent house in the city" },
  { value: "villa", label: "Villa", blurb: "A larger home, often with a garden or pool" },
  { value: "cottage", label: "Cottage", blurb: "A small stay just outside the city" },
  { value: "farmstay", label: "Farmstay", blurb: "A farm or estate stay near Bengaluru" },
];

export const AMENITY_OPTIONS = [
  "Wi-Fi",
  "Kitchen",
  "Air conditioning",
  "Heating",
  "Washer",
  "Free parking",
  "Workspace",
  "TV",
  "Garden",
  "Pool",
  "BBQ",
  "Breakfast",
  "Hot water",
  "Power backup",
  "Pets allowed",
] as const;

export const PLATFORM_COMMISSION_RATE = 0.2;

export function splitNightlyAmount(rupees: number) {
  const commission = Math.round(rupees * PLATFORM_COMMISSION_RATE);
  return {
    guestPays: rupees,
    platformCommission: commission,
    ownerPayout: rupees - commission,
  };
}

export function listingStatusLabel(status: ListingStatus) {
  if (status === "pending_review") return "Under review";
  if (status === "rejected") return "Needs changes";
  return "Live";
}

export function bookingStatusLabel(status: BookingStatus) {
  if (status === "pending") return "Awaiting payment";
  if (status === "confirmed") return "Confirmed";
  if (status === "cancelled") return "Cancelled";
  return "Completed";
}

export function payoutStatusLabel(status: PayoutStatus) {
  return status === "paid" ? "Paid" : "Pending";
}

export function propertyTypeLabel(type: PropertyType) {
  return PROPERTY_TYPES.find((item) => item.value === type)?.label ?? type;
}
