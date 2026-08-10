import Link from "next/link";
import { formatPrice, parseImages } from "@/lib/utils";
import { ProductImage } from "@/components/shop/ProductImage";
import type { ProductWithVariants } from "@/types";

interface ProductCardProps {
  product: ProductWithVariants;
}

export function ProductCard({ product }: ProductCardProps) {
  const images = parseImages(product.images);
  const lowestPrice = product.price;
  const inStock = product.variants.some((v) => v.stock > 0);

  return (
    <Link href={`/shop/${product.slug}`} className="group block transition-transform duration-300 hover:-translate-y-1">
      <div className="relative aspect-[3/4] overflow-hidden bg-izhaana-cream shadow-sm transition-shadow duration-300 group-hover:shadow-xl">
        {images[0] ? (
          <ProductImage
            src={images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-izhaana-charcoal/30">
            <span className="font-serif text-4xl">I</span>
          </div>
        )}
        {product.compareAt && product.compareAt > product.price && (
          <span className="absolute left-3 top-3 bg-izhaana-burgundy px-2 py-1 text-xs font-medium text-white">
            Sale
          </span>
        )}
        {!inStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-medium text-white">
            Sold Out
          </span>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-xs uppercase tracking-widest text-izhaana-charcoal/50">
          {product.category.name}
        </p>
        <h3 className="font-serif text-lg text-izhaana-charcoal group-hover:text-izhaana-burgundy transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-medium text-izhaana-charcoal">{formatPrice(lowestPrice)}</span>
          {product.compareAt && product.compareAt > product.price && (
            <span className="text-sm text-izhaana-charcoal/40 line-through">
              {formatPrice(product.compareAt)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
