import { prisma } from "@/lib/prisma";
import { BUSINESS } from "@/lib/business";

/**
 * Everything the assistant is allowed to know, assembled fresh per request so
 * prices and stock are never stale. The model is told to answer only from this
 * — it has no other source, which is what stops it inventing products.
 */

export function getChatApiKey() {
  return process.env.CHATGPT_API_KEY ?? process.env.OPENAI_API_KEY ?? "";
}

export function isChatDemoMode() {
  const value = process.env.CHAT_DEMO_MODE?.toLowerCase();
  if (value) return ["1", "true", "yes", "on"].includes(value);

  return !getChatApiKey() || process.env.NODE_ENV === "development";
}

export function isChatConfigured() {
  return Boolean(getChatApiKey()) || isChatDemoMode();
}

export const CHAT_MODEL =
  process.env.CHATGPT_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

export async function buildCatalogContext() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { category: true, variants: true },
    orderBy: { name: "asc" },
  });

  const lines = products.map((p) => {
    const stock = p.variants.reduce((s, v) => s + v.stock, 0);
    const options = p.variants
      .map((v) => [v.color, v.size].filter(Boolean).join(" "))
      .filter(Boolean)
      .join("; ");

    return [
      p.name,
      `category: ${p.category.name}`,
      `price: ₹${p.price}`,
      p.compareAt ? `was ₹${p.compareAt}` : null,
      `in stock: ${stock}`,
      options ? `options: ${options}` : null,
      `link: /shop/${p.slug}`,
    ]
      .filter(Boolean)
      .join(" | ");
  });

  return lines.join("\n");
}

/** Only ever called with the signed-in user's own id. */
export async function buildOrderContext(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  if (orders.length === 0) return "This customer has no orders yet.";

  return orders
    .map((o) =>
      [
        `Order ${o.orderNumber}`,
        `placed ${o.createdAt.toLocaleDateString("en-IN")}`,
        `status: ${o.status}`,
        `total: ₹${Math.round(o.total)}`,
        o.trackingNumber
          ? `tracking: ${o.trackingNumber}${o.carrier ? ` via ${o.carrier}` : ""}`
          : "not dispatched yet",
        `items: ${o.items.map((i) => `${i.productName} x${i.quantity}`).join(", ")}`,
      ].join(" | ")
    )
    .join("\n");
}

export function systemPrompt(catalog: string, orders: string | null) {
  return `You are the shopping assistant for ${BUSINESS.legalName}, an Indian store selling handprinted sarees, unstitched suit and dress materials, handkerchiefs and a few personal care items.

HOW TO ANSWER
- Answer only from the CATALOGUE, POLICIES and ORDERS below. You have no other knowledge of this shop.
- If something isn't in that data, say you don't know and suggest they contact us at ${BUSINESS.email} or via /account/support. Never guess.
- Never invent products, prices, stock numbers, delivery dates or discount codes.
- Never promise a refund, discount, exception or delivery date. Explain the policy and let a human decide.
- Keep replies short and warm — two or three sentences is usually plenty.
- Prices are in Indian Rupees and already include GST.
- When you mention a product, include its link path so we can turn it into a link.
- Reply in the language the customer writes in.

POLICIES
- Free delivery on orders over ₹${BUSINESS.freeShippingOver}. Standard ₹99 (5-7 business days, India Post), Express ₹199 (2-3 days, Delhivery), Premium ₹349 (1-2 days, BlueDart).
- Orders are dispatched within ${BUSINESS.dispatchDays}.
- Returns accepted within ${BUSINESS.returnWindowDays} days on unworn items with tags. Unstitched fabric must be uncut — once cut or stitched it cannot be returned.
- Hand-block printing varies slightly piece to piece; that is normal, not a defect.
- We ship within India only.

CATALOGUE
${catalog}

${orders ? `THIS CUSTOMER'S RECENT ORDERS\n${orders}` : "The customer is not signed in, so you cannot see any order details. If they ask about an order, ask them to sign in first."}`;
}

export function demoAssistantReply(message: string, catalog: string, orders: string | null) {
  const text = message.toLowerCase();

  if (/(shipping|delivery|deliver|ship|courier)/.test(text)) {
    return `Delivery is free over ₹${BUSINESS.freeShippingOver}. Standard shipping is ₹99 and usually takes 5-7 business days, while express and premium options are faster at checkout.`;
  }

  if (/(return|refund|exchange|cancel)/.test(text)) {
    return `Returns are accepted within ${BUSINESS.returnWindowDays} days on unworn items with tags. Unstitched fabric must be uncut, so a person should confirm anything unusual before promising a refund.`;
  }

  if (/(order|tracking|track|status)/.test(text)) {
    return orders
      ? `I can see recent order information once the customer is signed in. For this prototype, please use the account area for exact order status.`
      : `Please sign in first so I can help with order status or tracking details.`;
  }

  const products = catalog
    .split("\n")
    .filter(Boolean)
    .slice(0, 3)
    .map((line) => {
      const [name, ...details] = line.split(" | ");
      const price = details.find((detail) => detail.startsWith("price:"))?.replace("price: ", "");
      const link = details.find((detail) => detail.startsWith("link:"))?.replace("link: ", "");
      return `${name}${price ? ` (${price})` : ""}${link ? ` - ${link}` : ""}`;
    });

  if (products.length === 0) {
    return `I don't see catalogue items loaded yet. Please contact us at ${BUSINESS.email} and a person will help.`;
  }

  return `This is prototype demo mode, so I can answer from the current catalogue without using OpenAI credits. A few options are ${products.join("; ")}.`;
}
