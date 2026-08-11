import { prisma } from "@/lib/prisma";
import { ReviewModerator } from "@/components/admin/ReviewModerator";

export const metadata = { title: "Reviews" };

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: {
      product: { select: { name: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pending = reviews.filter((r) => r.status === "PENDING");
  const decided = reviews.filter((r) => r.status !== "PENDING");

  const toProps = (r: (typeof reviews)[number]) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    status: r.status,
    verifiedPurchase: r.verifiedPurchase,
    createdAt: r.createdAt.toISOString(),
    productName: r.product.name,
    authorName: r.user.name ?? "Customer",
    authorEmail: r.user.email,
  });

  return (
    <div>
      <h1 className="font-serif text-3xl">Reviews</h1>
      <p className="mt-1 text-sm text-izhaana-charcoal/50">
        {pending.length} awaiting approval · {reviews.length} total
      </p>

      {reviews.length === 0 && (
        <p className="mt-8 text-izhaana-charcoal/50">
          No reviews submitted yet. Reviews stay hidden from the shop until you
          approve them.
        </p>
      )}

      {pending.length > 0 && (
        <section className="mt-8">
          <h2 className="font-serif text-xl">Awaiting approval</h2>
          <div className="mt-4 space-y-4">
            {pending.map((r) => (
              <ReviewModerator key={r.id} review={toProps(r)} />
            ))}
          </div>
        </section>
      )}

      {decided.length > 0 && (
        <section className="mt-10">
          <h2 className="font-serif text-xl">Reviewed</h2>
          <div className="mt-4 space-y-4">
            {decided.map((r) => (
              <ReviewModerator key={r.id} review={toProps(r)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
