import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { checkScopedRateLimit } from "@/lib/security";
import {
  CHAT_MODEL,
  buildCatalogContext,
  buildOrderContext,
  demoAssistantReply,
  getChatApiKey,
  getChatBaseUrl,
  isChatConfigured,
  isChatDemoMode,
  systemPrompt,
} from "@/lib/chat/context";

/** Each message costs money, so keep the budget per visitor tight. */
const MAX_MESSAGES_PER_HOUR = 25;
const HOUR = 60 * 60 * 1000;

/**
 * Admin-only health check. Production failures are hard to diagnose from the
 * widget — every provider error looks like "the assistant is unavailable" — and
 * Vercel logs aren't convenient. Visiting /api/chat while signed in as an admin
 * reports which settings this environment actually has and what the provider
 * says, without ever revealing the key.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const key = getChatApiKey();
  const baseUrl = getChatBaseUrl();

  const config = {
    keyPresent: Boolean(key),
    keyLength: key.length,
    keyPrefix: key ? `${key.slice(0, 3)}…` : null,
    baseUrl,
    model: CHAT_MODEL,
    demoMode: isChatDemoMode(),
    // Points at OpenAI while holding a non-OpenAI key: the usual misconfiguration.
    looksMismatched:
      baseUrl.includes("api.openai.com") && Boolean(key) && !key.startsWith("sk-"),
  };

  if (!key) {
    return NextResponse.json({
      ok: false,
      config,
      diagnosis: "No API key in this environment — set CHATGPT_API_KEY.",
    });
  }

  let providerStatus: number | null = null;
  let providerError: string | null = null;
  let replied = false;

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        max_tokens: 400,
        messages: [{ role: "user", content: "Reply with exactly: OK" }],
      }),
    });

    providerStatus = res.status;
    if (res.ok) {
      const data = await res.json();
      replied = Boolean(data.choices?.[0]?.message?.content);
    } else {
      const body = await res.json().catch(() => null);
      providerError = body?.error?.message ?? `HTTP ${res.status}`;
    }
  } catch (e) {
    providerError = (e as Error).message;
  }

  const diagnosis = replied
    ? "Working."
    : config.looksMismatched
      ? "CHAT_BASE_URL is missing or points at OpenAI, but the key isn't an OpenAI key. Set CHAT_BASE_URL for your provider."
      : providerStatus === 401 || providerStatus === 403
        ? "The provider rejected the key. Check CHATGPT_API_KEY and CHAT_BASE_URL match the same provider."
        : providerStatus === 404
          ? `The provider doesn't recognise model "${CHAT_MODEL}". Set CHATGPT_MODEL to one it offers.`
          : providerStatus === 429
            ? "Rate limited or out of credits at the provider."
            : `Provider returned ${providerStatus ?? "no response"}.`;

  return NextResponse.json({
    ok: replied,
    config,
    provider: { status: providerStatus, error: providerError },
    diagnosis,
  });
}

/** Caps what we send to and accept from the model, to bound cost per call. */
const MAX_TURNS = 10;
const MAX_CHARS = 1000;
/**
 * A ceiling, not a spend commitment — we're only billed for tokens actually
 * produced. It needs headroom because reasoning models (Gemini Flash, and
 * OpenAI's o-series) spend output tokens on invisible thinking first; at 400
 * the thinking consumed the budget and answers arrived truncated mid-sentence.
 */
const MAX_RESPONSE_TOKENS = 1500;

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(MAX_CHARS),
      })
    )
    .min(1)
    .max(MAX_TURNS),
});

export async function POST(req: NextRequest) {
  if (!isChatConfigured()) {
    return NextResponse.json(
      { error: "Chat isn't switched on for this site yet." },
      { status: 501 }
    );
  }

  const session = await auth();

  // Signed-in customers get their own bucket; everyone else is keyed by IP.
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const bucket = session?.user ? `chat:user:${session.user.id}` : `chat:ip:${ip}`;

  const limit = checkScopedRateLimit(bucket, MAX_MESSAGES_PER_HOUR, HOUR);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error:
          "You've reached the message limit for now. Please try again a little later, or email us and a person will help.",
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  const catalog = await buildCatalogContext();
  const orders = session?.user ? await buildOrderContext(session.user.id) : null;
  const apiKey = getChatApiKey();
  const latestMessage = parsed.data.messages.at(-1)?.content ?? "";

  if (!apiKey && isChatDemoMode()) {
    return NextResponse.json({
      reply: demoAssistantReply(latestMessage, catalog, orders),
      mode: "demo",
    });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${getChatBaseUrl()}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        max_tokens: MAX_RESPONSE_TOKENS,
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt(catalog, orders) },
          ...parsed.data.messages,
        ],
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Couldn't reach the assistant just now. Please try again." },
      { status: 503 }
    );
  }

  if (!upstream.ok) {
    // Log the upstream detail server-side; don't leak it to the browser.
    const rawError = await upstream.text();
    let error: { error?: { code?: string | null; message?: string; type?: string } } = {};
    try {
      error = JSON.parse(rawError);
    } catch {
      error = {};
    }
    const code = error.error?.code;
    const type = error.error?.type;
    console.error("[chat] provider error", {
      baseUrl: getChatBaseUrl(),
      model: CHAT_MODEL,
      status: upstream.status,
      code,
      type,
      message: error.error?.message ?? rawError,
    });

    if (isChatDemoMode()) {
      return NextResponse.json({
        reply: demoAssistantReply(latestMessage, catalog, orders),
        mode: "demo",
      });
    }

    const quotaExhausted =
      code === "credit_balance_exhausted" ||
      code === "insufficient_quota" ||
      type === "insufficient_quota";

    return NextResponse.json(
      {
        error: quotaExhausted
          ? "The assistant has run out of API credits. Please try again later."
          : "The assistant is unavailable right now. Please try again.",
      },
      { status: quotaExhausted ? 402 : 502 }
    );
  }

  const data = await upstream.json();
  const reply = data.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    return NextResponse.json(
      { error: "The assistant didn't have an answer. Please rephrase?" },
      { status: 502 }
    );
  }

  return NextResponse.json({ reply });
}
