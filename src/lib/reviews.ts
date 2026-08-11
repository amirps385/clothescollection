import { prisma } from "@/lib/prisma";

export interface RatingSummary {
  average: number;
  count: number;
}

/**
 * Aggregates approved-review stats for a batch of products in one query,
 * so listing grids don't fire a query per card.
 */
export async function getRatingsFor(
  productIds: string[]
): Promise<Record<string, RatingSummary>> {
  if (productIds.length === 0) return {};

  const grouped = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds }, status: "APPROVED" },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return Object.fromEntries(
    grouped.map((g) => [
      g.productId,
      { average: g._avg.rating ?? 0, count: g._count.rating },
    ])
  );
}
