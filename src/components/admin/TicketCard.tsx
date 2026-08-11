"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
type Status = (typeof STATUSES)[number];

const statusLabel: Record<Status, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export interface AdminTicket {
  id: string;
  subject: string;
  message: string;
  status: Status;
  adminReply: string | null;
  email: string;
  createdAt: string;
  orderNumber: string | null;
  customerName: string | null;
}

export function TicketCard({ ticket }: { ticket: AdminTicket }) {
  const router = useRouter();
  const [reply, setReply] = useState(ticket.adminReply ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/support", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ticket.id, ...body }),
    });
    setBusy(false);

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not update this ticket.");
    }
  }

  return (
    <div className="border border-izhaana-charcoal/10 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">{ticket.subject}</p>
          <p className="mt-0.5 text-sm text-izhaana-charcoal/50">
            {ticket.customerName ? `${ticket.customerName} · ` : ""}
            {ticket.email}
            {ticket.orderNumber ? ` · ${ticket.orderNumber}` : ""}
            {" · "}
            {new Date(ticket.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        <select
          value={ticket.status}
          disabled={busy}
          onChange={(e) => patch({ status: e.target.value })}
          className="border border-izhaana-charcoal/20 bg-white px-2 py-1 text-xs"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel[s]}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-izhaana-charcoal/75">
        {ticket.message}
      </p>

      <div className="mt-5 space-y-2">
        <label className="block text-xs font-medium uppercase tracking-widest text-izhaana-charcoal/50">
          Reply to customer
        </label>
        <textarea
          rows={3}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Write a reply the customer will see in their account…"
          className="w-full border border-izhaana-charcoal/20 bg-white px-3 py-2 text-sm focus:border-izhaana-burgundy focus:outline-none"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            loading={busy}
            onClick={() => patch({ adminReply: reply })}
          >
            {ticket.adminReply ? "Update reply" : "Send reply"}
          </Button>
          {ticket.status !== "RESOLVED" && (
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => patch({ adminReply: reply, status: "RESOLVED" })}
            >
              Reply &amp; resolve
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
