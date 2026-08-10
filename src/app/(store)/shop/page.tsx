import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/ProductCard";

interface ShopPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export const metadata = { title: "Shop" };

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category, q } = await searchParams;

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(category ? { category: { slug: category } } : {}),
      ...(q ? { name: { contains: q } } : {}),
    },
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-serif text-5xl">Shop</h1>
        <p className="mt-3 text-izhaana-charcoal/60">Explore our curated collection</p>
        <div className="mx-auto mt-5 h-px w-16 bg-izhaana-gold" />
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <a
          href="/shop"
          className={`px-4 py-2 text-sm uppercase tracking-widest transition-colors ${
            !category ? "bg-izhaana-burgundy text-white" : "text-izhaana-charcoal/60 hover:text-izhaana-burgundy"
          }`}
        >
          All
        </a>
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`/shop?category=${cat.slug}`}
            className={`px-4 py-2 text-sm uppercase tracking-widest transition-colors ${
              category === cat.slug
                ? "bg-izhaana-burgundy text-white"
                : "text-izhaana-charcoal/60 hover:text-izhaana-burgundy"
            }`}
          >
            {cat.name}
          </a>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-16 text-center text-izhaana-charcoal/60">No products found.</p>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
