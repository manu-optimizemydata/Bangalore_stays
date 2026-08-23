import { nightsBetween, parseDateOnly, todayDateString } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@/generated/prisma/client";

const BLOCKING_STATUSES: BookingStatus[] = ["pending", "confirmed"];

export type StayDates = {
  checkIn: Date;
  checkOut: Date;
  nights: number;
};

export function parseStayDates(checkInValue?: string, checkOutValue?: string) {
  const checkIn = parseDateOnly(checkInValue);
  const checkOut = parseDateOnly(checkOutValue);

  if (!checkIn && !checkOut) {
    return { dates: null, error: null };
  }

  if (!checkIn || !checkOut) {
    return { dates: null, error: "Choose both a check-in and a check-out date." };
  }

  const nights = nightsBetween(checkIn, checkOut);
  if (nights < 1) {
    return { dates: null, error: "Check-out must be after check-in." };
  }

  return { dates: { checkIn, checkOut, nights } satisfies StayDates, error: null };
}

export function overlappingBookingFilter(dates: StayDates) {
  return {
    status: { in: BLOCKING_STATUSES },
    checkIn: { lt: dates.checkOut },
    checkOut: { gt: dates.checkIn },
  };
}

export async function listLiveProperties() {
  return prisma.property.findMany({
    where: { active: true, listingStatus: "active" },
    orderBy: { basePricePerNight: "asc" },
  });
}

export async function listAvailableProperties(dates: StayDates | null) {
  return prisma.property.findMany({
    where: {
      active: true,
      listingStatus: "active",
      ...(dates
        ? {
            bookings: {
              none: overlappingBookingFilter(dates),
            },
          }
        : {}),
    },
    orderBy: { basePricePerNight: "asc" },
  });
}

export async function listOccupiedPropertyIds(dates: StayDates | null) {
  const today = parseDateOnly(todayDateString());
  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: BLOCKING_STATUSES },
      ...(dates
        ? {
            checkIn: { lt: dates.checkOut },
            checkOut: { gt: dates.checkIn },
          }
        : today
          ? { checkOut: { gt: today } }
          : {}),
    },
    select: { propertyId: true },
  });

  return new Set(bookings.map((booking) => booking.propertyId));
}

export async function getPropertyById(id: string) {
  return prisma.property.findFirst({
    where: { id, active: true, listingStatus: "active" },
  });
}

export async function isPropertyAvailable(propertyId: string, dates: StayDates) {
  const clash = await prisma.booking.findFirst({
    where: {
      propertyId,
      ...overlappingBookingFilter(dates),
    },
    select: { id: true },
  });

  return clash === null;
}
