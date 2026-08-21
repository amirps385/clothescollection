import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getRatingsFor } from "@/lib/reviews";
import { ProductCard } from "@/components/shop/ProductCard";
import { SearchBox } from "@/components/shop/SearchBox";

interface ShopPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export const metadata = { title: "Shop" };

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category, q } = await searchParams;
  const term = q?.trim();

  const where: Prisma.ProductWhereInput = {
    active: true,
    ...(category ? { category: { slug: category } } : {}),
    // `mode: "insensitive"` is essential, not a nicety: Postgres LIKE is
    // case-sensitive, so the plain `contains` this used to have returned zero
    // results for "saree" while matching "Saree". Searching description and
    // category too means "cotton" or "silk" find things by material, which is
    // how people actually shop for these.
    ...(term
      ? {
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
            { category: { name: { contains: term, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const products = await prisma.product.findMany({
    where,
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const ratings = await getRatingsFor(products.map((p) => p.id));

  // Category chips keep the active search, so filtering down a set of results
  // doesn't silently throw the search term away.
  const categoryHref = (slug?: string) => {
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    if (term) params.set("q", term);
    const query = params.toString();
    return query ? `/shop?${query}` : "/shop";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-serif text-5xl">Shop</h1>
        <p className="mt-3 text-izhaana-charcoal/60">Explore our curated collection</p>
        <div className="mx-auto mt-5 h-px w-16 bg-izhaana-gold" />
      </div>

      <div className="mx-auto mt-8 max-w-md">
        <SearchBox variant="inline" defaultValue={term ?? ""} />
      </div>

      {term && (
        <p className="mt-4 text-center text-sm text-izhaana-charcoal/60">
          {products.length} {products.length === 1 ? "result" : "results"} for
          <span className="text-izhaana-charcoal"> “{term}”</span>
          {" · "}
          <Link
            href={category ? `/shop?category=${category}` : "/shop"}
            className="text-izhaana-burgundy hover:underline"
          >
            Clear search
          </Link>
        </p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Link
          href={categoryHref()}
          className={`px-4 py-2 text-sm uppercase tracking-widest transition-colors ${
            !category ? "bg-izhaana-burgundy text-white" : "text-izhaana-charcoal/60 hover:text-izhaana-burgundy"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={categoryHref(cat.slug)}
            className={`px-4 py-2 text-sm uppercase tracking-widest transition-colors ${
              category === cat.slug
                ? "bg-izhaana-burgundy text-white"
                : "text-izhaana-charcoal/60 hover:text-izhaana-burgundy"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-izhaana-charcoal/60">
            {term
              ? `Nothing matched “${term}”.`
              : "No products found."}
          </p>
          {term && (
            <Link
              href="/shop"
              className="mt-4 inline-block border border-izhaana-burgundy px-5 py-2 text-sm uppercase tracking-widest text-izhaana-burgundy transition-colors hover:bg-izhaana-burgundy hover:text-white"
            >
              Browse everything
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              rating={ratings[product.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
