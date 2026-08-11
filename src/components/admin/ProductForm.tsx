"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageField } from "@/components/admin/ImageField";
import {
  blankVariant,
  type ProductDraft,
  type VariantDraft,
} from "@/components/admin/product-draft";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  initial: ProductDraft;
  categories: CategoryOption[];
  uploadsEnabled: boolean;
}

export function ProductForm({ initial, categories, uploadsEnabled }: ProductFormProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<ProductDraft>(initial);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(draft.id);

  function set<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function setVariant(index: number, patch: Partial<VariantDraft>) {
    setDraft((d) => ({
      ...d,
      variants: d.variants.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    }));
  }

  function addVariant() {
    setDraft((d) => ({ ...d, variants: [...d.variants, blankVariant()] }));
  }

  function removeVariant(index: number) {
    setDraft((d) => ({
      ...d,
      variants: d.variants.filter((_, i) => i !== index),
    }));
  }

  async function save() {
    setError(null);

    if (!draft.name.trim()) return setError("Product name is required.");
    if (!draft.description.trim()) return setError("Description is required.");
    if (!draft.categoryId) return setError("Pick a category.");
    if (draft.variants.length === 0)
      return setError("Add at least one colour/design option.");

    const blankSku = draft.variants.findIndex((v) => !v.sku.trim());
    if (blankSku !== -1)
      return setError(`Option ${blankSku + 1} needs a product code (SKU).`);

    const skus = draft.variants.map((v) => v.sku.trim().toLowerCase());
    if (new Set(skus).size !== skus.length)
      return setError("Each option needs a different product code (SKU).");

    setSaving(true);
    const res = await fetch("/api/admin/products", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not save. Please try again.");
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  async function remove() {
    if (
      !confirm(
        "Delete this product? If it appears in past orders it will be hidden from the shop instead of deleted."
      )
    )
      return;

    setDeleting(true);
    const res = await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: draft.id }),
    });
    setDeleting(false);

    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      setError("Could not delete this product.");
    }
  }

  const totalStock = draft.variants.reduce((s, v) => s + (Number(v.stock) || 0), 0);

  return (
    <div className="space-y-8 pb-16">
      {error && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="space-y-5 border border-izhaana-charcoal/10 bg-white p-6">
        <h2 className="font-serif text-xl">Product details</h2>

        <Input
          id="name"
          label="Product name"
          value={draft.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Handprinted Silk Blend Saree"
        />

        <div className="space-y-1.5">
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Fabric, work, occasion, care instructions…"
            className="w-full border border-izhaana-charcoal/20 bg-white px-4 py-2.5 text-sm focus:border-izhaana-burgundy focus:outline-none focus:ring-1 focus:ring-izhaana-burgundy"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="category" className="block text-sm font-medium">
              Category
            </label>
            <select
              id="category"
              value={draft.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
              className="w-full border border-izhaana-charcoal/20 bg-white px-4 py-2.5 text-sm focus:border-izhaana-burgundy focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            id="hsn"
            label="HSN code (optional)"
            value={draft.hsnCode}
            onChange={(e) => set("hsnCode", e.target.value)}
            placeholder="e.g. 5407"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Input
            id="price"
            label="Selling price (₹)"
            type="number"
            min={0}
            value={draft.price}
            onChange={(e) => set("price", Number(e.target.value))}
          />
          <Input
            id="compareAt"
            label="Was / MRP (₹, optional)"
            type="number"
            min={0}
            value={draft.compareAt ?? ""}
            onChange={(e) =>
              set("compareAt", e.target.value ? Number(e.target.value) : null)
            }
          />
          <div className="space-y-1.5">
            <label htmlFor="gst" className="block text-sm font-medium">
              GST rate
            </label>
            <select
              id="gst"
              value={draft.gstRate}
              onChange={(e) => set("gstRate", Number(e.target.value))}
              className="w-full border border-izhaana-charcoal/20 bg-white px-4 py-2.5 text-sm focus:border-izhaana-burgundy focus:outline-none"
            >
              <option value={0}>0%</option>
              <option value={5}>5% (textiles under ₹1,000)</option>
              <option value={12}>12% (textiles over ₹1,000)</option>
              <option value={18}>18%</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 pt-1">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => set("active", e.target.checked)}
              className="h-4 w-4 accent-izhaana-burgundy"
            />
            Visible in shop
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="h-4 w-4 accent-izhaana-burgundy"
            />
            Show on homepage
          </label>
        </div>
      </section>

      <section className="space-y-4 border border-izhaana-charcoal/10 bg-white p-6">
        <div>
          <h2 className="font-serif text-xl">Photos</h2>
          <p className="mt-1 text-sm text-izhaana-charcoal/60">
            The first photo is used on product cards.
          </p>
        </div>
        <ImageField
          value={draft.images}
          onChange={(images) => set("images", images)}
          uploadsEnabled={uploadsEnabled}
          multiple
        />
      </section>

      <section className="space-y-4 border border-izhaana-charcoal/10 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl">Colour / design options</h2>
            <p className="mt-1 text-sm text-izhaana-charcoal/60">
              Each option has its own stock count. Total in stock: {totalStock}
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addVariant}>
            <Plus size={15} className="mr-1.5" />
            Add option
          </Button>
        </div>

        <div className="space-y-4">
          {draft.variants.map((variant, i) => (
            <div
              key={variant.id ?? `new-${i}`}
              className="border border-izhaana-charcoal/10 bg-izhaana-cream/40 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-izhaana-charcoal/50">
                  <GripVertical size={14} />
                  Option {i + 1}
                </span>
                {draft.variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="text-izhaana-charcoal/40 transition-colors hover:text-red-600"
                    aria-label={`Remove option ${i + 1}`}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Input
                  label="Colour / design"
                  value={variant.color}
                  onChange={(e) => setVariant(i, { color: e.target.value })}
                  placeholder="e.g. Maroon"
                />
                <Input
                  label="Length / size (optional)"
                  value={variant.size}
                  onChange={(e) => setVariant(i, { size: e.target.value })}
                  placeholder="e.g. 6.5m"
                />
                <Input
                  label="Product code (SKU)"
                  value={variant.sku}
                  onChange={(e) => setVariant(i, { sku: e.target.value })}
                  placeholder="e.g. SAR-MAR-65"
                />
                <Input
                  label="In stock"
                  type="number"
                  min={0}
                  value={variant.stock}
                  onChange={(e) => setVariant(i, { stock: Number(e.target.value) })}
                />
              </div>

              <div className="mt-4">
                <p className="mb-2 text-sm font-medium">Photo for this option</p>
                <ImageField
                  value={variant.image ? [variant.image] : []}
                  onChange={(imgs) => setVariant(i, { image: imgs[0] ?? "" })}
                  uploadsEnabled={uploadsEnabled}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={save} loading={saving} size="lg">
          {isEdit ? "Save changes" : "Create product"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/products")}
          type="button"
        >
          Cancel
        </Button>
        {isEdit && (
          <Button
            variant="danger"
            onClick={remove}
            loading={deleting}
            type="button"
            className="ml-auto"
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
