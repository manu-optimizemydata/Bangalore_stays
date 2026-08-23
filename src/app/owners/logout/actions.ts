"use server";

import { redirect } from "next/navigation";
import { clearOwnerSession } from "@/lib/owner-auth";

export async function logoutOwner() {
  await clearOwnerSession();
  redirect("/owners");
}
