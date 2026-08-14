"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

/** Couriers seeded in the shipping rates, offered as suggestions. */
const CARRIERS = ["India Post", "Delhivery", "BlueDart"];

interface OrderFulfilmentProps {
  orderId: string;
  status: string;
  trackingNumber: string;
  carrier: string;
}

export function OrderFulfilment({
  orderId,
  status: initialStatus,
  trackingNumber: initialTracking,
  carrier: initialCarrier,
}: OrderFulfilmentProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  // Pre-filled from the order, so an existing tracking number is visible and
  // editable rather than silently blank.
  const [tracking, setTracking] = useState(initialTracking);
  const [carrier, setCarrier] = useState(initialCarrier);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    status !== initialStatus ||
    tracking !== initialTracking ||
    carrier !== initialCarrier;

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);

    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status, trackingNumber: tracking, carrier }),
    }).catch(() => null);

    setSaving(false);

    if (!res || !res.ok) {
      const message = res
        ? ((await res.json().catch(() => ({}))).error ?? "Couldn't save")
        : "Network error";
      setError(message);
      return;
    }

    setSaved(true);
    router.refresh();
  }

  const shipping = status === "SHIPPED" || status === "DELIVERED";

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="order-status" className="block text-sm font-medium">
          Status
        </label>
        <select
          id="order-status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setSaved(false);
          }}
          className="w-full border border-izhaana-charcoal/20 bg-white px-3 py-2 text-sm capitalize focus:border-izhaana-burgundy focus:outline-none"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.toLowerCase().replace("_", " ")}
            </option>
          ))}
        </select>
        <p className="text-xs text-izhaana-charcoal/50">
          Changing the status emails the customer.
        </p>
      </div>

      {shipping && (
        <>
          <div className="space-y-1.5">
            <label htmlFor="order-carrier" className="block text-sm font-medium">
              Courier
            </label>
            <input
              id="order-carrier"
              list="carrier-options"
              value={carrier}
              onChange={(e) => {
                setCarrier(e.target.value);
                setSaved(false);
              }}
              placeholder="e.g. Delhivery"
              className="w-full border border-izhaana-charcoal/20 bg-white px-3 py-2 text-sm focus:border-izhaana-burgundy focus:outline-none"
            />
            <datalist id="carrier-options">
              {CARRIERS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <Input
            id="order-tracking"
            label="Tracking number"
            value={tracking}
            onChange={(e) => {
              setTracking(e.target.value);
              setSaved(false);
            }}
            placeholder="Courier's tracking reference"
          />
          <p className="-mt-2 text-xs text-izhaana-charcoal/50">
            Shown to the customer on their order page.
          </p>
        </>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && !dirty && (
        <p className="flex items-center gap-1.5 text-sm text-green-700">
          <Check size={14} />
          Saved
        </p>
      )}

      <Button onClick={save} disabled={!dirty || saving} className="w-full">
        {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
        Save changes
      </Button>
    </div>
  );
}
