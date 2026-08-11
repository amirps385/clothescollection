import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";

export const metadata = { title: "Order" };

/** Happy-path milestones; cancelled/refunded orders skip the timeline entirely. */
const TIMELINE = [
  { key: "PAID", label: "Order confirmed" },
  { key: "PROCESSING", label: "Being packed" },
  { key: "SHIPPED", label: "On its way" },
  { key: "DELIVERED", label: "Delivered" },
] as const;

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  // Scoped to the signed-in customer so order IDs can't be probed.
  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: { items: true, returns: true },
  });
  if (!order) notFound();

  const reachedIndex = TIMELINE.findIndex((s) => s.key === order.status);
  const isClosed = order.status === "CANCELLED" || order.status === "REFUNDED";
  const canReturn = ["PAID", "SHIPPED", "DELIVERED"].includes(order.status);
  const hasReturn = order.returns.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/account"
        className="inline-flex items-center gap-1.5 text-sm text-izhaana-charcoal/60 hover:text-izhaana-burgundy"
      >
        <ArrowLeft size={15} />
        Back to my account
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">{order.orderNumber}</h1>
          <p className="mt-1 text-izhaana-charcoal/60">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {!isClosed && (
        <section className="mt-10 border border-izhaana-charcoal/10 bg-white p-6">
          <h2 className="font-serif text-xl">Progress</h2>
          <ol className="mt-6 space-y-5 sm:flex sm:space-y-0">
            {TIMELINE.map((step, i) => {
              const done = reachedIndex >= i;
              return (
                <li key={step.key} className="flex items-center gap-3 sm:flex-1">
                  <span
                    className={cn(
                      "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs",
                      done
                        ? "bg-izhaana-burgundy text-white"
                        : "bg-izhaana-cream text-izhaana-charcoal/40"
                    )}
                  >
                    {done ? <Check size={14} /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      "text-sm",
                      done ? "font-medium" : "text-izhaana-charcoal/45"
                    )}
                  >
                    {step.label}
                  </span>
                  {i < TIMELINE.length - 1 && (
                    <span
                      className={cn(
                        "hidden h-px flex-1 sm:block",
                        reachedIndex > i
                          ? "bg-izhaana-burgundy"
                          : "bg-izhaana-charcoal/15"
                      )}
                    />
                  )}
                </li>
              );
            })}
          </ol>

          {order.trackingNumber && (
            <p className="mt-6 border-t border-izhaana-charcoal/10 pt-4 text-sm">
              <span className="text-izhaana-charcoal/60">Tracking: </span>
              <span className="font-mono font-medium">{order.trackingNumber}</span>
              {order.carrier && (
                <span className="text-izhaana-charcoal/60"> via {order.carrier}</span>
              )}
            </p>
          )}
        </section>
      )}

      <section className="mt-6 border border-izhaana-charcoal/10 bg-white p-6">
        <h2 className="font-serif text-xl">Items</h2>
        <div className="mt-4 divide-y divide-izhaana-charcoal/10">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-4 py-3">
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-izhaana-charcoal/55">
                  {item.variantInfo}
                  {" · qty "}
                  {item.quantity}
                </p>
              </div>
              <p className="whitespace-nowrap">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <dl className="mt-5 space-y-2 border-t border-izhaana-charcoal/10 pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-izhaana-charcoal/60">Subtotal</dt>
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-700">
              <dt>Discount {order.couponCode ? `(${order.couponCode})` : ""}</dt>
              <dd>−{formatPrice(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-izhaana-charcoal/60">
              Shipping{order.shippingMethod ? ` (${order.shippingMethod})` : ""}
            </dt>
            <dd>
              {order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-izhaana-charcoal/60">GST</dt>
            <dd>{formatPrice(order.taxAmount)}</dd>
          </div>
          <div className="flex justify-between border-t border-izhaana-charcoal/10 pt-2 text-base font-medium">
            <dt>Total</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 border border-izhaana-charcoal/10 bg-white p-6">
        <h2 className="font-serif text-xl">Delivery address</h2>
        <p className="mt-3 text-sm leading-relaxed text-izhaana-charcoal/70">
          {order.shippingName}
          <br />
          {order.shippingLine1}
          {order.shippingLine2 ? (
            <>
              <br />
              {order.shippingLine2}
            </>
          ) : null}
          <br />
          {order.shippingCity}, {order.shippingState} {order.shippingPostal}
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        {hasReturn ? (
          <p className="text-sm text-izhaana-charcoal/60">
            A return request for this order is{" "}
            {order.returns[0].status.toLowerCase()}.
          </p>
        ) : (
          canReturn && (
            <Link href={`/account/returns?order=${order.id}`}>
              <Button variant="outline">Request a return</Button>
            </Link>
          )
        )}
        <Link href={`/account/support?order=${order.id}`}>
          <Button variant="ghost">Report an issue</Button>
        </Link>
      </div>
    </div>
  );
}
