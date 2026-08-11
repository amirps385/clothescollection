/**
 * Shared between the admin Server Components and the client ProductForm.
 * Kept out of the "use client" module so server pages can build a blank draft —
 * exports of a client module are client references and cannot be called on the server.
 */

export interface VariantDraft {
  id?: string;
  sku: string;
  color: string;
  size: string;
  image: string;
  stock: number;
  lowStockThreshold: number;
}

export interface ProductDraft {
  id?: string;
  name: string;
  description: string;
  price: number;
  compareAt: number | null;
  categoryId: string;
  images: string[];
  featured: boolean;
  active: boolean;
  gstRate: number;
  hsnCode: string;
  variants: VariantDraft[];
}

export const blankVariant = (): VariantDraft => ({
  sku: "",
  color: "",
  size: "",
  image: "",
  stock: 0,
  lowStockThreshold: 5,
});

export function emptyProduct(categoryId: string): ProductDraft {
  return {
    name: "",
    description: "",
    price: 0,
    compareAt: null,
    categoryId,
    images: [],
    featured: false,
    active: true,
    gstRate: 5,
    hsnCode: "",
    variants: [blankVariant()],
  };
}
