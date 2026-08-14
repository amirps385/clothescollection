import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, MapPin, User as UserIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { OrderFulfilment } from "@/components/admin/OrderFulfilment";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";

export const metadata = { title: "Order" };

interface AdminOrderPageProps {
  params: Promise<{ id: string }>;
}

/** Stored as JSON on the order at checkout time: { [gstRate]: { cgst, sgst, igst, … } } */
function parseGst(raw: string | null) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : null;
  } catch {
    return null;
  }
}

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { variant: { select: { sku: true } } } },
      user: { select: { name: true, email: true, phone: true } },
      returns: true,
      tickets: { orderBy: { createdAt: "desc" } },
      coupon: { select: { code: true } },
    },
  });

  if (!order) notFound();

  const gst = parseGst(order.gstBreakdown);

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm text-izhaana-charcoal/60 hover:text-izhaana-burgundy"
      >
        <ArrowLeft size={15} />
        All orders
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-izhaana-charcoal/55">
            {new Date(order.createdAt).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <section className="border border-izhaana-charcoal/10 bg-white p-6">
            <h2 className="flex items-center gap-2 font-serif text-xl">
              <Package size={17} strokeWidth={1.5} />
              Items to pack
            </h2>

            <div className="mt-4 divide-y divide-izhaana-charcoal/10">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 py-3">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-izhaana-charcoal/55">
                      {item.variantInfo}
                      {item.variant?.sku && (
                        <span className="font-mono"> · {item.variant.sku}</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-izhaana-charcoal/45">
                      {formatPrice(item.price)} each · GST {item.gstRate}%
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-right">
                    <p className="text-sm">× {item.quantity}</p>
                    <p className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
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
                  <dt>
                    Discount
                    {order.coupon?.code ? ` (${order.coupon.code})` : ""}
                  </dt>
                  <dd>−{formatPrice(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-izhaana-charcoal/60">
                  Shipping{order.shippingMethod ? ` · ${order.shippingMethod}` : ""}
                </dt>
                <dd>
                  {order.shippingCost === 0
                    ? "Free"
                    : formatPrice(order.shippingCost)}
                </dd>
              </div>

              {gst ? (
                Object.entries(gst).map(([rate, b]) => {
                  const parts = b as Record<string, number>;
                  const interState = (parts.igst ?? 0) > 0;
                  return (
                    <div key={rate} className="flex justify-between">
                      <dt className="text-izhaana-charcoal/60">
                        GST {rate}% ({interState ? "IGST" : "CGST + SGST"})
                      </dt>
                      <dd>
                        {formatPrice(
                          interState
                            ? (parts.igst ?? 0)
                            : (parts.cgst ?? 0) + (parts.sgst ?? 0)
                        )}
                      </dd>
                    </div>
                  );
                })
              ) : (
                <div className="flex justify-between">
                  <dt className="text-izhaana-charcoal/60">GST</dt>
                  <dd>{formatPrice(order.taxAmount)}</dd>
                </div>
              )}

              <div className="flex justify-between border-t border-izhaana-charcoal/10 pt-2 text-base font-medium">
                <dt>Total</dt>
                <dd>{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="border border-izhaana-charcoal/10 bg-white p-6">
            <h2 className="flex items-center gap-2 font-serif text-xl">
              <MapPin size={17} strokeWidth={1.5} />
              Deliver to
            </h2>
            <address className="mt-3 text-sm not-italic leading-relaxed text-izhaana-charcoal/75">
              {order.shippingName}
              <br />
              {order.shippingLine1}
              {order.shippingLine2 && (
                <>
                  <br />
                  {order.shippingLine2}
                </>
              )}
              {order.shippingLandmark && (
                <>
                  <br />
                  Near {order.shippingLandmark}
                </>
              )}
              <br />
              {order.shippingCity}, {order.shippingState} {order.shippingPostal}
              <br />
              {order.shippingCountry}
            </address>
            {order.shippingPhone ? (
              <p className="mt-3 text-sm">
                <span className="text-izhaana-charcoal/60">Phone: </span>
                <a
                  href={`tel:${order.shippingPhone}`}
                  className="text-izhaana-burgundy hover:underline"
                >
                  {order.shippingPhone}
                </a>
              </p>
            ) : (
              <p className="mt-3 text-sm text-amber-700">
                No phone number on this order — couriers usually need one.
              </p>
            )}
          </section>

          {(order.returns.length > 0 || order.tickets.length > 0) && (
            <section className="border border-izhaana-charcoal/10 bg-white p-6">
              <h2 className="font-serif text-xl">Raised against this order</h2>

              {order.returns.map((r) => (
                <div key={r.id} className="mt-3 text-sm">
                  <p className="font-medium">
                    Return · {r.status.toLowerCase()}
                  </p>
                  <p className="text-izhaana-charcoal/70">{r.reason}</p>
                  <Link
                    href="/admin/returns"
                    className="text-xs text-izhaana-burgundy hover:underline"
                  >
                    Manage returns →
                  </Link>
                </div>
              ))}

              {order.tickets.map((t) => (
                <div key={t.id} className="mt-3 text-sm">
                  <p className="font-medium">
                    {t.subject} · {t.status.toLowerCase().replace("_", " ")}
                  </p>
                  <p className="text-izhaana-charcoal/70">{t.message}</p>
                  <Link
                    href="/admin/support"
                    className="text-xs text-izhaana-burgundy hover:underline"
                  >
                    Reply in Support →
                  </Link>
                </div>
              ))}
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="border border-izhaana-charcoal/10 bg-white p-6">
            <h2 className="font-serif text-xl">Fulfilment</h2>
            <div className="mt-4">
              <OrderFulfilment
                orderId={order.id}
                status={order.status}
                trackingNumber={order.trackingNumber ?? ""}
                carrier={order.carrier ?? ""}
              />
            </div>
          </section>

          <section className="border border-izhaana-charcoal/10 bg-white p-6">
            <h2 className="flex items-center gap-2 font-serif text-xl">
              <UserIcon size={17} strokeWidth={1.5} />
              Customer
            </h2>
            <div className="mt-3 space-y-1 text-sm">
              <p className="font-medium">
                {order.user?.name ?? order.shippingName}
              </p>
              <p>
                <a
                  href={`mailto:${order.email}`}
                  className="text-izhaana-burgundy hover:underline"
                >
                  {order.email}
                </a>
              </p>
              {order.user?.phone && (
                <p className="text-izhaana-charcoal/70">
                  Account phone: {order.user.phone}
                </p>
              )}
              {!order.user && (
                <p className="text-xs text-izhaana-charcoal/50">
                  Guest checkout — no account.
                </p>
              )}
            </div>
          </section>

          <section className="border border-izhaana-charcoal/10 bg-white p-6">
            <h2 className="font-serif text-xl">Payment</h2>
            <div className="mt-3 space-y-1 text-sm text-izhaana-charcoal/70">
              <p>
                Total charged:{" "}
                <span className="font-medium text-izhaana-charcoal">
                  {formatPrice(order.total)}
                </span>
              </p>
              {order.stripePaymentId ? (
                <p className="font-mono text-xs break-all">
                  {order.stripePaymentId}
                </p>
              ) : (
                <p className="text-amber-700">
                  No payment reference — this order was placed without an online
                  payment.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
