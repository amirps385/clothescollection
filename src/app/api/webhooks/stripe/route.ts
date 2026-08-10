import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (order && order.status === OrderStatus.PENDING) {
        await prisma.$transaction(async (tx) => {
          for (const item of order.items) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { decrement: item.quantity } },
            });
          }

          if (order.couponId) {
            await tx.coupon.update({
              where: { id: order.couponId },
              data: { usedCount: { increment: 1 } },
            });
          }

          await tx.order.update({
            where: { id: orderId },
            data: {
              status: OrderStatus.PAID,
              stripePaymentId: session.payment_intent as string,
            },
          });
        });

        await sendOrderConfirmationEmail({
          email: order.email,
          orderNumber: order.orderNumber,
          total: order.total,
          items: order.items,
          shippingName: order.shippingName,
          shippingLine1: order.shippingLine1,
          shippingCity: order.shippingCity,
          shippingState: order.shippingState,
          shippingPostal: order.shippingPostal,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
