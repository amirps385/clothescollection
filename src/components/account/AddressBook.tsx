"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, X, Star } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface AddressRow {
  id: string;
  label: string;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface Draft {
  id?: string;
  label: string;
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

const emptyDraft = (): Draft => ({
  label: "Home",
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  isDefault: false,
});

const toDraft = (a: AddressRow): Draft => ({
  id: a.id,
  label: a.label,
  fullName: a.fullName,
  line1: a.line1,
  line2: a.line2 ?? "",
  city: a.city,
  state: a.state,
  postalCode: a.postalCode,
  isDefault: a.isDefault,
});

export function AddressBook({ addresses }: { addresses: AddressRow[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }

  async function send(method: "POST" | "PUT" | "DELETE", body: unknown) {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/account/addresses", {
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

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (await send(draft.id ? "PUT" : "POST", draft)) setDraft(null);
  }

  return (
    <div>
      {error && (
        <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {draft ? (
        <form
          onSubmit={save}
          className="space-y-5 border border-izhaana-charcoal/10 bg-white p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">
              {draft.id ? "Edit address" : "Add a new address"}
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

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Label"
              value={draft.label}
              onChange={(e) => set("label", e.target.value)}
              placeholder="Home, Office…"
            />
            <Input
              label="Full name"
              value={draft.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              placeholder="Recipient's name"
            />
          </div>

          <Input
            label="Address"
            value={draft.line1}
            onChange={(e) => set("line1", e.target.value)}
            placeholder="House / flat, street"
          />
          <Input
            label="Landmark / area (optional)"
            value={draft.line2}
            onChange={(e) => set("line2", e.target.value)}
          />

          <div className="grid gap-5 sm:grid-cols-3">
            <Input
              label="City"
              value={draft.city}
              onChange={(e) => set("city", e.target.value)}
            />
            <Input
              label="State"
              value={draft.state}
              onChange={(e) => set("state", e.target.value)}
            />
            <Input
              label="PIN code"
              value={draft.postalCode}
              onChange={(e) => set("postalCode", e.target.value)}
              placeholder="452001"
              inputMode="numeric"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.isDefault}
              onChange={(e) => set("isDefault", e.target.checked)}
              className="h-4 w-4 accent-izhaana-burgundy"
            />
            Use as my default delivery address
          </label>

          <div className="flex gap-3">
            <Button type="submit" loading={busy}>
              {draft.id ? "Save address" : "Add address"}
            </Button>
            <Button variant="ghost" type="button" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setDraft(emptyDraft())}>
          <Plus size={15} className="mr-1.5" />
          Add address
        </Button>
      )}

      {addresses.length === 0 ? (
        !draft && (
          <p className="mt-8 text-izhaana-charcoal/60">
            You haven&apos;t saved any addresses yet.
          </p>
        )
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div
              key={a.id}
              className="border border-izhaana-charcoal/10 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs uppercase tracking-widest text-izhaana-charcoal/50">
                  {a.label}
                </p>
                {a.isDefault && (
                  <span className="flex items-center gap-1 text-xs text-izhaana-burgundy">
                    <Star size={12} fill="currentColor" />
                    Default
                  </span>
                )}
              </div>

              <p className="mt-2 font-medium">{a.fullName}</p>
              <p className="mt-1 text-sm leading-relaxed text-izhaana-charcoal/70">
                {a.line1}
                {a.line2 ? `, ${a.line2}` : ""}
                <br />
                {a.city}, {a.state} {a.postalCode}
              </p>

              <div className="mt-4 flex gap-4 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setDraft(toDraft(a));
                  }}
                  className="text-izhaana-burgundy hover:underline"
                >
                  Edit
                </button>
                {!a.isDefault && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => send("PUT", { ...toDraft(a), isDefault: true })}
                    className="text-izhaana-charcoal/60 hover:underline"
                  >
                    Make default
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => send("DELETE", { id: a.id })}
                  className="ml-auto text-izhaana-charcoal/40 hover:text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
