/**
 * Vercel Blob is optional. When no store is attached the admin falls back to
 * pasting image links, mirroring how `isStripeConfigured` gates payments.
 */
export function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
