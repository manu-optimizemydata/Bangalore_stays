"use server";

import { redirect } from "next/navigation";
import { createOwnerSession, ownerPasswordMatches } from "@/lib/owner-auth";
import { prisma } from "@/lib/prisma";

export async function loginOwner(_previous: { message: string } | null, formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const owner = await prisma.owner.findUnique({ where: { email } });
  if (!owner || !(await ownerPasswordMatches(password, owner.passwordHash))) {
    return { message: "Email or password is wrong." };
  }

  await createOwnerSession(owner.id);
  redirect("/owners/dashboard");
}
