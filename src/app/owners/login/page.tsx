"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginOwner } from "@/app/owners/login/actions";

export default function OwnerLoginPage() {
  const [state, action, pending] = useActionState(loginOwner, null);

  return (
    <div className="mx-auto grid w-full max-w-md gap-6 px-5 py-16">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Owner portal</p>
        <h1 className="mt-3 font-serif text-4xl">Sign in</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Use the email you registered with. Guest bookings stay on the public site.
        </p>
      </div>
      <form action={action} className="grid gap-4">
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-[var(--muted)]">Email</span>
          <input className="input" type="email" name="email" required />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-[var(--muted)]">Password</span>
          <input className="input" type="password" name="password" required />
        </label>
        {state?.message ? <p className="text-sm text-[var(--danger)]">{state.message}</p> : null}
        <button className="btn-primary" type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="text-sm text-[var(--muted)]">
        New here?{" "}
        <Link href="/owners/register" className="text-[var(--accent)]">
          List your home
        </Link>
      </p>
    </div>
  );
}
