"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Prisma } from "@/generated/prisma/client";
import { createOwnerSession, hashOwnerPassword } from "@/lib/owner-auth";
import { ownerRegistrationSchema } from "@/lib/owner-validation";
import { prisma } from "@/lib/prisma";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function formNumber(formData: FormData, key: string) {
  return Number(formString(formData, key));
}

async function savePhoto(file: File) {
  if (!IMAGE_TYPES.has(file.type)) {
    throw new Error("Photos must be JPG, PNG, or WebP.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Each photo must be under 5 MB.");
  }

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `${randomUUID()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${filename}`;
}

export async function registerOwner(formData: FormData) {
  const photoFiles = formData.getAll("photos").filter((item): item is File => item instanceof File && item.size > 0);
  const photoUrls = formString(formData, "photoUrls")
    .split(/\s+/)
    .map((value) => value.trim())
    .filter(Boolean);
  const photos: string[] = [...photoUrls];

  try {
    for (const file of photoFiles) {
      photos.push(await savePhoto(file));
    }
  } catch (error) {
    return { ok: false as const, message: error instanceof Error ? error.message : "Could not save photos." };
  }

  const parsed = ownerRegistrationSchema.safeParse({
    fullName: formString(formData, "fullName"),
    email: formString(formData, "email"),
    phone: formString(formData, "phone"),
    password: formString(formData, "password"),
    propertyType: formString(formData, "propertyType"),
    name: formString(formData, "name"),
    city: formString(formData, "city"),
    address: formString(formData, "address"),
    pincode: formString(formData, "pincode"),
    landmark: formString(formData, "landmark") || undefined,
    maxGuests: formNumber(formData, "maxGuests"),
    bedrooms: formNumber(formData, "bedrooms"),
    beds: formNumber(formData, "beds"),
    bathrooms: formNumber(formData, "bathrooms"),
    amenities: formData.getAll("amenities").filter((item): item is string => typeof item === "string"),
    description: formString(formData, "description"),
    houseRules: formString(formData, "houseRules"),
    checkInTime: formString(formData, "checkInTime"),
    checkOutTime: formString(formData, "checkOutTime"),
    minNights: formNumber(formData, "minNights"),
    photos,
    basePricePerNight: formNumber(formData, "basePricePerNight"),
    pan: formString(formData, "pan"),
    gstin: formString(formData, "gstin") || undefined,
    bankAccountName: formString(formData, "bankAccountName"),
    bankAccountNumber: formString(formData, "bankAccountNumber"),
    bankIfsc: formString(formData, "bankIfsc"),
    bankName: formString(formData, "bankName"),
  });

  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message ?? "Check the form and try again.",
    };
  }

  const data = parsed.data;

  try {
    const owner = await prisma.owner.create({
      data: {
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        passwordHash: await hashOwnerPassword(data.password),
        pan: data.pan,
        gstin: data.gstin,
        bankAccountName: data.bankAccountName,
        bankAccountNumber: data.bankAccountNumber,
        bankIfsc: data.bankIfsc,
        bankName: data.bankName,
        properties: {
          create: {
            name: data.name,
            address: data.address,
            city: data.city,
            pincode: data.pincode,
            landmark: data.landmark,
            description: data.description,
            houseRules: data.houseRules,
            amenities: data.amenities,
            propertyType: data.propertyType,
            listingStatus: "pending_review",
            maxGuests: data.maxGuests,
            bedrooms: data.bedrooms,
            beds: data.beds,
            bathrooms: data.bathrooms,
            checkInTime: data.checkInTime,
            checkOutTime: data.checkOutTime,
            minNights: data.minNights,
            basePricePerNight: data.basePricePerNight,
            photos: data.photos,
            active: false,
          },
        },
      },
    });

    await createOwnerSession(owner.id);
    return { ok: true as const };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false as const, message: "An owner account already exists for that email." };
    }
    console.error("Owner registration failed:", error);
    return { ok: false as const, message: "Could not save the listing. Try again." };
  }
}
