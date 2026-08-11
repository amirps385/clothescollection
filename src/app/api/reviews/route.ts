import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security";

const reviewSchema = z.object({
  productId: z.string().trim().min(1),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Pick a rating between 1 and 5 stars")
    .max(5, "Pick a rating between 1 and 5 stars"),
  title: z.string().trim().max(120).optional().default(""),
  body: z.string().trim().min(10, "Please write at least a sentence or two"),
});

/** Statuses that mean the customer actually received/paid for the goods. */
const PURCHASED = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "Please sign in to leave a review" },
      { status: 401 }
    );
  }

  const parsed = reviewSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid review" },
      { status: 400 }
    );
  }
  const { productId, rating, title, body } = parsed.data;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Badge the review if this customer has an order containing the product.
  const purchase = await prisma.orderItem.findFirst({
    where: {
      variant: { productId },
      order: { userId: session.user.id, status: { in: [...PURCHASED] } },
    },
    select: { id: true },
  });

  try {
    const review = await prisma.review.create({
      data: {
        productId,
        userId: session.user.id,
        rating,
        title: title ? sanitizeInput(title) : null,
        body: sanitizeInput(body),
        verifiedPurchase: Boolean(purchase),
      },
    });

    return NextResponse.json({
      review,
      message:
        "Thanks for your review! It'll appear on the product page once approved.",
    });
  } catch (e) {
    // Unique [productId, userId] — one review per customer per product.
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "You've already reviewed this product." },
        { status: 409 }
      );
    }
    throw e;
  }
}
