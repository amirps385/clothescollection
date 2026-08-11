import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Products</h1>
          <p className="mt-1 text-sm text-izhaana-charcoal/50">
            {products.length} products
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>Add Product</Button>
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full border-collapse bg-white text-sm">
          <thead>
            <tr className="border-b border-izhaana-charcoal/10 text-left">
              <th className="p-3 font-medium">Product</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Options</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium">Stock</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
              return (
                <tr key={product.id} className="border-b border-izhaana-charcoal/5">
                  <td className="p-3">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-medium hover:text-izhaana-burgundy"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-izhaana-charcoal/50">{product.slug}</p>
                  </td>
                  <td className="p-3">{product.category.name}</td>
                  <td className="p-3">{product.variants.length}</td>
                  <td className="p-3">{formatPrice(product.price)}</td>
                  <td className="p-3">
                    <span className={totalStock === 0 ? "text-red-600" : undefined}>
                      {totalStock}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs ${
                        product.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {product.active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-izhaana-burgundy hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
