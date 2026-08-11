import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TicketStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security";

const updateSchema = z.object({
  id: z.string().trim().min(1),
  status: z.nativeEnum(TicketStatus).optional(),
  adminReply: z.string().trim().max(4000).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { id, status, adminReply } = parsed.data;

  const ticket = await prisma.supportTicket.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(adminReply !== undefined
        ? { adminReply: adminReply ? sanitizeInput(adminReply) : null }
        : {}),
      // Replying to an untouched ticket moves it along automatically.
      ...(adminReply && !status ? { status: TicketStatus.IN_PROGRESS } : {}),
    },
  });

  return NextResponse.json({ ticket });
}
