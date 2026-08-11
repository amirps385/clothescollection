"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCartStore, type CartItem } from "@/store/cart";
import { Button } from "@/components/ui/Button";

/**
 * Card-level "add to cart". Only rendered for products with a single
 * colour/design option — anything with a choice to make links to the detail
 * page instead, so we never guess which variant the shopper wanted.
 */
export function QuickAddButton({ item }: { item: Omit<CartItem, "quantity"> }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  function add() {
    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={add}
      className="w-full"
      aria-label={`Add ${item.productName} to cart`}
    >
      {added ? (
        <>
          <Check size={15} className="mr-1.5" />
          Added
        </>
      ) : (
        <>
          <ShoppingBag size={15} className="mr-1.5" />
          Add to cart
        </>
      )}
    </Button>
  );
}
