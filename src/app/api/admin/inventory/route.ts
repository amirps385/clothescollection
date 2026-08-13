import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  variantId: z.string().trim().min(1),
  stock: z.coerce.number().int().min(0).optional(),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid update" },
      { status: 400 }
    );
  }

  const { variantId, stock, lowStockThreshold } = parsed.data;
  if (stock === undefined && lowStockThreshold === undefined) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const exists = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { id: true },
  });
  if (!exists) {
    return NextResponse.json({ error: "Variant not found" }, { status: 404 });
  }

  const variant = await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      ...(stock !== undefined ? { stock } : {}),
      ...(lowStockThreshold !== undefined ? { lowStockThreshold } : {}),
    },
    select: { id: true, stock: true, lowStockThreshold: true },
  });

  return NextResponse.json({ variant });
}
