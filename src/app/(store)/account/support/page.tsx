import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountNav } from "@/components/account/AccountNav";
import { SupportPanel } from "@/components/account/SupportPanel";

export const metadata = { title: "Help & Issues" };

export default async function SupportPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [tickets, orders] = await Promise.all([
    prisma.supportTicket.findMany({
      where: { userId: session.user.id },
      include: { order: { select: { orderNumber: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      select: { id: true, orderNumber: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl">Help &amp; Issues</h1>
      <p className="mt-2 text-izhaana-charcoal/60">
        Ask a question or tell us about a problem with an order.
      </p>

      <div className="mt-8">
        <AccountNav />
      </div>

      <div className="mt-8">
        {/* useSearchParams in SupportPanel needs a Suspense boundary. */}
        <Suspense>
          <SupportPanel
            orders={orders}
            tickets={tickets.map((t) => ({
              id: t.id,
              subject: t.subject,
              message: t.message,
              status: t.status,
              adminReply: t.adminReply,
              createdAt: t.createdAt.toISOString(),
              orderNumber: t.order?.orderNumber ?? null,
            }))}
          />
        </Suspense>
      </div>
    </div>
  );
}
