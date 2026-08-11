/**
 * Creates a throwaway order for the admin account so the order-detail page can
 * be exercised locally. Run: npx tsx scripts/make-test-order.ts
 * Remove it again with: npx tsx scripts/make-test-order.ts --clean
 */
import { PrismaClient, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();
const ORDER_NUMBER = "IZH-TESTORDER";

async function clean() {
  const order = await prisma.order.findUnique({
    where: { orderNumber: ORDER_NUMBER },
    select: { id: true },
  });
  if (!order) return console.log("Nothing to clean.");

  await prisma.supportTicket.deleteMany({ where: { orderId: order.id } });
  await prisma.return.deleteMany({ where: { orderId: order.id } });
  await prisma.order.delete({ where: { id: order.id } });
  console.log("Removed test order.");
}

async function create() {
  const user = await prisma.user.findUnique({
    where: { email: "admin@izhaana.com" },
  });
  if (!user) throw new Error("Seed the database first.");

  const variants = await prisma.productVariant.findMany({
    take: 2,
    include: { product: true },
  });
  if (variants.length === 0) throw new Error("No product variants found.");

  const items = variants.map((v) => ({
    variantId: v.id,
    productName: v.product.name,
    variantInfo: [v.color, v.size].filter(Boolean).join(" / ") || "Standard",
    price: v.product.price,
    quantity: 1,
    gstRate: v.product.gstRate,
  }));

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const taxAmount = items.reduce(
    (s, i) => s + (i.price * i.quantity * i.gstRate) / 100,
    0
  );
  const shippingCost = 99;

  const order = await prisma.order.create({
    data: {
      orderNumber: ORDER_NUMBER,
      userId: user.id,
      email: user.email,
      status: OrderStatus.SHIPPED,
      subtotal,
      discount: 0,
      shippingCost,
      taxAmount,
      total: subtotal + shippingCost + taxAmount,
      shippingName: "IZHAANA Admin",
      shippingLine1: "12 Test Street",
      shippingCity: "Indore",
      shippingState: "Madhya Pradesh",
      shippingPostal: "452001",
      shippingMethod: "Express Shipping",
      carrier: "Delhivery",
      trackingNumber: "TESTTRACK123",
      items: { create: items },
    },
  });

  console.log(`Created ${order.orderNumber} -> /account/orders/${order.id}`);
}

(process.argv.includes("--clean") ? clean() : create())
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
