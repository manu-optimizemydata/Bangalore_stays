"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { registerOwner } from "@/app/owners/register/actions";
import {
  AMENITY_OPTIONS,
  BANGALORE_AREA_CITIES,
  PROPERTY_TYPES,
  splitNightlyAmount,
} from "@/lib/listing";
import { formatInr } from "@/lib/money";
import { ownerRegistrationSchema } from "@/lib/owner-validation";
import type { PropertyType } from "@/generated/prisma/client";

const STEPS = [
  { title: "About you", hint: "The same first step hosts see on Airbnb — who is listing." },
  { title: "The home", hint: "Type and where it is, limited to the Bengaluru belt." },
  { title: "Capacity", hint: "Guests, rooms, and what the home offers." },
  { title: "The story", hint: "Description, house rules, and stay timings." },
  { title: "Photos", hint: "At least one clear photo. More is better." },
  { title: "Price", hint: "Nightly rate in INR. The 20% platform share is shown, not taken yet." },
  { title: "Payouts", hint: "PAN and bank details for a later manual payout." },
  { title: "Review", hint: "Check everything before you send it in." },
];

type Draft = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  propertyType: PropertyType;
  name: string;
  city: (typeof BANGALORE_AREA_CITIES)[number];
  address: string;
  pincode: string;
  landmark: string;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  description: string;
  houseRules: string;
  checkInTime: string;
  checkOutTime: string;
  minNights: number;
  photos: File[];
  photoUrls: string;
  basePricePerNight: string;
  pan: string;
  gstin: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankName: string;
};

const initialDraft: Draft = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  propertyType: "homestay",
  name: "",
  city: "Bengaluru",
  address: "",
  pincode: "",
  landmark: "",
  maxGuests: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  amenities: [],
  description: "",
  houseRules: "No parties. No smoking indoors. Quiet after 10 pm.",
  checkInTime: "14:00",
  checkOutTime: "11:00",
  minNights: 1,
  photos: [],
  photoUrls: "",
  basePricePerNight: "",
  pan: "",
  gstin: "",
  bankAccountName: "",
  bankAccountNumber: "",
  bankIfsc: "",
  bankName: "",
};

function stepFields(step: number): (keyof Draft)[] {
  if (step === 0) return ["fullName", "email", "phone", "password"];
  if (step === 1) return ["propertyType", "name", "city", "address", "pincode", "landmark"];
  if (step === 2) return ["maxGuests", "bedrooms", "beds", "bathrooms", "amenities"];
  if (step === 3) return ["description", "houseRules", "checkInTime", "checkOutTime", "minNights"];
  if (step === 4) return ["photos", "photoUrls"];
  if (step === 5) return ["basePricePerNight"];
  if (step === 6) {
    return ["pan", "gstin", "bankAccountName", "bankAccountNumber", "bankIfsc", "bankName"];
  }
  return [];
}

export function RegisterWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const price = Number(draft.basePricePerNight);
  const split = Number.isFinite(price) && price > 0 ? splitNightlyAmount(price) : null;
  const progress = ((step + 1) / STEPS.length) * 100;

  const photoUrls = useMemo(
    () => draft.photos.map((file) => URL.createObjectURL(file)),
    [draft.photos],
  );

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function validateStep() {
    const parsed = ownerRegistrationSchema.safeParse({
      ...draft,
      landmark: draft.landmark || undefined,
      gstin: draft.gstin || undefined,
      photos: [
        ...draft.photos.map((file) => file.name),
        ...draft.photoUrls.split(/\s+/).filter(Boolean),
      ],
      basePricePerNight: draft.basePricePerNight || 0,
    });

    if (parsed.success) return true;

    const keys = new Set(stepFields(step));
    const issue = parsed.error.issues.find((item) => keys.has(String(item.path[0]) as keyof Draft));
    if (issue) {
      setError(issue.message);
      return false;
    }
    return true;
  }

  async function goNext() {
    if (!validateStep()) return;
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  async function submit() {
    if (!validateStep()) return;
    setPending(true);
    setError(null);

    const formData = new FormData();
    formData.set("fullName", draft.fullName);
    formData.set("email", draft.email);
    formData.set("phone", draft.phone);
    formData.set("password", draft.password);
    formData.set("propertyType", draft.propertyType);
    formData.set("name", draft.name);
    formData.set("city", draft.city);
    formData.set("address", draft.address);
    formData.set("pincode", draft.pincode);
    formData.set("landmark", draft.landmark);
    formData.set("maxGuests", String(draft.maxGuests));
    formData.set("bedrooms", String(draft.bedrooms));
    formData.set("beds", String(draft.beds));
    formData.set("bathrooms", String(draft.bathrooms));
    draft.amenities.forEach((amenity) => formData.append("amenities", amenity));
    formData.set("description", draft.description);
    formData.set("houseRules", draft.houseRules);
    formData.set("checkInTime", draft.checkInTime);
    formData.set("checkOutTime", draft.checkOutTime);
    formData.set("minNights", String(draft.minNights));
    draft.photos.forEach((file) => formData.append("photos", file));
    formData.set("photoUrls", draft.photoUrls);
    formData.set("basePricePerNight", draft.basePricePerNight);
    formData.set("pan", draft.pan);
    formData.set("gstin", draft.gstin);
    formData.set("bankAccountName", draft.bankAccountName);
    formData.set("bankAccountNumber", draft.bankAccountNumber);
    formData.set("bankIfsc", draft.bankIfsc);
    formData.set("bankName", draft.bankName);

    const result = await registerOwner(formData);
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    router.push("/owners/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-8">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          Step {step + 1} of {STEPS.length}
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--sand)]">
          <div className="h-full bg-[var(--accent)] transition-all" style={{ width: `${progress}%` }} />
        </div>
        <h1 className="mt-6 font-serif text-4xl text-[var(--ink)]">{STEPS[step].title}</h1>
        <p className="mt-2 text-[var(--muted)]">{STEPS[step].hint}</p>
      </div>

      {step === 0 ? (
        <div className="grid gap-4">
          <Field label="Full name">
            <input className="input" value={draft.fullName} onChange={(event) => update("fullName", event.target.value)} />
          </Field>
          <Field label="Email">
            <input className="input" type="email" value={draft.email} onChange={(event) => update("email", event.target.value)} />
          </Field>
          <Field label="Mobile">
            <input className="input" inputMode="tel" placeholder="9876543210" value={draft.phone} onChange={(event) => update("phone", event.target.value)} />
          </Field>
          <Field label="Password">
            <input className="input" type="password" value={draft.password} onChange={(event) => update("password", event.target.value)} />
          </Field>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="grid gap-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => update("propertyType", type.value)}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  draft.propertyType === type.value
                    ? "border-[var(--accent)] bg-[var(--paper)]"
                    : "border-[var(--border)] bg-[var(--paper)]/50"
                }`}
              >
                <p className="font-medium">{type.label}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{type.blurb}</p>
              </button>
            ))}
          </div>
          <Field label="Listing title">
            <input className="input" placeholder="The Jacaranda House" value={draft.name} onChange={(event) => update("name", event.target.value)} />
          </Field>
          <Field label="Area">
            <select className="input" value={draft.city} onChange={(event) => update("city", event.target.value as Draft["city"])}>
              {BANGALORE_AREA_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Street address">
            <input className="input" value={draft.address} onChange={(event) => update("address", event.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Pincode">
              <input className="input" inputMode="numeric" value={draft.pincode} onChange={(event) => update("pincode", event.target.value)} />
            </Field>
            <Field label="Landmark (optional)">
              <input className="input" value={draft.landmark} onChange={(event) => update("landmark", event.target.value)} />
            </Field>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-5">
          <Counter label="Guests" value={draft.maxGuests} min={1} max={20} onChange={(value) => update("maxGuests", value)} />
          <Counter label="Bedrooms" value={draft.bedrooms} min={0} max={12} onChange={(value) => update("bedrooms", value)} />
          <Counter label="Beds" value={draft.beds} min={1} max={20} onChange={(value) => update("beds", value)} />
          <Counter label="Bathrooms" value={draft.bathrooms} min={1} max={12} onChange={(value) => update("bathrooms", value)} />
          <div>
            <p className="mb-3 text-sm font-medium text-[var(--muted)]">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((amenity) => {
                const selected = draft.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() =>
                      update(
                        "amenities",
                        selected
                          ? draft.amenities.filter((item) => item !== amenity)
                          : [...draft.amenities, amenity],
                      )
                    }
                    className={`rounded-full px-3 py-1.5 text-sm ${
                      selected ? "bg-[var(--accent)] text-white" : "bg-[var(--paper)] text-[var(--ink)]"
                    }`}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="grid gap-4">
          <Field label="Describe the home">
            <textarea
              className="input min-h-32"
              value={draft.description}
              onChange={(event) => update("description", event.target.value)}
            />
          </Field>
          <Field label="House rules">
            <textarea
              className="input min-h-24"
              value={draft.houseRules}
              onChange={(event) => update("houseRules", event.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Check-in">
              <input className="input" type="time" value={draft.checkInTime} onChange={(event) => update("checkInTime", event.target.value)} />
            </Field>
            <Field label="Check-out">
              <input className="input" type="time" value={draft.checkOutTime} onChange={(event) => update("checkOutTime", event.target.value)} />
            </Field>
            <Counter label="Min nights" value={draft.minNights} min={1} max={30} onChange={(value) => update("minNights", value)} />
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="grid gap-4">
          <label className="grid gap-2 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--paper)] p-6 text-center">
            <span className="font-medium">Add photos</span>
            <span className="text-sm text-[var(--muted)]">JPG, PNG or WebP. Up to 5 MB each.</span>
            <input
              className="mx-auto mt-2 text-sm"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(event) => update("photos", [...draft.photos, ...Array.from(event.target.files ?? [])])}
            />
          </label>
          <Field label="Or paste photo URLs, one per line">
            <textarea
              className="input min-h-24"
              placeholder="/properties/your-home.jpg"
              value={draft.photoUrls}
              onChange={(event) => update("photoUrls", event.target.value)}
            />
          </Field>
          {photoUrls.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photoUrls.map((url, index) => (
                <div key={`${draft.photos[index]?.name}-${index}`} className="overflow-hidden rounded-xl bg-[var(--sand)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="aspect-[4/3] w-full object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {step === 5 ? (
        <div className="grid gap-4">
          <Field label="Nightly price (INR)">
            <input
              className="input"
              inputMode="numeric"
              placeholder="8500"
              value={draft.basePricePerNight}
              onChange={(event) => update("basePricePerNight", event.target.value)}
            />
          </Field>
          {split ? (
            <div className="grid gap-2 rounded-2xl bg-[var(--paper)] p-5 text-sm">
              <p className="flex justify-between">
                <span>Guest pays</span>
                <span>{formatInr(split.guestPays)}</span>
              </p>
              <p className="flex justify-between text-[var(--muted)]">
                <span>Bangalore Stays (20%)</span>
                <span>{formatInr(split.platformCommission)}</span>
              </p>
              <p className="flex justify-between font-medium">
                <span>You receive after a confirmed stay</span>
                <span>{formatInr(split.ownerPayout)}</span>
              </p>
              <p className="pt-2 text-xs text-[var(--muted)]">
                This is only a split preview. Payouts stay manual for now. Nothing is charged at
                registration.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {step === 6 ? (
        <div className="grid gap-4">
          <Field label="PAN">
            <input className="input uppercase" value={draft.pan} onChange={(event) => update("pan", event.target.value)} />
          </Field>
          <Field label="GSTIN (optional)">
            <input className="input uppercase" value={draft.gstin} onChange={(event) => update("gstin", event.target.value)} />
          </Field>
          <Field label="Account holder name">
            <input className="input" value={draft.bankAccountName} onChange={(event) => update("bankAccountName", event.target.value)} />
          </Field>
          <Field label="Account number">
            <input className="input" inputMode="numeric" value={draft.bankAccountNumber} onChange={(event) => update("bankAccountNumber", event.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="IFSC">
              <input className="input uppercase" value={draft.bankIfsc} onChange={(event) => update("bankIfsc", event.target.value)} />
            </Field>
            <Field label="Bank name">
              <input className="input" value={draft.bankName} onChange={(event) => update("bankName", event.target.value)} />
            </Field>
          </div>
        </div>
      ) : null}

      {step === 7 ? (
        <div className="grid gap-4 rounded-2xl bg-[var(--paper)] p-6 text-sm leading-6">
          <p>
            <strong>{draft.fullName}</strong> · {draft.email} · {draft.phone}
          </p>
          <p>
            {draft.name} · {draft.propertyType} · {draft.city}
          </p>
          <p>
            {draft.maxGuests} guests · {draft.bedrooms} bedrooms · {draft.photos.length} photos
          </p>
          <p>Nightly rate {draft.basePricePerNight ? formatInr(Number(draft.basePricePerNight)) : "—"}</p>
          <p className="text-[var(--muted)]">
            The listing stays off the guest site until someone on our side reviews it. You are asking
            guests to pay the full stay amount; you keep 80% after a confirmed booking.
          </p>
        </div>
      ) : null}

      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

      <div className="flex items-center justify-between">
        <button
          type="button"
          className="text-sm text-[var(--muted)] disabled:opacity-40"
          disabled={step === 0 || pending}
          onClick={() => {
            setError(null);
            setStep((current) => Math.max(0, current - 1));
          }}
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" className="btn-primary" onClick={goNext}>
            Next
          </button>
        ) : (
          <button type="button" className="btn-primary" disabled={pending} onClick={submit}>
            {pending ? "Submitting…" : "Submit for review"}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-[var(--muted)]">{label}</span>
      {children}
    </label>
  );
}

function Counter({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-[var(--paper)] px-4 py-3">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="h-8 w-8 rounded-full border border-[var(--border)]"
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          –
        </button>
        <span className="w-6 text-center">{value}</span>
        <button
          type="button"
          className="h-8 w-8 rounded-full border border-[var(--border)]"
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          +
        </button>
      </div>
    </div>
  );
}
