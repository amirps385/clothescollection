import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security";

const addressSchema = z.object({
  label: z.string().trim().max(40).optional().default("Home"),
  fullName: z.string().trim().min(1, "Name is required"),
  line1: z.string().trim().min(1, "Address is required"),
  line2: z.string().trim().optional().default(""),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a 6-digit PIN code"),
  country: z.string().trim().default("IN"),
  isDefault: z.boolean().default(false),
});

function clean(input: z.infer<typeof addressSchema>) {
  return {
    label: sanitizeInput(input.label || "Home"),
    fullName: sanitizeInput(input.fullName),
    line1: sanitizeInput(input.line1),
    line2: input.line2 ? sanitizeInput(input.line2) : null,
    city: sanitizeInput(input.city),
    state: sanitizeInput(input.state),
    postalCode: input.postalCode,
    country: input.country || "IN",
    isDefault: input.isDefault,
  };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = addressSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid address" },
      { status: 400 }
    );
  }
  const data = clean(parsed.data);

  const count = await prisma.address.count({ where: { userId: session.user.id } });
  // The very first address is always the default.
  const isDefault = data.isDefault || count === 0;

  const address = await prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }
    return tx.address.create({
      data: { ...data, isDefault, userId: session.user.id },
    });
  });

  return NextResponse.json({ address });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id } = body;
  if (typeof id !== "string" || !id) {
    return NextResponse.json({ error: "Missing address id" }, { status: 400 });
  }

  const owned = await prisma.address.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!owned) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid address" },
      { status: 400 }
    );
  }
  const data = clean(parsed.data);

  const address = await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }
    return tx.address.update({ where: { id }, data });
  });

  return NextResponse.json({ address });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (typeof id !== "string" || !id) {
    return NextResponse.json({ error: "Missing address id" }, { status: 400 });
  }

  const address = await prisma.address.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!address) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  await prisma.address.delete({ where: { id } });

  // Promote another address so the account always has a default.
  if (address.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId: session.user.id },
      orderBy: { id: "asc" },
      select: { id: true },
    });
    if (next) {
      await prisma.address.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }

  return NextResponse.json({ deleted: true });
}
