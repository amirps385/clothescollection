import { prisma } from "@/lib/prisma";
import { InventoryUpdater } from "@/components/admin/InventoryUpdater";

export const metadata = { title: "Inventory" };

export default async function AdminInventoryPage() {
  const variants = await prisma.productVariant.findMany({
    include: { product: true },
    orderBy: { stock: "asc" },
  });

  return (
    <div>
      <h1 className="font-serif text-3xl">Inventory Management</h1>
      <p className="mt-1 text-sm text-izhaana-charcoal/50">
        Manage stock levels across all product variants
      </p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full border-collapse bg-white text-sm">
          <thead>
            <tr className="border-b border-izhaana-charcoal/10 text-left">
              <th className="p-3 font-medium">SKU</th>
              <th className="p-3 font-medium">Product</th>
              <th className="p-3 font-medium">Variant</th>
              <th className="p-3 font-medium">Stock</th>
              <th className="p-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => (
              <tr key={variant.id} className="border-b border-izhaana-charcoal/5">
                <td className="p-3 font-mono text-xs">{variant.sku}</td>
                <td className="p-3">{variant.product.name}</td>
                <td className="p-3">
                  {[variant.size, variant.color].filter(Boolean).join(" / ")}
                </td>
                <td className="p-3">
                  <span
                    className={
                      variant.stock <= variant.lowStockThreshold
                        ? "font-medium text-red-600"
                        : ""
                    }
                  >
                    {variant.stock}
                  </span>
                </td>
                <td className="p-3">
                  <InventoryUpdater variantId={variant.id} currentStock={variant.stock} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
