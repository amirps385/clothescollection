import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";
import { isBlobConfigured } from "@/lib/blob";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Edit Product" };

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { variants: { orderBy: { position: "asc" } } },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-izhaana-charcoal/60 hover:text-izhaana-burgundy"
      >
        <ArrowLeft size={15} />
        Back to products
      </Link>

      <h1 className="mt-3 mb-8 font-serif text-3xl">{product.name}</h1>

      <ProductForm
        categories={categories}
        uploadsEnabled={isBlobConfigured()}
        initial={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          compareAt: product.compareAt,
          categoryId: product.categoryId,
          images: parseImages(product.images),
          featured: product.featured,
          active: product.active,
          gstRate: product.gstRate,
          hsnCode: product.hsnCode ?? "",
          variants: product.variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            color: v.color ?? "",
            size: v.size ?? "",
            image: v.image ?? "",
            stock: v.stock,
            lowStockThreshold: v.lowStockThreshold,
          })),
        }}
      />
    </div>
  );
}
