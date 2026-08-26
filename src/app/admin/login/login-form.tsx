"use client";

import { useActionState } from "react";
import { loginAdmin } from "@/app/admin/login/actions";

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, null);

  return (
    <div className="mx-auto grid w-full max-w-md gap-6 py-6">
      <div>
        <h1 className="font-serif text-4xl">Sign in</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Platform operators only. Guest bookings and the owner portal stay on their own pages.
        </p>
      </div>
      <form action={action} className="grid gap-4">
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-[var(--muted)]">Password</span>
          <input
            className="input"
            type="password"
            name="password"
            required
            autoComplete="current-password"
          />
        </label>
        {state?.message ? <p className="text-sm text-[var(--danger)]">{state.message}</p> : null}
        <button className="btn-primary" type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
