/**
 * Canonical list of Indian states and union territories.
 *
 * This is deliberately a fixed list rather than free text: GST is split into
 * CGST+SGST for intra-state orders and IGST for inter-state ones, and that
 * decision is made by comparing the shipping state to the store's state. A
 * typo ("Maharastra") would silently produce the wrong tax on an invoice.
 */
export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // Union territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

export type IndianState = (typeof INDIAN_STATES)[number];

export function isIndianState(value: string): value is IndianState {
  return (INDIAN_STATES as readonly string[]).includes(value);
}

/**
 * India Post sometimes returns a state name that differs in spelling or
 * casing from our canonical list; map it back so the dropdown can select it.
 */
const ALIASES: Record<string, string> = {
  orissa: "Odisha",
  pondicherry: "Puducherry",
  uttaranchal: "Uttarakhand",
  "nct of delhi": "Delhi",
  "national capital territory of delhi": "Delhi",
  "jammu & kashmir": "Jammu and Kashmir",
  "andaman & nicobar islands": "Andaman and Nicobar Islands",
  "dadra & nagar haveli": "Dadra and Nagar Haveli and Daman and Diu",
  "daman & diu": "Dadra and Nagar Haveli and Daman and Diu",
  "dadra and nagar haveli": "Dadra and Nagar Haveli and Daman and Diu",
  "daman and diu": "Dadra and Nagar Haveli and Daman and Diu",
};

export function normaliseState(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (isIndianState(trimmed)) return trimmed;

  const lower = trimmed.toLowerCase();
  if (ALIASES[lower]) return ALIASES[lower];

  const match = INDIAN_STATES.find((s) => s.toLowerCase() === lower);
  return match ?? trimmed;
}

/** The state the business ships from — decides CGST+SGST vs IGST. */
export const STORE_STATE = normaliseState(
  process.env.STORE_STATE ?? "Madhya Pradesh"
);

export const PINCODE_PATTERN = /^\d{6}$/;

/** Indian mobile numbers are 10 digits starting 6–9. */
export const MOBILE_PATTERN = /^[6-9]\d{9}$/;

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}
