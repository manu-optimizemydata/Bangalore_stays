import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const properties = [
  {
    name: "The Jacaranda House",
    address: "12, 12th Main, HAL 2nd Stage, Indiranagar",
    city: "Bengaluru",
    description:
      "A restored 2-bedroom bungalow on a quiet Indiranagar lane. High ceilings, a wraparound verandah, and a small garden for morning coffee. Walking distance to 12th Main cafes.",
    amenities: ["Wi-Fi", "Kitchen", "Garden", "Workspace", "Free parking"],
    propertyType: "bungalow" as const,
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    pincode: "560008",
    houseRules: "No parties. No smoking indoors. Quiet after 10 pm.",
    basePricePerNight: 8500,
    photos: ["/properties/jacaranda.svg"],
  },
  {
    name: "Nandi Valley Cottage",
    address: "Nandi Hills Road, near Skandagiri trailhead",
    city: "Nandi Hills",
    description:
      "A one-bedroom stone cottage facing the Nandi valley. Best for a quiet weekend — sunrise from the deck, no traffic, and a short drive to the hills.",
    amenities: ["Wi-Fi", "Kitchen", "Heating", "Free parking"],
    propertyType: "cottage" as const,
    maxGuests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    pincode: "562103",
    houseRules: "Best for a quiet weekend. No loud music after 9 pm.",
    basePricePerNight: 6200,
    photos: ["/properties/nandi.svg"],
  },
  {
    name: "Bannerghatta Forest Villa",
    address: "Jigani Link Road, Bannerghatta",
    city: "Bannerghatta",
    description:
      "A 3-bedroom villa on the edge of the Bannerghatta reserve. Large living room, private lawn, and a covered sit-out. Suited to families who want space without leaving the city belt.",
    amenities: ["Wi-Fi", "Kitchen", "Garden", "BBQ", "Free parking", "Air conditioning"],
    propertyType: "villa" as const,
    maxGuests: 6,
    bedrooms: 3,
    beds: 3,
    bathrooms: 3,
    pincode: "560083",
    houseRules: "Families welcome. No fireworks near the reserve edge.",
    basePricePerNight: 12000,
    photos: ["/properties/bannerghatta.svg"],
  },
  {
    name: "Sarjapur Courtyard",
    address: "Doddakannelli, Sarjapur Road",
    city: "Sarjapur",
    description:
      "A modern courtyard villa with a plunge pool. Four bedrooms around a central court, built for groups who want to stay together after a Bengaluru work week.",
    amenities: ["Wi-Fi", "Kitchen", "Pool", "Air conditioning", "Free parking", "Workspace"],
    propertyType: "villa" as const,
    maxGuests: 8,
    bedrooms: 4,
    beds: 4,
    bathrooms: 4,
    pincode: "560035",
    houseRules: "Groups welcome. Pool use till 9 pm. No outside catering without notice.",
    basePricePerNight: 14500,
    photos: ["/properties/sarjapur.svg"],
  },
  {
    name: "Ramanagara Ridge Farmstay",
    address: "Near Ramadevara Betta, Ramanagara",
    city: "Ramanagara",
    description:
      "A working farmstay an hour from the city. Two bedrooms, home-cooked meals on request, and a ridge walk at dusk. Simple rooms, lots of sky.",
    amenities: ["Wi-Fi", "Breakfast", "Free parking", "Garden"],
    propertyType: "farmstay" as const,
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    pincode: "562159",
    houseRules: "Farm meals on request. Shoes off in the rooms.",
    basePricePerNight: 5500,
    photos: ["/properties/ramanagara.svg"],
  },
  {
    name: "Whitefield Garden Suite",
    address: "Immdihalli Road, Whitefield",
    city: "Whitefield",
    description:
      "A ground-floor garden suite in a quiet Whitefield lane. One bedroom, a sit-out onto the lawn, and a kitchen you can actually cook in. Easy cab ride to ITPL and Hope Farm.",
    amenities: ["Wi-Fi", "Kitchen", "Garden", "Workspace", "Free parking", "Air conditioning"],
    propertyType: "apartment" as const,
    maxGuests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    pincode: "560066",
    houseRules: "No parties. Quiet building. Check-in after 2 pm.",
    basePricePerNight: 7200,
    photos: ["/properties/whitefield.svg"],
  },
];

async function main() {
  // TRUNCATE does not fire the ledger immutability trigger.
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE ledger, bookings, properties, owners RESTART IDENTITY CASCADE',
  );

  const created = [];
  for (const property of properties) {
    created.push(await prisma.property.create({ data: property }));
  }

  const jacaranda = created.find((property) => property.name === "The Jacaranda House");
  if (!jacaranda) {
    throw new Error("Seed expected The Jacaranda House to exist");
  }

  // One confirmed stay so date search can hide a property.
  await prisma.booking.create({
    data: {
      propertyId: jacaranda.id,
      guestName: "Seed Guest",
      guestEmail: "seed@example.com",
      guestPhone: "+91 90000 00000",
      checkIn: new Date("2026-09-10"),
      checkOut: new Date("2026-09-15"),
      status: "confirmed",
      totalAmount: jacaranda.basePricePerNight * 5,
    },
  });

  console.log(`Seeded ${created.length} properties and 1 sample booking.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
