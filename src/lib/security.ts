import { CouponType } from "@prisma/client";

export function validateCoupon(
  coupon: {
    type: CouponType;
    value: number;
    minOrderAmount: number | null;
    maxDiscount: number | null;
    usageLimit: number | null;
    usedCount: number;
    active: boolean;
    expiresAt: Date | null;
  },
  subtotal: number
): { valid: boolean; discount: number; error?: string } {
  if (!coupon.active) {
    return { valid: false, discount: 0, error: "This coupon is no longer active" };
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, discount: 0, error: "This coupon has expired" };
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, discount: 0, error: "This coupon has reached its usage limit" };
  }

  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      discount: 0,
      error: `Minimum order of ₹${coupon.minOrderAmount} required`,
    };
  }

  let discount = 0;
  if (coupon.type === CouponType.PERCENTAGE) {
    discount = (subtotal * coupon.value) / 100;
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.value;
  }

  discount = Math.min(discount, subtotal);

  return { valid: true, discount };
}

export const RATE_LIMIT_WINDOW = 60_000;
export const RATE_LIMIT_MAX = 100;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

/**
 * Rate limit with its own budget and window, for endpoints that cost real money
 * per call (the AI chat bills OpenAI on every message).
 *
 * NOTE: this is in-process, so on serverless each instance keeps its own tally
 * and the count resets when an instance recycles. It stops casual abuse and
 * runaway loops, not a determined distributed attacker — that needs a shared
 * store such as Redis.
 */
const scopedLimits = new Map<string, { count: number; resetAt: number }>();

export function checkScopedRateLimit(
  key: string,
  max: number,
  windowMs: number
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = scopedLimits.get(key);

  if (!entry || now > entry.resetAt) {
    scopedLimits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= max) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count++;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function sanitizeInput(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}
