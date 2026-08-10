import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { calculateOrderTax } from "@/lib/tax";
import { getShippingOptions } from "@/lib/shipping";
import { validateCoupon, checkRateLimit } from "@/lib/security";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { OrderStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const session = await auth();

  try {
    const body = await req.json();
    const { items, couponCode, ...shipping } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    let subtotal = 0;
    const orderItems: {
      variantId: string;
      productName: string;
      variantInfo: string;
      price: number;
      quantity: number;
      gstRate: number;
    }[] = [];

    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      });

      if (!variant || variant.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.productName}` },
          { status: 400 }
        );
      }

      subtotal += item.price * item.quantity;
      orderItems.push({
        variantId: variant.id,
        productName: item.productName,
        variantInfo: item.variantInfo,
        price: item.price,
        quantity: item.quantity,
        gstRate: item.gstRate,
      });
    }

    let discount = 0;
    let couponId: string | undefined;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });
      if (coupon) {
        const result = validateCoupon(coupon, subtotal);
        if (result.valid) {
          discount = result.discount;
          couponId = coupon.id;
        }
      }
    }

    const shippingOptions = await getShippingOptions(
      shipping.shippingCountry,
      subtotal
    );
    const selectedShipping = shippingOptions.find(
      (o) => o.id === shipping.shippingMethodId
    ) ?? shippingOptions[0];

    const shippingCost = selectedShipping?.price ?? 0;
    const { totalTax, breakdown } = calculateOrderTax(
      orderItems,
      shipping.shippingState
    );

    const total = subtotal - discount + shippingCost + totalTax;
    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session?.user?.id,
        email: shipping.email,
        status: OrderStatus.PENDING,
        subtotal,
        discount,
        shippingCost,
        taxAmount: totalTax,
        gstBreakdown: JSON.stringify(breakdown),
        total,
        couponId,
        couponCode: couponCode?.toUpperCase(),
        shippingName: shipping.shippingName,
        shippingLine1: shipping.shippingLine1,
        shippingLine2: shipping.shippingLine2,
        shippingCity: shipping.shippingCity,
        shippingState: shipping.shippingState,
        shippingPostal: shipping.shippingPostal,
        shippingCountry: shipping.shippingCountry,
        shippingMethod: selectedShipping?.name,
        carrier: selectedShipping?.carrier,
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });

    if (isStripeConfigured() && stripe) {
      const stripeSession = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: shipping.email,
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: { name: `IZHAANA Enterprises Order ${orderNumber}` },
              unit_amount: Math.round(total * 100),
            },
            quantity: 1,
          },
        ],
        metadata: { orderId: order.id },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/success?order=${orderNumber}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { stripeSessionId: stripeSession.id },
      });

      return NextResponse.json({ url: stripeSession.url });
    }

    await prisma.$transaction(async (tx) => {
      for (const item of orderItems) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PAID },
      });
    });

    const { sendOrderConfirmationEmail } = await import("@/lib/email");
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

    return NextResponse.json({ orderId: order.id, orderNumber });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
