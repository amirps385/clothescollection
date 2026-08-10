import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId, reason } = await req.json();

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (!["DELIVERED", "SHIPPED", "PAID"].includes(order.status)) {
    return NextResponse.json(
      { error: "This order is not eligible for return" },
      { status: 400 }
    );
  }

  const existing = await prisma.return.findFirst({
    where: { orderId, userId: session.user.id },
  });

  if (existing) {
    return NextResponse.json(
      { error: "A return request already exists for this order" },
      { status: 400 }
    );
  }

  await prisma.return.create({
    data: {
      orderId,
      userId: session.user.id,
      reason: sanitizeInput(reason),
    },
  });

  return NextResponse.json({
    message: "Return request submitted successfully. We'll review it within 2 business days.",
  });
}
