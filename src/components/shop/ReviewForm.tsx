"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Star } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  productId: string;
  /** Rendered instead of the form when the shopper can't review. */
  blockedReason?: "signed-out" | "already-reviewed";
  /** Status of this shopper's existing review, so the notice is accurate. */
  ownReviewStatus?: "PENDING" | "APPROVED" | "REJECTED";
}

export function ReviewForm({
  productId,
  blockedReason,
  ownReviewStatus,
}: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null
  );

  if (blockedReason === "signed-out") {
    return (
      <p className="text-sm text-izhaana-charcoal/60">
        <a href="/login" className="text-izhaana-burgundy hover:underline">
          Sign in
        </a>{" "}
        to write a review.
      </p>
    );
  }

  if (blockedReason === "already-reviewed") {
    if (ownReviewStatus === "PENDING") {
      return (
        <p className="text-sm text-green-700">
          Thanks! Your review has been submitted and will appear here once it&apos;s
          approved.
        </p>
      );
    }
    if (ownReviewStatus === "REJECTED") {
      return (
        <p className="text-sm text-izhaana-charcoal/60">
          Your review wasn&apos;t published. Contact us from{" "}
          <a href="/account/support" className="text-izhaana-burgundy hover:underline">
            Help &amp; Issues
          </a>{" "}
          if you think that&apos;s a mistake.
        </p>
      );
    }
    return (
      <p className="text-sm text-izhaana-charcoal/60">
        You&apos;ve already reviewed this product — thank you!
      </p>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);

    if (rating === 0) {
      setNotice({ kind: "err", text: "Please pick a star rating." });
      return;
    }

    setSending(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, title, body }),
    });
    const data = await res.json().catch(() => ({}));
    setSending(false);

    if (res.ok) {
      setNotice({ kind: "ok", text: data.message ?? "Review submitted" });
      setRating(0);
      setTitle("");
      setBody("");
      router.refresh();
    } else {
      setNotice({ kind: "err", text: data.error ?? "Could not submit your review" });
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <p className="text-sm font-medium">Your rating</p>
        <div className="mt-2 flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className="p-0.5"
            >
              <Star
                size={24}
                className={cn(
                  "transition-colors",
                  n <= (hover || rating)
                    ? "fill-izhaana-gold text-izhaana-gold"
                    : "text-izhaana-charcoal/25"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <Input
        id="reviewTitle"
        label="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Beautiful fabric"
      />

      <div className="space-y-1.5">
        <label htmlFor="reviewBody" className="block text-sm font-medium">
          Your review
        </label>
        <textarea
          id="reviewBody"
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What did you think of the quality, colour and fit?"
          className="w-full border border-izhaana-charcoal/20 bg-white px-4 py-2.5 text-sm focus:border-izhaana-burgundy focus:outline-none focus:ring-1 focus:ring-izhaana-burgundy"
        />
      </div>

      {notice && (
        <p
          className={`text-sm ${
            notice.kind === "ok" ? "text-green-700" : "text-red-600"
          }`}
        >
          {notice.text}
        </p>
      )}

      <Button type="submit" loading={sending}>
        Submit review
      </Button>
    </form>
  );
}
