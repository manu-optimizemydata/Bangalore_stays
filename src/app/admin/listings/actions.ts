"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

function revalidateListings(id: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/listings");
  revalidatePath(`/admin/listings/${id}`);
  revalidatePath(`/properties/${id}`);
}

export async function updateListingStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const intent = String(formData.get("intent") ?? "");
  if (!id) {
    redirect("/admin/listings");
  }

  if (intent === "approve") {
    await prisma.property.update({
      where: { id },
      data: { listingStatus: "active", active: true },
    });
  } else if (intent === "reject") {
    await prisma.property.update({
      where: { id },
      data: { listingStatus: "rejected", active: false },
    });
  } else if (intent === "unpublish") {
    await prisma.property.update({
      where: { id },
      data: { active: false },
    });
  } else if (intent === "publish") {
    const property = await prisma.property.findUnique({ where: { id } });
    if (property?.listingStatus === "active") {
      await prisma.property.update({
        where: { id },
        data: { active: true },
      });
    }
  }

  revalidateListings(id);
  redirect(`/admin/listings/${id}`);
}
