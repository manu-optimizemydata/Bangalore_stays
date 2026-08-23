# Bangalore Stays

Booking portal for six homes in and around Bengaluru. Guests search dates and see what is free. The platform takes 20% of each confirmed booking; the owner keeps 80%.

## Local setup

1. Copy `.env.example` to `.env` (already done if you cloned this machine).
2. Start Postgres:

```bash
npm run db:up
```

3. Apply migrations, generate the Prisma client, and seed the six properties:

```bash
npx prisma migrate deploy
npx prisma generate
npm run db:seed
```

4. Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## This session

Listing page and property detail only. Booking, auth, PhonePe, and owner payouts are not built yet.

Local Postgres in Docker stands in for Supabase until those credentials are added.
