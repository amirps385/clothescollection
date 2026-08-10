import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReturnStatus, OrderStatus } from "@prisma/client";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { returnId, status } = await req.json();

  const returnRequest = await prisma.return.update({
    where: { id: returnId },
    data: { status: status as ReturnStatus },
    include: { order: true },
  });

  if (status === "REFUNDED") {
    await prisma.order.update({
      where: { id: returnRequest.orderId },
      data: {
        status: OrderStatus.REFUNDED,
      },
    });

    await prisma.return.update({
      where: { id: returnId },
      data: { refundAmount: returnRequest.order.total },
    });
  }

  return NextResponse.json({ success: true });
}
