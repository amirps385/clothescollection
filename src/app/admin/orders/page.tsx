import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { OrderStatusUpdater } from "@/components/admin/OrderStatusUpdater";

export const metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { items: true, user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-serif text-3xl">Orders</h1>

      <div className="mt-8 space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border border-izhaana-charcoal/10 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-medium">{order.orderNumber}</p>
                <p className="text-sm text-izhaana-charcoal/50">
                  {order.email} · {new Date(order.createdAt).toLocaleString("en-IN")}
                </p>
                {order.trackingNumber && (
                  <p className="mt-1 text-sm">
                    Tracking: {order.trackingNumber} ({order.carrier})
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-medium">{formatPrice(order.total)}</p>
                <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
              </div>
            </div>

            <div className="mt-4 border-t border-izhaana-charcoal/5 pt-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-1">
                  <span>
                    {item.productName} ({item.variantInfo}) × {item.quantity}
                  </span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="mt-2 flex gap-4 text-xs text-izhaana-charcoal/50">
              <span>Subtotal: {formatPrice(order.subtotal)}</span>
              {order.discount > 0 && <span>Discount: -{formatPrice(order.discount)}</span>}
              <span>Shipping: {formatPrice(order.shippingCost)}</span>
              <span>GST: {formatPrice(order.taxAmount)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
