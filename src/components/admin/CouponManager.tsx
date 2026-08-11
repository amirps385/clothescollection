"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatPrice } from "@/lib/utils";

export interface CouponRow {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
}

interface Draft {
  id?: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: string;
  minOrderAmount: string;
  maxDiscount: string;
  usageLimit: string;
  expiresAt: string;
  active: boolean;
}

const emptyDraft = (): Draft => ({
  code: "",
  type: "PERCENTAGE",
  value: "",
  minOrderAmount: "",
  maxDiscount: "",
  usageLimit: "",
  expiresAt: "",
  active: true,
});

const toDraft = (c: CouponRow): Draft => ({
  id: c.id,
  code: c.code,
  type: c.type,
  value: String(c.value),
  minOrderAmount: c.minOrderAmount != null ? String(c.minOrderAmount) : "",
  maxDiscount: c.maxDiscount != null ? String(c.maxDiscount) : "",
  usageLimit: c.usageLimit != null ? String(c.usageLimit) : "",
  expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
  active: c.active,
});

export function CouponManager({ coupons }: { coupons: CouponRow[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }

  async function send(method: "POST" | "PATCH" | "DELETE", body: unknown) {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/coupons", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return false;
    }
    router.refresh();
    return true;
  }

  async function save() {
    if (!draft) return;
    if (!draft.code.trim()) return setError("Enter a coupon code.");
    if (!draft.value.trim()) return setError("Enter a discount amount.");

    const payload = {
      ...(draft.id ? { id: draft.id } : {}),
      code: draft.code,
      type: draft.type,
      value: Number(draft.value),
      minOrderAmount: draft.minOrderAmount ? Number(draft.minOrderAmount) : null,
      maxDiscount: draft.maxDiscount ? Number(draft.maxDiscount) : null,
      usageLimit: draft.usageLimit ? Number(draft.usageLimit) : null,
      expiresAt: draft.expiresAt || null,
      active: draft.active,
    };

    if (await send(draft.id ? "PATCH" : "POST", payload)) setDraft(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Coupons &amp; Discounts</h1>
          <p className="mt-1 text-sm text-izhaana-charcoal/50">
            {coupons.length} coupons
          </p>
        </div>
        {!draft && (
          <Button onClick={() => setDraft(emptyDraft())}>
            <Plus size={15} className="mr-1.5" />
            New coupon
          </Button>
        )}
      </div>

      {error && (
        <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {draft && (
        <section className="mt-6 space-y-5 border border-izhaana-charcoal/10 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">
              {draft.id ? `Edit ${draft.code}` : "New coupon"}
            </h2>
            <button
              type="button"
              onClick={() => {
                setDraft(null);
                setError(null);
              }}
              className="text-izhaana-charcoal/40 hover:text-izhaana-charcoal"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="Code"
              value={draft.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              placeholder="FESTIVE20"
              className="font-mono"
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium">Discount type</label>
              <select
                value={draft.type}
                onChange={(e) => set("type", e.target.value as Draft["type"])}
                className="w-full border border-izhaana-charcoal/20 bg-white px-4 py-2.5 text-sm focus:border-izhaana-burgundy focus:outline-none"
              >
                <option value="PERCENTAGE">Percentage off</option>
                <option value="FIXED">Fixed amount off</option>
              </select>
            </div>

            <Input
              label={draft.type === "PERCENTAGE" ? "Percent off (%)" : "Amount off (₹)"}
              type="number"
              min={0}
              value={draft.value}
              onChange={(e) => set("value", e.target.value)}
            />

            <Input
              label="Minimum order (₹, optional)"
              type="number"
              min={0}
              value={draft.minOrderAmount}
              onChange={(e) => set("minOrderAmount", e.target.value)}
            />

            {draft.type === "PERCENTAGE" && (
              <Input
                label="Max discount cap (₹, optional)"
                type="number"
                min={0}
                value={draft.maxDiscount}
                onChange={(e) => set("maxDiscount", e.target.value)}
              />
            )}

            <Input
              label="Total uses allowed (optional)"
              type="number"
              min={1}
              value={draft.usageLimit}
              onChange={(e) => set("usageLimit", e.target.value)}
            />

            <Input
              label="Expires on (optional)"
              type="date"
              value={draft.expiresAt}
              onChange={(e) => set("expiresAt", e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => set("active", e.target.checked)}
              className="h-4 w-4 accent-izhaana-burgundy"
            />
            Active
          </label>

          <div className="flex gap-3">
            <Button onClick={save} loading={busy}>
              {draft.id ? "Save changes" : "Create coupon"}
            </Button>
            <Button variant="ghost" type="button" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </section>
      )}

      <div className="mt-8 overflow-x-auto">
        <table className="w-full border-collapse bg-white text-sm">
          <thead>
            <tr className="border-b border-izhaana-charcoal/10 text-left">
              <th className="p-3 font-medium">Code</th>
              <th className="p-3 font-medium">Discount</th>
              <th className="p-3 font-medium">Min order</th>
              <th className="p-3 font-medium">Usage</th>
              <th className="p-3 font-medium">Expires</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-izhaana-charcoal/50">
                  No coupons yet.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b border-izhaana-charcoal/5">
                  <td className="p-3 font-mono font-medium">{coupon.code}</td>
                  <td className="p-3">
                    {coupon.type === "PERCENTAGE"
                      ? `${coupon.value}%`
                      : formatPrice(coupon.value)}
                    {coupon.maxDiscount
                      ? ` (max ${formatPrice(coupon.maxDiscount)})`
                      : ""}
                  </td>
                  <td className="p-3">
                    {coupon.minOrderAmount ? formatPrice(coupon.minOrderAmount) : "—"}
                  </td>
                  <td className="p-3">
                    {coupon.usedCount}
                    {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                  </td>
                  <td className="p-3">
                    {coupon.expiresAt
                      ? new Date(coupon.expiresAt).toLocaleDateString("en-IN")
                      : "—"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs ${
                        coupon.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {coupon.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setDraft(toDraft(coupon));
                        }}
                        className="text-izhaana-burgundy hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          send("PATCH", { id: coupon.id, active: !coupon.active })
                        }
                        className="text-izhaana-charcoal/60 hover:underline"
                      >
                        {coupon.active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
