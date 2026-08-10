import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { sendOrderStatusEmail } from "@/lib/email";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { orderId, status, trackingNumber } = await req.json();

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: status as OrderStatus,
      ...(trackingNumber ? { trackingNumber } : {}),
    },
  });

  await sendOrderStatusEmail(order.email, order.orderNumber, status);

  return NextResponse.json({ success: true });
}
