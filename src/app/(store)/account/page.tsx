import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MapPin, User as UserIcon, LifeBuoy, PackageOpen } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { AccountNav } from "@/components/account/AccountNav";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";

export const metadata = { title: "My Account" };

const shortcuts = [
  {
    href: "/account/profile",
    icon: UserIcon,
    title: "My Details",
    description: "Name, phone and password",
  },
  {
    href: "/account/addresses",
    icon: MapPin,
    title: "Addresses",
    description: "Saved delivery addresses",
  },
  {
    href: "/account/support",
    icon: LifeBuoy,
    title: "Help & Issues",
    description: "Ask a question or report a problem",
  },
  {
    href: "/account/returns",
    icon: PackageOpen,
    title: "Returns",
    description: "Request a return or refund",
  },
];

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, orders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const greeting = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">Hello, {greeting}</h1>
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

      <div className="mt-8">
        <AccountNav />
      </div>

      {session.user.role === "ADMIN" && (
        <Link
          href="/admin"
          className="mt-6 inline-block text-sm text-izhaana-burgundy hover:underline"
        >
          Go to Admin Dashboard →
        </Link>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {shortcuts.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group border border-izhaana-charcoal/10 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <s.icon
              size={20}
              strokeWidth={1.5}
              className="text-izhaana-burgundy"
            />
            <h2 className="mt-3 font-serif text-lg group-hover:text-izhaana-burgundy">
              {s.title}
            </h2>
            <p className="mt-1 text-sm text-izhaana-charcoal/55">{s.description}</p>
          </Link>
        ))}
      </div>

      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-2xl">Recent Orders</h2>
        </div>

        {orders.length === 0 ? (
          <div className="mt-4 border border-izhaana-charcoal/10 bg-white p-8 text-center">
            <p className="text-izhaana-charcoal/60">You haven&apos;t ordered yet.</p>
            <Link href="/shop" className="mt-4 inline-block">
              <Button>Start shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block border border-izhaana-charcoal/10 bg-white p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-izhaana-charcoal/50">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {" · "}
                      {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <OrderStatusBadge status={order.status} />
                    <p className="font-medium">{formatPrice(order.total)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
