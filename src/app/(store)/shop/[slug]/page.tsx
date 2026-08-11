import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { ReviewSection } from "@/components/shop/ReviewSection";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, active: true },
    include: { category: true, variants: true },
  });

  if (!product) notFound();

  const session = await auth();

  const [reviews, ownReview] = await Promise.all([
    prisma.review.findMany({
      where: { productId: product.id, status: "APPROVED" },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    // Any status counts — a pending review still blocks a second submission.
    session?.user
      ? prisma.review.findFirst({
          where: { productId: product.id, userId: session.user.id },
          select: { id: true, status: true },
        })
      : null,
  ]);

  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <ProductDetail product={product} />

      <ReviewSection
        productId={product.id}
        average={average}
        blockedReason={
          !session?.user ? "signed-out" : ownReview ? "already-reviewed" : undefined
        }
        ownReviewStatus={ownReview?.status}
        reviews={reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          body: r.body,
          verifiedPurchase: r.verifiedPurchase,
          createdAt: r.createdAt.toISOString(),
          authorName: r.user.name?.split(" ")[0] ?? "Customer",
        }))}
      />
    </div>
  );
}
