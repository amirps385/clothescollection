import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isBlobConfigured } from "@/lib/blob";
import { ProductForm } from "@/components/admin/ProductForm";
import { emptyProduct } from "@/components/admin/product-draft";

export const metadata = { title: "New Product" };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  if (categories.length === 0) redirect("/admin/products");

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-izhaana-charcoal/60 hover:text-izhaana-burgundy"
      >
        <ArrowLeft size={15} />
        Back to products
      </Link>

      <h1 className="mt-3 mb-8 font-serif text-3xl">New product</h1>

      <ProductForm
        initial={emptyProduct(categories[0].id)}
        categories={categories}
        uploadsEnabled={isBlobConfigured()}
      />
    </div>
  );
}
