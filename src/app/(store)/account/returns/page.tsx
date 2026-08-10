"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function ReturnForm() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order") ?? "";
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/returns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, reason }),
    });

    const data = await res.json();
    setMessage(data.message ?? data.error ?? "Request submitted");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-lg space-y-4">
      <Input
        label="Order ID"
        value={orderId}
        readOnly
        className="bg-izhaana-cream"
      />
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">Reason for Return</label>
        <textarea
          required
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border border-izhaana-charcoal/20 px-4 py-2.5 text-sm focus:border-izhaana-burgundy focus:outline-none"
          placeholder="Please describe why you'd like to return this order..."
        />
      </div>
      {message && (
        <p className={`text-sm ${message.includes("submitted") ? "text-green-700" : "text-red-600"}`}>
          {message}
        </p>
      )}
      <Button type="submit" loading={loading}>
        Submit Return Request
      </Button>
    </form>
  );
}

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl">Returns & Refunds</h1>
      <p className="mt-2 text-izhaana-charcoal/60">
        We offer 30-day hassle-free returns on unworn items with tags attached.
      </p>
      <Suspense>
        <ReturnForm />
      </Suspense>
    </div>
  );
}
