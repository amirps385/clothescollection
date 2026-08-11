/**
 * Single source of truth for business details shown on the policy and contact
 * pages. Everything is env-overridable so the real values can be set in Vercel
 * without a code change. Anything left blank is simply omitted from the page
 * rather than rendering an empty placeholder to customers.
 *
 * Razorpay (and most Indian gateways) require a real postal address and contact
 * details to be published before they approve a live merchant account, so
 * BUSINESS_ADDRESS and CONTACT_PHONE should be filled in before going live.
 */
export const BUSINESS = {
  legalName: "IZHAANA ENTERPRISES",
  shortName: "IZHAANA",

  email: process.env.CONTACT_EMAIL ?? "support@izhaana.com",
  phone: process.env.CONTACT_PHONE ?? "",
  address: process.env.BUSINESS_ADDRESS ?? "",
  gstin: process.env.COMPANY_GSTIN ?? "",

  /** Mon–Sat, 10am–6pm IST by default. */
  supportHours: process.env.SUPPORT_HOURS ?? "Monday to Saturday, 10am – 6pm IST",

  /** Kept in step with the seeded shipping rates and returns copy. */
  freeShippingOver: 2999,
  returnWindowDays: 30,
  dispatchDays: "1–2 business days",
} as const;

export const LAST_UPDATED = "11 August 2026";
