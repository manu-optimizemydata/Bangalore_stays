"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { parseDateOnly, todayDateString } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

export async function markBookingCompleted(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    redirect("/admin/bookings");
  }

  const booking = await prisma.booking.findUnique({ where: { id } });
  const today = parseDateOnly(todayDateString());
  if (
    booking &&
    today &&
    booking.status === "confirmed" &&
    booking.checkOut.getTime() <= today.getTime()
  ) {
    await prisma.booking.update({
      where: { id },
      data: { status: "completed" },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  redirect("/admin/bookings");
}
