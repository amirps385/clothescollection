import Link from "next/link";
import { formatPrice, parseImages } from "@/lib/utils";
import { ProductImage } from "@/components/shop/ProductImage";
import { QuickAddButton } from "@/components/shop/QuickAddButton";
import { Stars } from "@/components/shop/Stars";
import type { ProductWithVariants } from "@/types";

interface ProductCardProps {
  product: ProductWithVariants;
  /** Aggregated approved-review stats, when the page has loaded them. */
  rating?: { average: number; count: number };
}

export function ProductCard({ product, rating }: ProductCardProps) {
  const images = parseImages(product.images);
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const inStock = totalStock > 0;

  // Any variant can raise the threshold, so respect the highest one set.
  const lowStockAt = Math.max(
    5,
    ...product.variants.map((v) => v.lowStockThreshold)
  );
  const isLow = inStock && totalStock <= lowStockAt;

  const onlyVariant = product.variants.length === 1 ? product.variants[0] : null;
  const onSale = Boolean(product.compareAt && product.compareAt > product.price);

  return (
    <div className="group flex h-full flex-col">
      <Link
        href={`/shop/${product.slug}`}
        className="block transition-transform duration-300 group-hover:-translate-y-1"
      >
        {/* object-contain so supplier photos of any shape are shown whole, not cropped. */}
        <div className="relative aspect-[3/4] overflow-hidden bg-white shadow-sm transition-shadow duration-300 group-hover:shadow-xl">
          {images[0] ? (
            <ProductImage
              src={images[0]}
              alt={product.name}
              fill
              className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-izhaana-charcoal/30">
              <span className="font-serif text-4xl">I</span>
            </div>
          )}

          {onSale && (
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
          {/* Capped at two lines so one long name can't stretch a whole grid row. */}
          <h3 className="line-clamp-2 font-serif text-lg text-izhaana-charcoal transition-colors group-hover:text-izhaana-burgundy">
            {product.name}
          </h3>

          {rating && rating.count > 0 && (
            <span className="flex items-center gap-1.5">
              <Stars rating={rating.average} />
              <span className="text-xs text-izhaana-charcoal/45">
                ({rating.count})
              </span>
            </span>
          )}

          <div className="flex items-center gap-2">
            <span className="font-medium text-izhaana-charcoal">
              {formatPrice(product.price)}
            </span>
            {onSale && (
              <span className="text-sm text-izhaana-charcoal/40 line-through">
                {formatPrice(product.compareAt!)}
              </span>
            )}
          </div>

          <p
            className={
              isLow
                ? "text-xs font-medium text-red-600"
                : "text-xs text-izhaana-charcoal/50"
            }
          >
            {!inStock
              ? "Out of stock"
              : isLow
                ? `Only ${totalStock} left`
                : `${totalStock} in stock`}
          </p>
        </div>
      </Link>

      {/* Outside the Link — a button nested in an anchor is invalid markup.
          mt-auto pins it to the card bottom so buttons line up across a row
          regardless of how many lines the product name wraps to. */}
      <div className="mt-auto pt-3">
        {!inStock ? (
          <span className="block text-center text-xs uppercase tracking-widest text-izhaana-charcoal/35">
            Unavailable
          </span>
        ) : onlyVariant ? (
          <QuickAddButton
            item={{
              variantId: onlyVariant.id,
              productId: product.id,
              productName: product.name,
              variantInfo:
                [onlyVariant.color, onlyVariant.size].filter(Boolean).join(" / ") ||
                "Standard",
              price: product.price,
              gstRate: product.gstRate,
              image: images[0] ?? "",
              maxStock: onlyVariant.stock,
            }}
          />
        ) : (
          <Link
            href={`/shop/${product.slug}`}
            className="block border border-izhaana-burgundy px-5 py-1.5 text-center text-sm font-medium tracking-wide text-izhaana-burgundy transition-colors hover:bg-izhaana-burgundy/5"
          >
            Choose options
          </Link>
        )}
      </div>
    </div>
  );
}
