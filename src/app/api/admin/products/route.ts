import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { productPayloadSchema } from "@/lib/validation/product";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

/** Ensure the slug is unique, appending -2, -3, … when the base is taken. */
async function uniqueSlug(name: string, excludeProductId?: string) {
  const base = slugify(name) || "product";
  let candidate = base;
  let n = 1;

  for (;;) {
    const clash = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!clash || clash.id === excludeProductId) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = productPayloadSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid product", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { variants, images, ...data } = parsed.data;

  const product = await prisma.product.create({
    data: {
      ...data,
      slug: await uniqueSlug(data.name),
      images: JSON.stringify(images),
      variants: {
        create: variants.map((v, i) => ({
          sku: v.sku,
          color: v.color || null,
          size: v.size || null,
          image: v.image || null,
          stock: v.stock,
          lowStockThreshold: v.lowStockThreshold,
          position: i,
        })),
      },
    },
    include: { variants: true },
  });

  return NextResponse.json({ product });
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { id } = body;
  if (typeof id !== "string" || !id) {
    return NextResponse.json({ error: "Missing product id" }, { status: 400 });
  }

  const parsed = productPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid product", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { variants, images, ...data } = parsed.data;

  const existing = await prisma.product.findUnique({
    where: { id },
    include: { variants: { select: { id: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const keptIds = variants.map((v) => v.id).filter(Boolean) as string[];
  const removedIds = existing.variants
    .map((v) => v.id)
    .filter((vid) => !keptIds.includes(vid));

  // A variant that has already been ordered cannot be deleted — OrderItem
  // references it to preserve order history. Those are zeroed out instead.
  const referenced = removedIds.length
    ? (
        await prisma.orderItem.findMany({
          where: { variantId: { in: removedIds } },
          select: { variantId: true },
          distinct: ["variantId"],
        })
      ).map((o) => o.variantId)
    : [];
  const deletableIds = removedIds.filter((vid) => !referenced.includes(vid));

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        ...data,
        slug: await uniqueSlug(data.name, id),
        images: JSON.stringify(images),
      },
    });

    if (deletableIds.length) {
      await tx.productVariant.deleteMany({ where: { id: { in: deletableIds } } });
    }
    if (referenced.length) {
      await tx.productVariant.updateMany({
        where: { id: { in: referenced } },
        data: { stock: 0 },
      });
    }

    for (const [i, v] of variants.entries()) {
      const shared = {
        sku: v.sku,
        color: v.color || null,
        size: v.size || null,
        image: v.image || null,
        stock: v.stock,
        lowStockThreshold: v.lowStockThreshold,
        position: i,
      };

      if (v.id) {
        await tx.productVariant.update({ where: { id: v.id }, data: shared });
      } else {
        await tx.productVariant.create({ data: { ...shared, productId: id } });
      }
    }
  });

  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: { orderBy: { position: "asc" } } },
  });

  return NextResponse.json({
    product,
    keptForHistory: referenced.length,
  });
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await req.json();
  if (typeof id !== "string" || !id) {
    return NextResponse.json({ error: "Missing product id" }, { status: 400 });
  }

  // Products that appear in past orders are archived rather than deleted, so
  // order history keeps resolving.
  const ordered = await prisma.orderItem.findFirst({
    where: { variant: { productId: id } },
    select: { id: true },
  });

  if (ordered) {
    await prisma.product.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ archived: true });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
