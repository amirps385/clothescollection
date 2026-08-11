import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ReviewStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security";

const patchSchema = z.object({
  id: z.string().trim().min(1),
  status: z.nativeEnum(ReviewStatus),
  adminNote: z.string().trim().max(500).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { id, status, adminNote } = parsed.data;

  const review = await prisma.review.update({
    where: { id },
    data: {
      status,
      ...(adminNote !== undefined
        ? { adminNote: adminNote ? sanitizeInput(adminNote) : null }
        : {}),
    },
  });

  return NextResponse.json({ review });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await req.json();
  if (typeof id !== "string" || !id) {
    return NextResponse.json({ error: "Missing review id" }, { status: 400 });
  }

  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
