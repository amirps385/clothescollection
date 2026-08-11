"use client";

import { useState } from "react";
import { formatPrice, parseImages } from "@/lib/utils";
import { ProductImage } from "@/components/shop/ProductImage";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";
import type { ProductWithVariants } from "@/types";

interface ProductDetailProps {
  product: ProductWithVariants;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const images = parseImages(product.images);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const sizes = [...new Set(product.variants.map((v) => v.size).filter(Boolean))];
  const colors = [...new Set(product.variants.map((v) => v.color).filter(Boolean))];

  function selectVariant(size?: string | null, color?: string | null) {
    const variant = product.variants.find(
      (v) =>
        (!size || v.size === size) &&
        (!color || v.color === color)
    );
    if (variant) setSelectedVariant(variant);
  }

  function handleAddToCart() {
    if (!selectedVariant || selectedVariant.stock <= 0) return;

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      variantInfo: [selectedVariant.size, selectedVariant.color].filter(Boolean).join(" / "),
      price: product.price,
      gstRate: product.gstRate,
      image: images[0] ?? "",
      maxStock: selectedVariant.stock,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
      <div>
        <div className="relative aspect-[3/4] bg-white">
          {images[selectedImage] ? (
            <ProductImage
              src={images[selectedImage]}
              alt={product.name}
              fill
              className="object-contain p-4"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center font-serif text-6xl text-izhaana-charcoal/20">
              I
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="mt-4 flex gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`relative h-20 w-16 border-2 ${
                  selectedImage === i ? "border-izhaana-burgundy" : "border-transparent"
                }`}
              >
                <ProductImage src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-sm uppercase tracking-widest text-izhaana-charcoal/50">
          {product.category.name}
        </p>
        <h1 className="mt-2 font-serif text-4xl">{product.name}</h1>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-2xl font-medium">{formatPrice(product.price)}</span>
          {product.compareAt && product.compareAt > product.price && (
            <span className="text-lg text-izhaana-charcoal/40 line-through">
              {formatPrice(product.compareAt)}
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-izhaana-charcoal/40">
          Inclusive of GST ({product.gstRate}%)
          {product.hsnCode && ` · HSN: ${product.hsnCode}`}
        </p>

        <p className="mt-6 text-izhaana-charcoal/70 leading-relaxed">{product.description}</p>

        {sizes.length > 0 && (
          <div className="mt-8">
            <p className="text-sm font-medium uppercase tracking-widest">Size</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => selectVariant(size, selectedVariant?.color)}
                  className={`min-w-[48px] border px-4 py-2 text-sm transition-colors ${
                    selectedVariant?.size === size
                      ? "border-izhaana-burgundy bg-izhaana-burgundy text-white"
                      : "border-izhaana-charcoal/20 hover:border-izhaana-burgundy"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {colors.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium uppercase tracking-widest">Color</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => selectVariant(selectedVariant?.size, color)}
                  className={`border px-4 py-2 text-sm transition-colors ${
                    selectedVariant?.color === color
                      ? "border-izhaana-burgundy bg-izhaana-burgundy text-white"
                      : "border-izhaana-charcoal/20 hover:border-izhaana-burgundy"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="mt-4 text-sm text-izhaana-charcoal/50">
          {selectedVariant && selectedVariant.stock > 0
            ? `${selectedVariant.stock} in stock`
            : "Out of stock"}
        </p>

        <Button
          className="mt-8 w-full sm:w-auto"
          size="lg"
          onClick={handleAddToCart}
          disabled={!selectedVariant || selectedVariant.stock <= 0}
        >
          {added ? "Added to Cart!" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
