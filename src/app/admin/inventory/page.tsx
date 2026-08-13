import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { InventoryTable } from "@/components/admin/InventoryTable";

export const metadata = { title: "Inventory" };

export default async function AdminInventoryPage() {
  const variants = await prisma.productVariant.findMany({
    include: { product: { select: { id: true, name: true } } },
    // Emptiest first — the rows that need attention are at the top.
    orderBy: [{ stock: "asc" }, { sku: "asc" }],
  });

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl">Inventory</h1>
          <p className="mt-1 text-sm text-izhaana-charcoal/50">
            Adjust stock counts and set when an item should warn as low.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="text-sm text-izhaana-burgundy hover:underline"
        >
          Add or remove products →
        </Link>
      </div>

      <InventoryTable
        rows={variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          productId: v.product.id,
          productName: v.product.name,
          variantLabel:
            [v.color, v.size].filter(Boolean).join(" / ") || "Standard",
          stock: v.stock,
          lowStockThreshold: v.lowStockThreshold,
        }))}
      />
    </div>
  );
}
