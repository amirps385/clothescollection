import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security";

const ticketSchema = z.object({
  subject: z.string().trim().min(3, "Please add a short subject"),
  message: z.string().trim().min(10, "Please describe the issue in a bit more detail"),
  orderId: z.string().trim().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = ticketSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  // Only attach an order the signed-in customer actually owns.
  let orderId: string | null = null;
  if (parsed.data.orderId) {
    const order = await prisma.order.findFirst({
      where: { id: parsed.data.orderId, userId: session.user.id },
      select: { id: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    orderId = order.id;
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: session.user.id,
      email: session.user.email,
      orderId,
      subject: sanitizeInput(parsed.data.subject),
      message: sanitizeInput(parsed.data.message),
    },
  });

  return NextResponse.json({
    ticket,
    message: "Thanks — we've received your message and will reply by email.",
  });
}
