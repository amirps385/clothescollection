import { CartContent } from "@/components/cart/CartContent";

export const metadata = { title: "Shopping Cart" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl">Shopping Cart</h1>
      <div className="mt-8">
        <CartContent />
      </div>
    </div>
  );
}
