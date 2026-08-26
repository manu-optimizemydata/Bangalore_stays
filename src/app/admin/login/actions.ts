"use server";

import { redirect } from "next/navigation";
import {
  adminPasswordMatches,
  createAdminSession,
  isAdminPasswordConfigured,
} from "@/lib/admin-auth";

export async function loginAdmin(_previous: { message: string } | null, formData: FormData) {
  if (!isAdminPasswordConfigured()) {
    return { message: "ADMIN_PASSWORD is not set on this server." };
  }

  const password = String(formData.get("password") ?? "");
  if (!adminPasswordMatches(password)) {
    return { message: "Password is wrong." };
  }

  await createAdminSession();
  redirect("/admin");
}
