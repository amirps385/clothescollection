"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import { Stars } from "@/components/shop/Stars";
import { Button } from "@/components/ui/Button";

export interface AdminReview {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  verifiedPurchase: boolean;
  createdAt: string;
  productName: string;
  authorName: string;
  authorEmail: string;
}

const statusClass: Record<AdminReview["status"], string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-gray-100 text-gray-600",
};

export function ReviewModerator({ review }: { review: AdminReview }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(status: AdminReview["status"]) {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: review.id, status }),
    });
    setBusy(false);

    if (res.ok) router.refresh();
    else setError("Could not update this review.");
  }

  return (
    <div className="border border-izhaana-charcoal/10 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">{review.productName}</p>
          <p className="mt-0.5 text-sm text-izhaana-charcoal/50">
            {review.authorName} · {review.authorEmail} ·{" "}
            {new Date(review.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <span
          className={`px-2.5 py-1 text-xs font-medium ${statusClass[review.status]}`}
        >
          {review.status.toLowerCase()}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Stars rating={review.rating} />
        {review.verifiedPurchase && (
          <span className="flex items-center gap-1 text-xs text-green-700">
            <BadgeCheck size={13} />
            Verified purchase
          </span>
        )}
      </div>

      {review.title && <p className="mt-3 font-medium">{review.title}</p>}
      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-izhaana-charcoal/75">
        {review.body}
      </p>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

      <div className="mt-5 flex flex-wrap gap-3">
        {review.status !== "APPROVED" && (
          <Button size="sm" loading={busy} onClick={() => setStatus("APPROVED")}>
            Approve
          </Button>
        )}
        {review.status !== "REJECTED" && (
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => setStatus("REJECTED")}
          >
            Reject
          </Button>
        )}
        {review.status === "APPROVED" && (
          <span className="self-center text-xs text-izhaana-charcoal/50">
            Live on the product page
          </span>
        )}
      </div>
    </div>
  );
}
