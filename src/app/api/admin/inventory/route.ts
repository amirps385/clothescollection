import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { variantId, stock } = await req.json();

  await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock: Math.max(0, stock) },
  });

  return NextResponse.json({ success: true });
}
