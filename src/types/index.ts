import { Prisma } from "@prisma/client";

export type ProductWithVariants = Prisma.ProductGetPayload<{
  include: { category: true; variants: true };
}>;

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: { items: true; coupon: true };
}>;

export interface CheckoutFormData {
  email: string;
  shippingName: string;
  shippingLine1: string;
  shippingLine2?: string;
  shippingCity: string;
  shippingState: string;
  shippingPostal: string;
  shippingCountry: string;
  shippingMethodId: string;
  couponCode?: string;
}
