"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Minus, Plus, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InventoryRow {
  id: string;
  sku: string;
  productId: string;
  productName: string;
  variantLabel: string;
  stock: number;
  lowStockThreshold: number;
}

type Filter = "all" | "low" | "out";
type RowState = { saving: boolean; saved: boolean; error: string | null };

export function InventoryTable({ rows }: { rows: InventoryRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  // Local copy so edits show immediately; the server stays the source of truth.
  const [draft, setDraft] = useState<Record<string, { stock: number; threshold: number }>>(
    () =>
      Object.fromEntries(
        rows.map((r) => [r.id, { stock: r.stock, threshold: r.lowStockThreshold }])
      )
  );
  const [state, setState] = useState<Record<string, RowState>>({});

  const counts = useMemo(() => {
    let low = 0;
    let out = 0;
    let units = 0;
    for (const r of rows) {
      const stock = draft[r.id]?.stock ?? r.stock;
      const threshold = draft[r.id]?.threshold ?? r.lowStockThreshold;
      units += stock;
      if (stock === 0) out += 1;
      else if (stock <= threshold) low += 1;
    }
    return { low, out, units };
  }, [rows, draft]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const stock = draft[r.id]?.stock ?? r.stock;
      const threshold = draft[r.id]?.threshold ?? r.lowStockThreshold;

      if (filter === "out" && stock !== 0) return false;
      if (filter === "low" && !(stock > 0 && stock <= threshold)) return false;

      if (!q) return true;
      return (
        r.productName.toLowerCase().includes(q) ||
        r.sku.toLowerCase().includes(q) ||
        r.variantLabel.toLowerCase().includes(q)
      );
    });
  }, [rows, query, filter, draft]);

  function setRow(id: string, patch: Partial<{ stock: number; threshold: number }>) {
    setDraft((d) => ({ ...d, [id]: { ...d[id], ...patch } }));
    // Any edit clears a previous saved/error badge for that row.
    setState((s) => ({ ...s, [id]: { saving: false, saved: false, error: null } }));
  }

  async function save(id: string) {
    const value = draft[id];
    setState((s) => ({ ...s, [id]: { saving: true, saved: false, error: null } }));

    const res = await fetch("/api/admin/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        variantId: id,
        stock: value.stock,
        lowStockThreshold: value.threshold,
      }),
    }).catch(() => null);

    if (!res || !res.ok) {
      const message = res
        ? ((await res.json().catch(() => ({}))).error ?? "Couldn't save")
        : "Network error";
      // Always clears the spinner — a failed save used to hang on "Loading…".
      setState((s) => ({ ...s, [id]: { saving: false, saved: false, error: message } }));
      return;
    }

    setState((s) => ({ ...s, [id]: { saving: false, saved: true, error: null } }));
    router.refresh();
  }

  const filters: { key: Filter; label: string; count?: number }[] = [
    { key: "all", label: `All (${rows.length})` },
    { key: "low", label: `Low stock (${counts.low})` },
    { key: "out", label: `Out of stock (${counts.out})` },
  ];

  return (
    <div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Units in stock", value: counts.units },
          { label: "Low stock", value: counts.low, warn: counts.low > 0 },
          { label: "Out of stock", value: counts.out, warn: counts.out > 0 },
        ].map((s) => (
          <div
            key={s.label}
            className="border border-izhaana-charcoal/10 bg-white p-4"
          >
            <p className="text-xs uppercase tracking-widest text-izhaana-charcoal/50">
              {s.label}
            </p>
            <p
              className={cn(
                "mt-1 font-serif text-2xl",
                s.warn && "text-red-600"
              )}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[14rem]">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-izhaana-charcoal/35"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product, SKU or option…"
            aria-label="Search inventory"
            className="w-full border border-izhaana-charcoal/20 bg-white py-2 pl-9 pr-3 text-sm focus:border-izhaana-burgundy focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "border px-3 py-1.5 text-sm transition-colors",
                filter === f.key
                  ? "border-izhaana-burgundy bg-izhaana-burgundy text-white"
                  : "border-izhaana-charcoal/20 hover:border-izhaana-burgundy"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 text-center text-izhaana-charcoal/55">
          Nothing matches that.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse bg-white text-sm">
            <thead>
              <tr className="border-b border-izhaana-charcoal/10 text-left">
                <th className="p-3 font-medium">Product</th>
                <th className="p-3 font-medium">SKU</th>
                <th className="p-3 font-medium">In stock</th>
                <th className="p-3 font-medium">Warn at</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => {
                const value = draft[row.id];
                const rowState = state[row.id];
                const dirty =
                  value.stock !== row.stock || value.threshold !== row.lowStockThreshold;
                const isOut = value.stock === 0;
                const isLow = !isOut && value.stock <= value.threshold;

                return (
                  <tr key={row.id} className="border-b border-izhaana-charcoal/5">
                    <td className="p-3">
                      <Link
                        href={`/admin/products/${row.productId}`}
                        className="font-medium hover:text-izhaana-burgundy"
                      >
                        {row.productName}
                      </Link>
                      <p className="text-xs text-izhaana-charcoal/50">
                        {row.variantLabel}
                        {isOut && (
                          <span className="ml-2 text-red-600">Out of stock</span>
                        )}
                        {isLow && <span className="ml-2 text-amber-700">Low</span>}
                      </p>
                    </td>

                    <td className="p-3 font-mono text-xs text-izhaana-charcoal/70">
                      {row.sku}
                    </td>

                    <td className="p-3">
                      <div className="flex items-center">
                        <button
                          type="button"
                          aria-label="Decrease stock"
                          onClick={() =>
                            setRow(row.id, { stock: Math.max(0, value.stock - 1) })
                          }
                          className="border border-izhaana-charcoal/20 px-2 py-1 hover:bg-izhaana-cream"
                        >
                          <Minus size={13} />
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={value.stock}
                          onChange={(e) =>
                            setRow(row.id, {
                              stock: Math.max(0, Number(e.target.value) || 0),
                            })
                          }
                          aria-label={`Stock for ${row.sku}`}
                          className={cn(
                            "w-16 border-y border-izhaana-charcoal/20 px-2 py-1 text-center",
                            isOut && "text-red-600",
                            isLow && "text-amber-700"
                          )}
                        />
                        <button
                          type="button"
                          aria-label="Increase stock"
                          onClick={() => setRow(row.id, { stock: value.stock + 1 })}
                          className="border border-izhaana-charcoal/20 px-2 py-1 hover:bg-izhaana-cream"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </td>

                    <td className="p-3">
                      <input
                        type="number"
                        min={0}
                        value={value.threshold}
                        onChange={(e) =>
                          setRow(row.id, {
                            threshold: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                        aria-label={`Low stock threshold for ${row.sku}`}
                        className="w-16 border border-izhaana-charcoal/20 px-2 py-1 text-center"
                      />
                    </td>

                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        {rowState?.error && (
                          <span className="text-xs text-red-600">
                            {rowState.error}
                          </span>
                        )}
                        {rowState?.saved && !dirty && (
                          <span className="flex items-center gap-1 text-xs text-green-700">
                            <Check size={13} />
                            Saved
                          </span>
                        )}
                        <button
                          type="button"
                          disabled={!dirty || rowState?.saving}
                          onClick={() => save(row.id)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors",
                            dirty
                              ? "bg-izhaana-burgundy text-white hover:bg-izhaana-burgundy/90"
                              : "cursor-not-allowed border border-izhaana-charcoal/15 text-izhaana-charcoal/35"
                          )}
                        >
                          {rowState?.saving && (
                            <Loader2 size={13} className="animate-spin" />
                          )}
                          Save
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
