"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface InventoryUpdaterProps {
  variantId: string;
  currentStock: number;
}

export function InventoryUpdater({ variantId, currentStock }: InventoryUpdaterProps) {
  const [stock, setStock] = useState(currentStock);
  const [loading, setLoading] = useState(false);

  async function updateStock() {
    setLoading(true);
    const res = await fetch("/api/admin/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId, stock }),
    });
    if (res.ok) setLoading(false);
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        value={stock}
        onChange={(e) => setStock(Number(e.target.value))}
        className="w-20 border border-izhaana-charcoal/20 px-2 py-1 text-sm"
      />
      <Button size="sm" onClick={updateStock} loading={loading}>
        Save
      </Button>
    </div>
  );
}
