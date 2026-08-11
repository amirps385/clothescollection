import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboard() {
  const [
    orderCount,
    productCount,
    revenue,
    lowStock,
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
        where: { stock: { lte: 5 } },
        include: { product: true },
        take: 5,
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

  const stats = [
    { label: "Total Orders", value: orderCount },
    { label: "Active Products", value: productCount },
    { label: "Revenue", value: formatPrice(revenue._sum.total ?? 0) },
    { label: "Pending Returns", value: pendingReturns },
    { label: "Open Support", value: openTickets },
    { label: "Reviews to Approve", value: pendingReviews },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl">Dashboard</h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border border-izhaana-charcoal/10 bg-white p-6"
          >
            <p className="text-sm text-izhaana-charcoal/50">{stat.label}</p>
            <p className="mt-1 text-2xl font-medium">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="border border-izhaana-charcoal/10 bg-white p-6">
          <h2 className="font-serif text-xl">Recent Orders</h2>
          <div className="mt-4 space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between border-b border-izhaana-charcoal/5 pb-3"
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
              </div>
            ))}
          </div>
        </section>

        <section className="border border-izhaana-charcoal/10 bg-white p-6">
          <h2 className="font-serif text-xl">Low Stock Alerts</h2>
          <div className="mt-4 space-y-3">
            {lowStock.length === 0 ? (
              <p className="text-sm text-izhaana-charcoal/50">All items well stocked</p>
            ) : (
              lowStock.map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between border-b border-izhaana-charcoal/5 pb-3"
                >
                  <div>
                    <p className="text-sm font-medium">{variant.product.name}</p>
                    <p className="text-xs text-izhaana-charcoal/50">
                      {variant.size} / {variant.color} · {variant.sku}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-red-600">
                    {variant.stock} left
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
