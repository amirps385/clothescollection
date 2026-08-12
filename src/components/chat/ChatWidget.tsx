"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

interface Turn {
  role: "user" | "assistant";
  content: string;
}

const GREETING =
  "Hello! I can help you find a saree or suit material, check what's in stock, or explain shipping and returns. What are you looking for?";

const SUGGESTIONS = [
  "What sarees do you have?",
  "How long does delivery take?",
  "What's your return policy?",
];

/** Turns "/shop/some-slug" in a reply into a real link. */
function renderReply(text: string) {
  const parts = text.split(/(\/shop\/[a-z0-9-]+)/g);
  return parts.map((part, i) =>
    part.startsWith("/shop/") ? (
      <Link
        key={i}
        href={part}
        className="text-izhaana-burgundy underline underline-offset-2"
      >
        view product
      </Link>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [turns, sending]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || sending) return;

    const next: Turn[] = [...turns, { role: "user", content: message }];
    setTurns(next);
    setInput("");
    setError(null);
    setSending(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Only the recent tail is sent, matching the server's cap.
      body: JSON.stringify({ messages: next.slice(-10) }),
    }).catch(() => null);

    setSending(false);

    if (!res) {
      setError("Couldn't reach the assistant. Check your connection?");
      return;
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    setTurns((t) => [...t, { role: "assistant", content: data.reply }]);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Chat with us"}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-izhaana-burgundy text-white shadow-lg transition-transform hover:scale-105"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[30rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col border border-izhaana-charcoal/15 bg-white shadow-2xl">
          <div className="border-b border-izhaana-charcoal/10 bg-izhaana-charcoal px-4 py-3">
            <p className="font-serif text-lg text-izhaana-gold">IZHAANA</p>
            <p className="text-xs text-izhaana-cream/60">
              Ask about products, delivery or your order
            </p>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            <div className="max-w-[85%] bg-izhaana-cream px-3 py-2 text-sm leading-relaxed">
              {GREETING}
            </div>

            {turns.length === 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="border border-izhaana-charcoal/20 px-2.5 py-1 text-xs text-izhaana-charcoal/70 transition-colors hover:border-izhaana-burgundy hover:text-izhaana-burgundy"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {turns.map((t, i) => (
              <div
                key={i}
                className={
                  t.role === "user"
                    ? "ml-auto max-w-[85%] bg-izhaana-burgundy px-3 py-2 text-sm leading-relaxed text-white"
                    : "max-w-[85%] bg-izhaana-cream px-3 py-2 text-sm leading-relaxed"
                }
              >
                {t.role === "assistant" ? renderReply(t.content) : t.content}
              </div>
            ))}

            {sending && (
              <p className="flex items-center gap-1.5 text-xs text-izhaana-charcoal/50">
                <Loader2 size={12} className="animate-spin" />
                Typing…
              </p>
            )}

            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-izhaana-charcoal/10 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={1000}
              placeholder="Type your question…"
              aria-label="Your message"
              className="flex-1 border border-izhaana-charcoal/20 px-3 py-2 text-sm focus:border-izhaana-burgundy focus:outline-none"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send message"
              className="flex h-9 w-9 items-center justify-center bg-izhaana-burgundy text-white transition-opacity disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>

          <p className="border-t border-izhaana-charcoal/10 px-3 py-1.5 text-center text-[10px] text-izhaana-charcoal/45">
            AI assistant — please double-check anything important
          </p>
        </div>
      )}
    </>
  );
}
