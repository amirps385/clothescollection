"use client";

import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ProductImage } from "@/components/shop/ProductImage";
import { Minus, Plus, Trash2 } from "lucide-react";

export function CartContent() {
  const { items, updateQuantity, removeItem, subtotal } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-izhaana-charcoal/60">Your cart is empty</p>
        <Link href="/shop" className="mt-4 inline-block">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex gap-4 border border-izhaana-charcoal/10 bg-white p-4"
          >
            <div className="relative h-24 w-20 flex-shrink-0 bg-izhaana-cream">
              {item.image ? (
                <ProductImage src={item.image} alt={item.productName} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center font-serif text-izhaana-charcoal/20">I</div>
              )}
            </div>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h3 className="font-serif text-lg">{item.productName}</h3>
                <p className="text-sm text-izhaana-charcoal/50">{item.variantInfo}</p>
                <p className="mt-1 font-medium">{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center border border-izhaana-charcoal/20">
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    className="px-2 py-1 hover:bg-izhaana-cream"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-3 text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    className="px-2 py-1 hover:bg-izhaana-cream"
                    disabled={item.quantity >= item.maxStock}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.variantId)}
                  className="text-izhaana-charcoal/40 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-fit border border-izhaana-charcoal/10 bg-white p-6">
        <h2 className="font-serif text-xl">Order Summary</h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-izhaana-charcoal/60">Subtotal</span>
            <span>{formatPrice(subtotal())}</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-izhaana-charcoal/40">
          Shipping & taxes calculated at checkout
        </p>
        <Link href="/checkout" className="mt-6 block">
          <Button className="w-full" size="lg">Proceed to Checkout</Button>
        </Link>
      </div>
    </div>
  );
}
