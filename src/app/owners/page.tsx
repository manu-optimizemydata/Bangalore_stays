import Link from "next/link";
import { getOwnerSession } from "@/lib/owner-auth";

export const metadata = {
  title: "List your home",
};

export default async function OwnersLandingPage() {
  const owner = await getOwnerSession();

  return (
    <div>
      <section className="bg-[var(--ink)] text-[var(--paper)]">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-16 md:py-20">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--sand)]">Owner portal</p>
          <h1 className="max-w-3xl font-serif text-4xl leading-tight md:text-6xl">
            List your Bengaluru home. We handle the guests.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[var(--sand)] md:text-lg">
            The same path hosts already know from Airbnb: who you are, what the home is, photos,
            a nightly price, then payout details. This is a small Bengaluru-only set of homes, so
            every listing is reviewed before it goes live.
          </p>
          <div className="flex flex-wrap gap-3">
            {owner ? (
              <Link href="/owners/dashboard" className="btn-primary inline-flex items-center">
                Go to your dashboard
              </Link>
            ) : (
              <>
                <Link href="/owners/register" className="btn-primary inline-flex items-center">
                  Start listing
                </Link>
                <Link
                  href="/owners/login"
                  className="inline-flex h-12 items-center rounded-xl border border-[var(--sand)]/30 px-6 text-sm"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-14 md:grid-cols-3">
        {[
          {
            title: "Tell us about the home",
            body: "Type, area, capacity, amenities, and house rules — the same blocks a guest needs before they book.",
          },
          {
            title: "Set a nightly price",
            body: "Price in INR. Guests pay 100%. You keep 80% after a confirmed stay; we keep 20%. Payouts are still manual.",
          },
          {
            title: "We review, then it goes live",
            body: "New homes stay hidden from guests until they are approved. This is a curated list, not an open marketplace.",
          },
        ].map((item) => (
          <article key={item.title} className="rounded-2xl bg-[var(--paper)] p-6">
            <h2 className="font-serif text-2xl">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
