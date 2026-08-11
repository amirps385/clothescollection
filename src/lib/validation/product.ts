import { z } from "zod";

export const variantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().trim().min(1, "SKU is required"),
  /** For this catalog a variant is a colour/design option, not a clothing size. */
  color: z.string().trim().optional().default(""),
  /** Optional secondary axis, e.g. saree length ("5.5m"). */
  size: z.string().trim().optional().default(""),
  image: z.string().trim().optional().default(""),
  stock: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
});

export const productPayloadSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  compareAt: z.coerce
    .number()
    .min(0)
    .nullish()
    .transform((v) => (v ? v : null)),
  categoryId: z.string().trim().min(1, "Category is required"),
  images: z.array(z.string().trim().min(1)).default([]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  gstRate: z.coerce.number().min(0).max(100).default(5),
  hsnCode: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null)),
  variants: z.array(variantSchema).min(1, "Add at least one variant"),
});

export type ProductPayload = z.infer<typeof productPayloadSchema>;
export type VariantPayload = z.infer<typeof variantSchema>;
