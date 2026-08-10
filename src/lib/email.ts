import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export function isEmailConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendOrderConfirmationEmail(order: {
  email: string;
  orderNumber: string;
  total: number;
  items: { productName: string; quantity: number; price: number }[];
  shippingName: string;
  shippingLine1: string;
  shippingCity: string;
  shippingState: string;
  shippingPostal: string;
}) {
  if (!isEmailConfigured()) {
    console.log("[Email] SMTP not configured, skipping order confirmation");
    return;
  }

  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee">${item.productName}</td><td style="padding:8px;border-bottom:1px solid #eee">${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee">₹${item.price}</td></tr>`
    )
    .join("");

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "IZHAANA Enterprises <noreply@izhaana.com>",
    to: order.email,
    subject: `Order Confirmed — ${order.orderNumber}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:32px">
        <h1 style="color:#6B2737;font-size:28px;margin-bottom:8px">IZHAANA ENTERPRISES</h1>
        <p style="color:#666;margin-bottom:24px">Thank you for your order!</p>
        <p><strong>Order:</strong> ${order.orderNumber}</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0">
          <thead><tr style="background:#FAF7F2"><th style="padding:8px;text-align:left">Item</th><th style="padding:8px">Qty</th><th style="padding:8px">Price</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p><strong>Total:</strong> ₹${order.total}</p>
        <p style="margin-top:24px"><strong>Shipping to:</strong><br>${order.shippingName}<br>${order.shippingLine1}<br>${order.shippingCity}, ${order.shippingState} ${order.shippingPostal}</p>
      </div>
    `,
  });
}

export async function sendOrderStatusEmail(
  email: string,
  orderNumber: string,
  status: string
) {
  if (!isEmailConfigured()) return;

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "IZHAANA Enterprises <noreply@izhaana.com>",
    to: email,
    subject: `Order ${orderNumber} — ${status}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:32px">
        <h1 style="color:#6B2737">IZHAANA ENTERPRISES</h1>
        <p>Your order <strong>${orderNumber}</strong> status has been updated to <strong>${status}</strong>.</p>
      </div>
    `,
  });
}
