import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { sendOrderStatusEmail } from "@/lib/email";
import { sanitizeInput } from "@/lib/security";

const patchSchema = z.object({
  orderId: z.string().trim().min(1),
  status: z.nativeEnum(OrderStatus).optional(),
  trackingNumber: z.string().trim().max(80).optional(),
  carrier: z.string().trim().max(60).optional(),
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

  const { orderId, status, trackingNumber, carrier } = parsed.data;

  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      ...(status ? { status } : {}),
      // Empty string clears the field; undefined leaves it untouched.
      ...(trackingNumber !== undefined
        ? { trackingNumber: trackingNumber ? sanitizeInput(trackingNumber) : null }
        : {}),
      ...(carrier !== undefined
        ? { carrier: carrier ? sanitizeInput(carrier) : null }
        : {}),
    },
  });

  // Only email when the status actually changed, so saving a tracking number
  // doesn't spam the customer with a duplicate notification.
  if (status && status !== existing.status) {
    await sendOrderStatusEmail(order.email, order.orderNumber, status);
  }

  return NextResponse.json({
    order: {
      id: order.id,
      status: order.status,
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,
    },
  });
}
