-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('villa', 'apartment', 'farmstay', 'cottage', 'bungalow', 'homestay');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('pending_review', 'active', 'rejected');

-- CreateTable
CREATE TABLE "owners" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "pan" TEXT NOT NULL,
    "gstin" TEXT,
    "bank_account_name" TEXT NOT NULL,
    "bank_account_number" TEXT NOT NULL,
    "bank_ifsc" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "owners_email_key" ON "owners"("email");

-- AlterTable
ALTER TABLE "properties"
    ADD COLUMN "owner_id" TEXT,
    ADD COLUMN "pincode" TEXT NOT NULL DEFAULT '',
    ADD COLUMN "landmark" TEXT,
    ADD COLUMN "house_rules" TEXT NOT NULL DEFAULT '',
    ADD COLUMN "property_type" "PropertyType" NOT NULL DEFAULT 'homestay',
    ADD COLUMN "listing_status" "ListingStatus" NOT NULL DEFAULT 'active',
    ADD COLUMN "max_guests" INTEGER NOT NULL DEFAULT 2,
    ADD COLUMN "bedrooms" INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN "beds" INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN "bathrooms" INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN "check_in_time" TEXT NOT NULL DEFAULT '14:00',
    ADD COLUMN "check_out_time" TEXT NOT NULL DEFAULT '11:00',
    ADD COLUMN "min_nights" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;
