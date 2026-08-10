import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCoupon } from "@/lib/security";

export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json();

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!coupon) {
    return NextResponse.json({ valid: false, error: "Coupon not found" });
  }

  const result = validateCoupon(coupon, subtotal);
  return NextResponse.json(result);
}
