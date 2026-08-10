"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

const statuses = ["REQUESTED", "APPROVED", "REJECTED", "RECEIVED", "REFUNDED"];

interface ReturnStatusUpdaterProps {
  returnId: string;
  currentStatus: string;
}

export function ReturnStatusUpdater({ returnId, currentStatus }: ReturnStatusUpdaterProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function updateStatus() {
    setLoading(true);
    await fetch("/api/admin/returns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returnId, status }),
    });
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-end gap-2">
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
      <Button size="sm" onClick={updateStatus} loading={loading}>
        Update
      </Button>
    </div>
  );
}
