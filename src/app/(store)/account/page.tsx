import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "My Account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl">My Account</h1>
          <p className="mt-1 text-izhaana-charcoal/60">{session.user.email}</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button type="submit" variant="outline">
            Sign Out
          </Button>
        </form>
      </div>

      {session.user.role === "ADMIN" && (
        <Link
          href="/admin"
          className="mt-4 inline-block text-sm text-izhaana-burgundy hover:underline"
        >
          Go to Admin Dashboard →
        </Link>
      )}

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Order History</h2>
        {orders.length === 0 ? (
          <p className="mt-4 text-izhaana-charcoal/60">No orders yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-izhaana-charcoal/10 bg-white p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-izhaana-charcoal/50">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(order.total)}</p>
                    <p className="text-sm capitalize text-izhaana-burgundy">
                      {order.status.toLowerCase()}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex gap-4 text-sm">
                  <Link
                    href={`/account/returns?order=${order.id}`}
                    className="text-izhaana-burgundy hover:underline"
                  >
                    Request Return
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
