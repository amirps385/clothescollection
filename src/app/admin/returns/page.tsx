import { prisma } from "@/lib/prisma";
import { ReturnStatusUpdater } from "@/components/admin/ReturnStatusUpdater";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Returns" };

export default async function AdminReturnsPage() {
  const returns = await prisma.return.findMany({
    include: { order: true, user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-serif text-3xl">Returns & Refunds</h1>

      <div className="mt-8 space-y-4">
        {returns.length === 0 ? (
          <p className="text-izhaana-charcoal/50">No return requests yet.</p>
        ) : (
          returns.map((ret) => (
            <div key={ret.id} className="border border-izhaana-charcoal/10 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-medium">Order: {ret.order.orderNumber}</p>
                  <p className="text-sm text-izhaana-charcoal/50">
                    {ret.user.name ?? ret.user.email} ·{" "}
                    {new Date(ret.createdAt).toLocaleString("en-IN")}
                  </p>
                  <p className="mt-2 text-sm">{ret.reason}</p>
                  <p className="mt-1 text-sm text-izhaana-charcoal/50">
                    Order total: {formatPrice(ret.order.total)}
                  </p>
                </div>
                <ReturnStatusUpdater returnId={ret.id} currentStatus={ret.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
