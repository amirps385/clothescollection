import { BadgeCheck } from "lucide-react";
import { Stars } from "@/components/shop/Stars";
import { ReviewForm } from "@/components/shop/ReviewForm";

export interface PublicReview {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  verifiedPurchase: boolean;
  createdAt: string;
  authorName: string;
}

interface ReviewSectionProps {
  productId: string;
  reviews: PublicReview[];
  average: number;
  blockedReason?: "signed-out" | "already-reviewed";
  ownReviewStatus?: "PENDING" | "APPROVED" | "REJECTED";
}

export function ReviewSection({
  productId,
  reviews,
  average,
  blockedReason,
  ownReviewStatus,
}: ReviewSectionProps) {
  // Bar chart of how many reviews sit at each star level.
  const spread = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <section className="mt-16 border-t border-izhaana-charcoal/10 pt-12">
      <h2 className="font-serif text-3xl">Reviews</h2>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          {reviews.length === 0 ? (
            <p className="text-izhaana-charcoal/60">
              No reviews yet — be the first to share your thoughts.
            </p>
          ) : (
            <>
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-5xl">{average.toFixed(1)}</span>
                <div>
                  <Stars rating={average} size={16} />
                  <p className="mt-1 text-sm text-izhaana-charcoal/55">
                    {reviews.length}{" "}
                    {reviews.length === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-1.5">
                {spread.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-izhaana-charcoal/55">{star}</span>
                    <div className="h-1.5 flex-1 bg-izhaana-charcoal/10">
                      <div
                        className="h-full bg-izhaana-gold"
                        style={{
                          width: `${reviews.length ? (count / reviews.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="w-6 text-right text-izhaana-charcoal/45">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="mt-10 border-t border-izhaana-charcoal/10 pt-8">
            <h3 className="font-serif text-xl">Write a review</h3>
            <div className="mt-4">
              <ReviewForm
                productId={productId}
                blockedReason={blockedReason}
                ownReviewStatus={ownReviewStatus}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="border-b border-izhaana-charcoal/10 pb-6 last:border-0"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Stars rating={review.rating} />
                <span className="text-sm font-medium">{review.authorName}</span>
                {review.verifiedPurchase && (
                  <span className="flex items-center gap-1 text-xs text-green-700">
                    <BadgeCheck size={13} />
                    Verified purchase
                  </span>
                )}
                <span className="text-xs text-izhaana-charcoal/45">
                  {new Date(review.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              {review.title && (
                <p className="mt-2 font-medium">{review.title}</p>
              )}
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-izhaana-charcoal/75">
                {review.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
