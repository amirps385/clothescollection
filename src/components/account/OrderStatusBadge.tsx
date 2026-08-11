import type { OrderStatus } from "@prisma/client";

const styles: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: "Payment pending", className: "bg-amber-100 text-amber-800" },
  PAID: { label: "Confirmed", className: "bg-blue-100 text-blue-800" },
  PROCESSING: { label: "Being packed", className: "bg-blue-100 text-blue-800" },
  SHIPPED: { label: "On its way", className: "bg-indigo-100 text-indigo-800" },
  DELIVERED: { label: "Delivered", className: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-600" },
  REFUNDED: { label: "Refunded", className: "bg-gray-100 text-gray-600" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = styles[status];
  return (
    <span className={`inline-block px-2.5 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
