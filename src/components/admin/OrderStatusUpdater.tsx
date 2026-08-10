"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

const statuses = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusUpdater({ orderId, currentStatus }: OrderStatusUpdaterProps) {
  const [status, setStatus] = useState(currentStatus);
  const [tracking, setTracking] = useState("");
  const [loading, setLoading] = useState(false);

  async function updateStatus() {
    setLoading(true);
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status, trackingNumber: tracking || undefined }),
    });
    setLoading(false);
  }

  return (
    <div className="mt-2 flex flex-col items-end gap-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border border-izhaana-charcoal/20 px-2 py-1 text-xs capitalize"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s.toLowerCase()}
          </option>
        ))}
      </select>
      {status === "SHIPPED" && (
        <input
          placeholder="Tracking number"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          className="border border-izhaana-charcoal/20 px-2 py-1 text-xs w-40"
        />
      )}
      <Button size="sm" onClick={updateStatus} loading={loading}>
        Update
      </Button>
    </div>
  );
}
