import Link from "next/link";
import { BUSINESS } from "@/lib/business";
import { PolicyPage, PolicySection } from "@/components/layout/PolicyPage";

export const metadata = {
  title: "Terms of Service",
  description: `The terms on which ${BUSINESS.legalName} sells through this website.`,
};

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms of Service"
      intro={`These terms apply when you browse or buy from this website, operated by ${BUSINESS.legalName}. By placing an order you agree to them.`}
    >
      <PolicySection heading="Products and descriptions">
        <p>
          We describe our products as accurately as we can. Because our textiles are
          hand-block printed, small variations in colour, print placement and weave
          are normal and expected. Screens also render colour differently, so the
          shade you receive may differ slightly from the photograph.
        </p>
        <p>
          Unstitched dress materials are sold as fabric sets and are not stitched
          garments. Measurements given are approximate.
        </p>
      </PolicySection>

      <PolicySection heading="Prices and payment">
        <p>
          All prices are shown in Indian Rupees and are inclusive of GST. The
          applicable GST rate is shown on each product page. Where a &quot;was&quot;
          price is displayed, it refers to our own previous or recommended retail
          price.
        </p>
        <p>
          We may correct pricing errors, and may change prices at any time before an
          order is accepted. If a genuine pricing error is discovered after you
          order, we will contact you and offer either the corrected price or a full
          refund.
        </p>
      </PolicySection>

      <PolicySection heading="Orders and stock">
        <p>
          Placing an order is an offer to buy. Our acceptance happens when we confirm
          the order. Because stock is shared with our other sales channels, an item
          can occasionally sell out after you order — if that happens we will tell
          you promptly and refund you in full.
        </p>
        <p>
          We may cancel an order where we suspect fraud, where the delivery address
          is outside the areas we serve, or where a pricing or stock error has
          occurred.
        </p>
      </PolicySection>

      <PolicySection heading="Coupons and discounts">
        <p>
          Discount codes are valid for the period and conditions stated, cannot be
          exchanged for cash, and may carry minimum order values or usage limits.
          Unless stated otherwise, only one code may be used per order.
        </p>
      </PolicySection>

      <PolicySection heading="Delivery, returns and refunds">
        <p>
          Delivery timelines and charges are set out in our{" "}
          <Link href="/shipping" className="text-izhaana-burgundy hover:underline">
            Shipping Policy
          </Link>
          , and returns, cancellations and refunds in our{" "}
          <Link href="/refund" className="text-izhaana-burgundy hover:underline">
            Refund &amp; Cancellation Policy
          </Link>
          . Both form part of these terms.
        </p>
      </PolicySection>

      <PolicySection heading="Your account">
        <p>
          You are responsible for keeping your password secure and for activity under
          your account. Please tell us promptly if you believe someone else has
          gained access to it. Provide accurate details — we rely on your address and
          phone number to deliver your order.
        </p>
      </PolicySection>

      <PolicySection heading="Reviews you submit">
        <p>
          Reviews must be your own honest experience of a product you bought. We
          moderate reviews before they appear and may decline to publish content that
          is abusive, misleading, off-topic, promotional or unlawful. By submitting a
          review you allow us to display it on the site alongside your first name.
        </p>
      </PolicySection>

      <PolicySection heading="Intellectual property">
        <p>
          The product photography, text and design on this site belong to us or our
          suppliers and may not be copied or reused commercially without permission.
        </p>
      </PolicySection>

      <PolicySection heading="Liability">
        <p>
          We take care to run the shop properly, but we do not guarantee the site
          will be uninterrupted or error-free. To the extent permitted by law, our
          liability for any order is limited to the amount you paid for it. Nothing
          in these terms limits rights you have under Indian consumer law that cannot
          be excluded.
        </p>
      </PolicySection>

      <PolicySection heading="Governing law and contact">
        <p>
          These terms are governed by the laws of India, and disputes fall under the
          jurisdiction of the courts in the state where our business is registered.
        </p>
        <p>
          Questions about these terms can be sent to{" "}
          <a
            href={`mailto:${BUSINESS.email}`}
            className="text-izhaana-burgundy hover:underline"
          >
            {BUSINESS.email}
          </a>
          , or via our{" "}
          <Link href="/contact" className="text-izhaana-burgundy hover:underline">
            contact page
          </Link>
          .
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
