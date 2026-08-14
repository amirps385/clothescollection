import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice, cn } from "@/lib/utils";

export const metadata = { title: "Admin Dashboard" };

/**
 * Widest low-stock threshold we'll consider when pre-filtering in SQL. Prisma
 * can't compare two columns in a `where`, so we narrow generously here and then
 * apply each variant's own threshold in JS below.
 */
const THRESHOLD_CEILING = 50;

export default async function AdminDashboard() {
  const [
    orderCount,
    productCount,
    revenue,
    lowStockCandidates,
    recentOrders,
    pendingReturns,
    openTickets,
    pendingReviews,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
      _sum: { total: true },
    }),
    prisma.productVariant.findMany({
      where: { stock: { lte: THRESHOLD_CEILING } },
      include: { product: { select: { id: true, name: true } } },
      orderBy: { stock: "asc" },
    }),
    prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.return.count({ where: { status: "REQUESTED" } }),
    prisma.supportTicket.count({
      where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
    }),
    prisma.review.count({ where: { status: "PENDING" } }),
  ]);

  // Honour the threshold set per variant in Inventory, not a fixed number.
  const lowStock = lowStockCandidates
    .filter((v) => v.stock <= v.lowStockThreshold)
    .slice(0, 5);

  const stats = [
    { label: "Total Orders", value: orderCount, href: "/admin/orders" },
    { label: "Active Products", value: productCount, href: "/admin/products" },
    {
      label: "Revenue",
      value: formatPrice(revenue._sum.total ?? 0),
      href: "/admin/orders",
    },
    {
      label: "Pending Returns",
      value: pendingReturns,
      href: "/admin/returns",
      // Anything above zero is work waiting for someone.
      needsAction: pendingReturns > 0,
    },
    {
      label: "Open Support",
      value: openTickets,
      href: "/admin/support",
      needsAction: openTickets > 0,
    },
    {
      label: "Reviews to Approve",
      value: pendingReviews,
      href: "/admin/reviews",
      needsAction: pendingReviews > 0,
    },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl">Dashboard</h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={cn(
              "group border bg-white p-6 transition-shadow hover:shadow-md",
              stat.needsAction
                ? "border-amber-300 bg-amber-50/40"
                : "border-izhaana-charcoal/10"
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-izhaana-charcoal/50">{stat.label}</p>
              <ArrowRight
                size={14}
                className="text-izhaana-charcoal/25 transition-colors group-hover:text-izhaana-burgundy"
              />
            </div>
            <p
              className={cn(
                "mt-1 text-2xl font-medium",
                stat.needsAction && "text-amber-800"
              )}
            >
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="border border-izhaana-charcoal/10 bg-white p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-xl">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-izhaana-burgundy hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-izhaana-charcoal/50">
                No orders yet. They&apos;ll appear here as customers buy.
              </p>
            ) : (
              recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href="/admin/orders"
                  className="flex items-center justify-between border-b border-izhaana-charcoal/5 pb-3 transition-colors hover:text-izhaana-burgundy"
                >
                  <div>
                    <p className="text-sm font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-izhaana-charcoal/50">{order.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{formatPrice(order.total)}</p>
                    <p className="text-xs capitalize text-izhaana-burgundy">
                      {order.status.toLowerCase()}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="border border-izhaana-charcoal/10 bg-white p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-xl">Low Stock Alerts</h2>
            <Link
              href="/admin/inventory"
              className="text-sm text-izhaana-burgundy hover:underline"
            >
              Manage stock
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {lowStock.length === 0 ? (
              <p className="text-sm text-izhaana-charcoal/50">All items well stocked</p>
            ) : (
              lowStock.map((variant) => (
                <Link
                  key={variant.id}
                  href={`/admin/products/${variant.product.id}`}
                  className="flex items-center justify-between border-b border-izhaana-charcoal/5 pb-3 transition-colors hover:text-izhaana-burgundy"
                >
                  <div>
                    <p className="text-sm font-medium">{variant.product.name}</p>
                    <p className="text-xs text-izhaana-charcoal/50">
                      {[variant.color, variant.size].filter(Boolean).join(" / ") ||
                        "Standard"}{" "}
                      · {variant.sku}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      variant.stock === 0 ? "text-red-600" : "text-amber-700"
                    )}
                  >
                    {variant.stock === 0 ? "Out of stock" : `${variant.stock} left`}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
