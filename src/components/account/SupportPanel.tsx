"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface TicketRow {
  id: string;
  subject: string;
  message: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  adminReply: string | null;
  createdAt: string;
  orderNumber: string | null;
}

export interface OrderOption {
  id: string;
  orderNumber: string;
}

const statusLabel: Record<TicketRow["status"], string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const statusClass: Record<TicketRow["status"], string> = {
  OPEN: "bg-amber-100 text-amber-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-600",
};

export function SupportPanel({
  tickets,
  orders,
}: {
  tickets: TicketRow[];
  orders: OrderOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState(searchParams.get("order") ?? "");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setNotice(null);

    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message, orderId: orderId || null }),
    });
    const data = await res.json().catch(() => ({}));
    setSending(false);

    if (res.ok) {
      setNotice({ kind: "ok", text: data.message ?? "Message sent" });
      setSubject("");
      setMessage("");
      setOrderId("");
      router.refresh();
    } else {
      setNotice({ kind: "err", text: data.error ?? "Could not send your message" });
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={submit}
        className="space-y-5 border border-izhaana-charcoal/10 bg-white p-6"
      >
        <h2 className="font-serif text-xl">Raise an issue</h2>

        {orders.length > 0 && (
          <div className="space-y-1.5">
            <label htmlFor="order" className="block text-sm font-medium">
              Related order (optional)
            </label>
            <select
              id="order"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full border border-izhaana-charcoal/20 bg-white px-4 py-2.5 text-sm focus:border-izhaana-burgundy focus:outline-none"
            >
              <option value="">Not about a specific order</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber}
                </option>
              ))}
            </select>
          </div>
        )}

        <Input
          id="subject"
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Wrong colour delivered"
        />

        <div className="space-y-1.5">
          <label htmlFor="message" className="block text-sm font-medium">
            How can we help?
          </label>
          <textarea
            id="message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what happened…"
            className="w-full border border-izhaana-charcoal/20 bg-white px-4 py-2.5 text-sm focus:border-izhaana-burgundy focus:outline-none focus:ring-1 focus:ring-izhaana-burgundy"
          />
        </div>

        {notice && (
          <p
            className={`text-sm ${
              notice.kind === "ok" ? "text-green-700" : "text-red-600"
            }`}
          >
            {notice.text}
          </p>
        )}

        <Button type="submit" loading={sending}>
          Send message
        </Button>
      </form>

      <section>
        <h2 className="font-serif text-2xl">Your messages</h2>
        {tickets.length === 0 ? (
          <p className="mt-3 text-izhaana-charcoal/60">
            You haven&apos;t raised anything yet.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="border border-izhaana-charcoal/10 bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{t.subject}</p>
                    <p className="mt-0.5 text-xs text-izhaana-charcoal/50">
                      {new Date(t.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {t.orderNumber ? ` · ${t.orderNumber}` : ""}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-xs font-medium ${statusClass[t.status]}`}
                  >
                    {statusLabel[t.status]}
                  </span>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-izhaana-charcoal/70">
                  {t.message}
                </p>

                {t.adminReply && (
                  <div className="mt-4 border-l-2 border-izhaana-gold bg-izhaana-cream/60 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-widest text-izhaana-charcoal/50">
                      IZHAANA replied
                    </p>
                    <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">
                      {t.adminReply}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
