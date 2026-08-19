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
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ?q=... replays a real question through the full catalogue prompt, so a
  // failure that only shows up on heavier questions can be reproduced here.
  const question = req.nextUrl.searchParams.get("q")?.trim();

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

  let sample: string | null = null;
  let finishReason: string | null = null;

  try {
    // With ?q= this mirrors a real request exactly: same catalogue prompt, same
    // token budget. Without it, a cheap ping.
    const messages = question
      ? [
          { role: "system", content: systemPrompt(await buildCatalogContext(), null) },
          { role: "user", content: question },
        ]
      : [{ role: "user", content: "Reply with exactly: OK" }];

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        max_tokens: question ? MAX_RESPONSE_TOKENS : 400,
        messages,
      }),
    });

    providerStatus = res.status;
    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      finishReason = data.choices?.[0]?.finish_reason ?? null;
      replied = Boolean(content);
      sample = content ? String(content).slice(0, 200) : null;
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
          ? `The provider doesn't recognise model "${CHAT_MODEL}", or your plan can't access it. Set CHATGPT_MODEL to one your plan offers.`
          : providerStatus === 429
            ? "Rate limited or out of quota at the provider. Free tiers hit this after a burst of messages — wait a minute and retry."
            : finishReason === "length"
              ? "The model spent its whole token budget on reasoning and returned nothing. Raise MAX_RESPONSE_TOKENS."
              : providerStatus === 200
                ? "The provider accepted the request but returned an empty answer — usually a free-tier burst limit. Retry in a few seconds."
                : `Provider returned ${providerStatus ?? "no response"}.`;

  return NextResponse.json({
    ok: replied,
    testedQuestion: question ?? "(cheap ping — add ?q=your+question to test a real one)",
    config,
    provider: { status: providerStatus, error: providerError, finishReason },
    sample,
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

    // A plain 429 is the provider throttling us, not an empty wallet — common on
    // free tiers after a short burst. Saying "unavailable" made a transient
    // limit look like an outage, so shoppers didn't know to simply retry.
    if (upstream.status === 429 && !quotaExhausted) {
      return NextResponse.json(
        {
          error:
            "I'm getting a lot of questions right now — please wait a few seconds and send that again.",
        },
        { status: 429, headers: { "Retry-After": "20" } }
      );
    }

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
    // Not necessarily a bad question: some providers answer a burst of requests
    // with HTTP 200 and an empty completion instead of a 429 (oxlo does this —
    // the same question succeeds on its own moments later). Telling the shopper
    // to rephrase a perfectly good question sent them in circles, so ask for a
    // retry and record the finish reason to tell the two cases apart in logs.
    console.error("[chat] empty completion", {
      model: CHAT_MODEL,
      finishReason: data.choices?.[0]?.finish_reason ?? null,
      usage: data.usage ?? null,
    });

    return NextResponse.json(
      {
        error:
          "I didn't manage to answer that — please send it again in a few seconds.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ reply });
}
