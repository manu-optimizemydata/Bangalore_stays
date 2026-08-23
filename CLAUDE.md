# Travel Booking Portal — Project Brief

## What this is
A booking portal for **6 properties** located in and around **Bangalore, India**. Guests search, check availability, and book a property for a date range. The platform takes a **20% commission** on every booking; the property owner keeps 80%.

This is a small-scale, single-market MVP — not a multi-city, multi-vendor marketplace. Build accordingly: favor simple, correct, and maintainable over "scalable to millions."

---

## Tech stack (use this, don't substitute without asking)
- **Frontend:** Next.js (React) + Tailwind CSS
- **Backend/DB:** Postgres via Supabase (also used for auth + file storage for property photos)
- **ORM:** Prisma
- **Payments:** PhonePe Payment Gateway — Standard Checkout (redirect + webhook confirmation flow)
- **Hosting:** Vercel (app) + Supabase (DB/storage)
- **Currency:** INR only, for now

---

## Core data model (adjust only after discussing with me)
- **properties** — id, name, address, city (Bangalore-area), description, amenities, base_price_per_night (INR), photos, active flag
- **bookings** — id, property_id, guest info, check_in, check_out, status (pending / confirmed / cancelled / completed), total_amount
- **ledger** — id, booking_id, total_amount, platform_commission (20%), owner_payout (80%), currency (INR), payout_status (pending / paid), created_at
  - Ledger rows are **immutable** once a booking is confirmed. Corrections go in new rows, not edits to old ones.

### Non-negotiable rule: no double-booking
Availability must be enforced with a **Postgres date-range exclusion constraint** on the bookings table (per property_id). Do not rely on application-level checks alone — they race under concurrent requests.

---

## Payments: PhonePe specifics
- Guest pays **100%** of the booking amount via PhonePe Standard Checkout.
- PhonePe does **not** natively support marketplace-style payment splitting. Do not attempt to auto-split at the gateway.
- On payment success (via webhook, not just redirect callback — webhooks are the source of truth), write the ledger row and mark the booking `confirmed`.
- Owner payouts (the 80%) are tracked in the ledger as `pending` and settled **manually or via a separate scheduled job** — this is intentionally not automated yet.
- Refunds/cancellations: PhonePe refund flow needs to update both the booking status and the ledger row. **Do not guess the commission treatment on partial refunds or cancellations — ask me before implementing that logic.**

---

## How to work each session
1. **One feature per session.** Don't try to build the whole app in one prompt — scope tightly (e.g. "build the listing page" not "build the portal").
2. **Read before you write.** Check the current repo state and this file before making changes.
3. **Verify, don't assert.** Run the app or relevant tests locally and confirm behavior before saying something works.
4. **Leave notes.** At the end of a session, summarize what changed, what's left, and any assumptions you made — either as a commit message or an update to this file's "Session Log" section below.
5. **Flag ambiguity, don't silently guess** — especially around money (refunds, commission edge cases, currency handling). State your assumption and proceed if it's low-stakes; ask first if it touches payments or the ledger.

---

## Explicitly out of scope for now (don't build unless asked)
- Multi-city support / channel manager / OTA sync (Airbnb, Booking.com)
- Dynamic pricing
- Native mobile apps
- Automated owner payout splitting at the gateway level (e.g. Razorpay Route)

---

## Session Log
_(Agent: append a short entry here after each session — date, what you built, what's left, any open questions.)_

- **2026-08-23 — Listing page + data model.** Created the Next.js app, Prisma schema (`properties`, `bookings`, `ledger`), and a Postgres exclusion constraint so pending/confirmed stays cannot overlap on the same property. Checkout day is treated as free for the next guest (`daterange` `[)`). Ledger updates/deletes are blocked by a trigger. Seeded 6 placeholder Bangalore-area homes plus one confirmed booking on The Jacaranda House (10–15 Sep 2026) so date search can hide a listing. Built the guest listing page and a read-only property detail page. Local Docker Postgres stands in for Supabase until credentials exist. Amounts are whole INR rupees (not paise). Product name is a working title: "Bangalore Stays". Property names, addresses, and photos are placeholders — replace with real inventory. Next: booking form (no PhonePe yet), then payments.
