import { prisma } from "@/lib/prisma";
import { TicketCard } from "@/components/admin/TicketCard";

export const metadata = { title: "Support" };

export default async function AdminSupportPage() {
  const tickets = await prisma.supportTicket.findMany({
    include: {
      order: { select: { orderNumber: true } },
      user: { select: { name: true } },
    },
    // Unresolved work first, newest within each group.
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const openCount = tickets.filter(
    (t) => t.status === "OPEN" || t.status === "IN_PROGRESS"
  ).length;

  return (
    <div>
      <h1 className="font-serif text-3xl">Support</h1>
      <p className="mt-1 text-sm text-izhaana-charcoal/50">
        {openCount} needing attention · {tickets.length} total
      </p>

      {tickets.length === 0 ? (
        <p className="mt-8 text-izhaana-charcoal/50">No customer messages yet.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {tickets.map((t) => (
            <TicketCard
              key={t.id}
              ticket={{
                id: t.id,
                subject: t.subject,
                message: t.message,
                status: t.status,
                adminReply: t.adminReply,
                email: t.email,
                createdAt: t.createdAt.toISOString(),
                orderNumber: t.order?.orderNumber ?? null,
                customerName: t.user?.name ?? null,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
