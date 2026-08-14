import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatPrice, cn } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";

export const metadata = { title: "Orders" };

const TABS = [
  { key: "all", label: "All" },
  { key: "todo", label: "Needs packing" },
  { key: "shipped", label: "In transit" },
  { key: "done", label: "Delivered" },
] as const;

interface AdminOrdersPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const { tab = "all" } = await searchParams;

  // Mutable arrays: Prisma's `in` filter won't take a readonly tuple.
  const GROUPS: Record<string, OrderStatus[]> = {
    todo: [OrderStatus.PAID, OrderStatus.PROCESSING],
    shipped: [OrderStatus.SHIPPED],
    done: [OrderStatus.DELIVERED],
  };

  const group = GROUPS[tab];
  const where: Prisma.OrderWhereInput = group ? { status: { in: group } } : {};

  const [orders, counts] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { status: true } }),
  ]);

  const countFor = (statuses: readonly string[]) =>
    counts
      .filter((c) => statuses.includes(c.status))
      .reduce((sum, c) => sum + c._count.status, 0);

  const tabCounts: Record<string, number> = {
    all: counts.reduce((s, c) => s + c._count.status, 0),
    todo: countFor(["PAID", "PROCESSING"]),
    shipped: countFor(["SHIPPED"]),
    done: countFor(["DELIVERED"]),
  };

  return (
    <div>
      <h1 className="font-serif text-3xl">Orders</h1>
      <p className="mt-1 text-sm text-izhaana-charcoal/50">
        Open an order to see the address, phone and items to pack.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "all" ? "/admin/orders" : `/admin/orders?tab=${t.key}`}
            className={cn(
              "border px-3 py-1.5 text-sm transition-colors",
              tab === t.key
                ? "border-izhaana-burgundy bg-izhaana-burgundy text-white"
                : "border-izhaana-charcoal/20 hover:border-izhaana-burgundy"
            )}
          >
            {t.label} ({tabCounts[t.key] ?? 0})
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="mt-10 text-izhaana-charcoal/55">
          {tab === "all"
            ? "No orders yet. They'll appear here as customers buy."
            : "Nothing in this group right now."}
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="group block border border-izhaana-charcoal/10 bg-white p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="mt-0.5 text-sm text-izhaana-charcoal/50">
                    {order.shippingName} · {order.email}
                  </p>
                  <p className="mt-0.5 text-xs text-izhaana-charcoal/45">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {" · "}
                    {order.items.length} {order.items.length === 1 ? "item" : "items"}
                    {" · "}
                    {order.shippingCity}, {order.shippingState}
                  </p>
                  {order.trackingNumber && (
                    <p className="mt-1 text-xs text-izhaana-charcoal/60">
                      {order.carrier ? `${order.carrier} · ` : ""}
                      <span className="font-mono">{order.trackingNumber}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(order.total)}</p>
                    <div className="mt-1">
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-izhaana-charcoal/25 transition-colors group-hover:text-izhaana-burgundy"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
