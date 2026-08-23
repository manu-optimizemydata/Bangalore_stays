const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Amounts are stored as whole rupees. Convert to paise only when talking to PhonePe. */
export function formatInr(rupees: number) {
  return inr.format(rupees);
}
