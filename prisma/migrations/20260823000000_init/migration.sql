-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('pending', 'paid');

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amenities" TEXT[],
    "base_price_per_night" INTEGER NOT NULL,
    "photos" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "guest_name" TEXT NOT NULL,
    "guest_email" TEXT NOT NULL,
    "guest_phone" TEXT NOT NULL,
    "check_in" DATE NOT NULL,
    "check_out" DATE NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'pending',
    "total_amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "platform_commission" INTEGER NOT NULL,
    "owner_payout" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "payout_status" "PayoutStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger" ADD CONSTRAINT "ledger_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Required so an exclusion constraint can mix equality on property_id with a range overlap.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Prevent two active bookings on the same property from overlapping.
-- [) means checkout day is free for the next guest.
-- Cancelled and completed stays are excluded so they do not block new bookings.
ALTER TABLE "bookings"
ADD CONSTRAINT "bookings_no_overlapping_dates"
EXCLUDE USING gist (
    property_id WITH =,
    daterange(check_in, check_out, '[)') WITH &&
)
WHERE (status IN ('pending', 'confirmed'));

-- Ledger rows are immutable after insert. Corrections must be new rows.
CREATE OR REPLACE FUNCTION forbid_ledger_mutation()
RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'ledger rows are immutable; insert a correction row instead';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ledger_immutable
BEFORE UPDATE OR DELETE ON ledger
FOR EACH ROW
EXECUTE FUNCTION forbid_ledger_mutation();
