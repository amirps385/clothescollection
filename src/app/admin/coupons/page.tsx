import { prisma } from "@/lib/prisma";
import { CouponManager } from "@/components/admin/CouponManager";

export const metadata = { title: "Coupons" };

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <CouponManager
      coupons={coupons.map((c) => ({
        id: c.id,
        code: c.code,
        type: c.type,
        value: c.value,
        minOrderAmount: c.minOrderAmount,
        maxDiscount: c.maxDiscount,
        usageLimit: c.usageLimit,
        usedCount: c.usedCount,
        active: c.active,
        expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
      }))}
    />
  );
}
