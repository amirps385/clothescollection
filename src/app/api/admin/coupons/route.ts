import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CouponType } from "@prisma/client";

const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Code must be at least 3 characters")
    .transform((c) => c.toUpperCase()),
  type: z.nativeEnum(CouponType),
  value: z.coerce.number().positive("Value must be greater than zero"),
  minOrderAmount: z.coerce.number().min(0).nullish(),
  maxDiscount: z.coerce.number().min(0).nullish(),
  usageLimit: z.coerce.number().int().min(1).nullish(),
  active: z.boolean().default(true),
  expiresAt: z.string().trim().nullish(),
});

async function requireAdmin() {
  const session = await auth();
  return Boolean(session?.user && session.user.role === "ADMIN");
}

function toData(input: z.infer<typeof couponSchema>) {
  return {
    code: input.code,
    type: input.type,
    value: input.value,
    minOrderAmount: input.minOrderAmount ?? null,
    maxDiscount: input.maxDiscount ?? null,
    usageLimit: input.usageLimit ?? null,
    active: input.active,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
  };
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = couponSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid coupon" },
      { status: 400 }
    );
  }

  const clash = await prisma.coupon.findUnique({
    where: { code: parsed.data.code },
    select: { id: true },
  });
  if (clash) {
    return NextResponse.json(
      { error: `Coupon code ${parsed.data.code} already exists.` },
      { status: 409 }
    );
  }

  const coupon = await prisma.coupon.create({ data: toData(parsed.data) });
  return NextResponse.json({ coupon });
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { id } = body;
  if (typeof id !== "string" || !id) {
    return NextResponse.json({ error: "Missing coupon id" }, { status: 400 });
  }

  // Toggling active is the common case and doesn't need the full payload.
  if (typeof body.active === "boolean" && Object.keys(body).length === 2) {
    await prisma.coupon.update({ where: { id }, data: { active: body.active } });
    return NextResponse.json({ success: true });
  }

  const parsed = couponSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid coupon" },
      { status: 400 }
    );
  }

  const clash = await prisma.coupon.findUnique({
    where: { code: parsed.data.code },
    select: { id: true },
  });
  if (clash && clash.id !== id) {
    return NextResponse.json(
      { error: `Coupon code ${parsed.data.code} already exists.` },
      { status: 409 }
    );
  }

  const coupon = await prisma.coupon.update({
    where: { id },
    data: toData(parsed.data),
  });
  return NextResponse.json({ coupon });
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await req.json();
  if (typeof id !== "string" || !id) {
    return NextResponse.json({ error: "Missing coupon id" }, { status: 400 });
  }

  // Coupons attached to orders are deactivated so order history stays intact.
  const used = await prisma.order.findFirst({
    where: { couponId: id },
    select: { id: true },
  });

  if (used) {
    await prisma.coupon.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ deactivated: true });
  }

  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
