"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  carrier: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, couponCode, setCoupon, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [couponInput, setCouponInput] = useState(couponCode ?? "");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [taxAmount, setTaxAmount] = useState(0);
  const [form, setForm] = useState({
    email: "",
    shippingName: "",
    shippingLine1: "",
    shippingLine2: "",
    shippingCity: "",
    shippingState: "",
    shippingPostal: "",
    shippingCountry: "IN",
    shippingMethodId: "standard",
  });

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
      return;
    }

    fetch(`/api/shipping?country=IN&subtotal=${subtotal()}`)
      .then((r) => r.json())
      .then((data) => setShippingOptions(data.options ?? []));
  }, [items.length, subtotal, router]);

  useEffect(() => {
    if (form.shippingState) {
      fetch("/api/tax", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            price: i.price,
            quantity: i.quantity,
            gstRate: i.gstRate,
          })),
          shippingState: form.shippingState,
        }),
      })
        .then((r) => r.json())
        .then((data) => setTaxAmount(data.totalTax ?? 0));
    }
  }, [form.shippingState, items]);

  const selectedShipping = shippingOptions.find(
    (o) => o.id === form.shippingMethodId
  ) ?? shippingOptions[0];

  const shippingCost = selectedShipping?.price ?? 0;
  const total = subtotal() - couponDiscount + shippingCost + taxAmount;

  async function applyCoupon() {
    setCouponError("");
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput, subtotal: subtotal() }),
    });
    const data = await res.json();
    if (data.valid) {
      setCouponDiscount(data.discount);
      setCoupon(couponInput);
    } else {
      setCouponError(data.error ?? "Invalid coupon");
      setCouponDiscount(0);
      setCoupon(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({
            variantId: i.variantId,
            productName: i.productName,
            variantInfo: i.variantInfo,
            price: i.price,
            quantity: i.quantity,
            gstRate: i.gstRate,
          })),
          couponCode: couponCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Checkout failed");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else if (data.orderId) {
        clearCart();
        router.push(`/order/success?order=${data.orderNumber}`);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4 border border-izhaana-charcoal/10 bg-white p-6">
            <h2 className="font-serif text-xl">Contact</h2>
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </section>

          <section className="space-y-4 border border-izhaana-charcoal/10 bg-white p-6">
            <h2 className="font-serif text-xl">Shipping Address</h2>
            <Input
              label="Full Name"
              required
              value={form.shippingName}
              onChange={(e) => setForm({ ...form, shippingName: e.target.value })}
            />
            <Input
              label="Address Line 1"
              required
              value={form.shippingLine1}
              onChange={(e) => setForm({ ...form, shippingLine1: e.target.value })}
            />
            <Input
              label="Address Line 2"
              value={form.shippingLine2}
              onChange={(e) => setForm({ ...form, shippingLine2: e.target.value })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="City"
                required
                value={form.shippingCity}
                onChange={(e) => setForm({ ...form, shippingCity: e.target.value })}
              />
              <Input
                label="State"
                required
                value={form.shippingState}
                onChange={(e) => setForm({ ...form, shippingState: e.target.value })}
              />
            </div>
            <Input
              label="Postal Code"
              required
              value={form.shippingPostal}
              onChange={(e) => setForm({ ...form, shippingPostal: e.target.value })}
            />
          </section>

          <section className="space-y-4 border border-izhaana-charcoal/10 bg-white p-6">
            <h2 className="font-serif text-xl">Shipping Method</h2>
            {shippingOptions.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer items-center justify-between border border-izhaana-charcoal/10 p-4 hover:border-izhaana-burgundy"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    value={option.id}
                    checked={form.shippingMethodId === option.id}
                    onChange={() =>
                      setForm({ ...form, shippingMethodId: option.id })
                    }
                  />
                  <div>
                    <p className="font-medium">{option.name}</p>
                    <p className="text-sm text-izhaana-charcoal/50">
                      {option.carrier} · {option.estimatedDays}
                    </p>
                  </div>
                </div>
                <span>{option.price === 0 ? "Free" : formatPrice(option.price)}</span>
              </label>
            ))}
          </section>
        </div>

        <div className="h-fit space-y-4 border border-izhaana-charcoal/10 bg-white p-6">
          <h2 className="font-serif text-xl">Order Summary</h2>

          {items.map((item) => (
            <div key={item.variantId} className="flex justify-between text-sm">
              <span>
                {item.productName} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}

          <div className="border-t border-izhaana-charcoal/10 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal())}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount</span>
                <span>-{formatPrice(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST</span>
              <span>{formatPrice(taxAmount)}</span>
            </div>
            <div className="flex justify-between font-medium text-lg pt-2 border-t">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Coupon code"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              error={couponError}
            />
            <Button type="button" variant="outline" onClick={applyCoupon}>
              Apply
            </Button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Place Order
          </Button>
        </div>
      </form>
    </div>
  );
}
