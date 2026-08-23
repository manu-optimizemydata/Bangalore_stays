import { z } from "zod";
import { BANGALORE_AREA_CITIES, PROPERTY_TYPES } from "@/lib/listing";

const propertyTypeValues = PROPERTY_TYPES.map((item) => item.value) as [
  (typeof PROPERTY_TYPES)[number]["value"],
  ...(typeof PROPERTY_TYPES)[number]["value"][],
];

export const ownerRegistrationSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  email: z.string().trim().email("Enter a valid email."),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/\s+/g, ""))
    .refine((value) => /^(\+91)?[6-9]\d{9}$/.test(value), "Enter a 10-digit Indian mobile number."),
  password: z.string().min(8, "Use at least 8 characters."),
  propertyType: z.enum(propertyTypeValues),
  name: z.string().trim().min(3, "Give the home a title guests will recognise."),
  city: z.enum(BANGALORE_AREA_CITIES),
  address: z.string().trim().min(8, "Enter the full street address."),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a 6-digit pincode."),
  landmark: z.string().trim().optional(),
  maxGuests: z.coerce.number().int().min(1).max(20),
  bedrooms: z.coerce.number().int().min(0).max(12),
  beds: z.coerce.number().int().min(1).max(20),
  bathrooms: z.coerce.number().int().min(1).max(12),
  amenities: z.array(z.string()).min(1, "Pick at least one amenity."),
  description: z.string().trim().min(40, "Write at least a short paragraph about the home."),
  houseRules: z.string().trim().min(8, "Add a few house rules."),
  checkInTime: z.string().regex(/^\d{2}:\d{2}$/, "Choose a check-in time."),
  checkOutTime: z.string().regex(/^\d{2}:\d{2}$/, "Choose a check-out time."),
  minNights: z.coerce.number().int().min(1).max(30),
  photos: z.array(z.string().min(1)).min(1, "Add at least one photo."),
  basePricePerNight: z.coerce.number().int().min(500, "Nightly price must be at least ₹500."),
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Enter a valid PAN (ABCDE1234F)."),
  gstin: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .refine((value) => !value || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]{3}$/.test(value), {
      message: "Enter a valid GSTIN or leave this blank.",
    }),
  bankAccountName: z.string().trim().min(2, "Enter the account holder name."),
  bankAccountNumber: z.string().trim().regex(/^\d{9,18}$/, "Enter a 9–18 digit account number."),
  bankIfsc: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC."),
  bankName: z.string().trim().min(2, "Enter the bank name."),
});

export type OwnerRegistrationInput = z.infer<typeof ownerRegistrationSchema>;
