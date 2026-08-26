"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function markPayoutPaid(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    redirect("/admin/payouts");
  }

  const row = await prisma.ledger.findUnique({ where: { id } });
  if (row?.payoutStatus === "pending") {
    await prisma.ledger.update({
      where: { id },
      data: { payoutStatus: "paid" },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/payouts");
  redirect("/admin/payouts?status=paid");
}
