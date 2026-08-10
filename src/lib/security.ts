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

export function sanitizeInput(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}
