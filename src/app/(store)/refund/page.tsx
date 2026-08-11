import Link from "next/link";
import { BUSINESS } from "@/lib/business";
import { PolicyPage, PolicySection } from "@/components/layout/PolicyPage";

export const metadata = {
  title: "Refund & Cancellation Policy",
  description:
    "How returns, refunds and order cancellations work at IZHAANA ENTERPRISES.",
};

export default function RefundPolicyPage() {
  return (
    <PolicyPage
      title="Refund & Cancellation Policy"
      intro={`Returns are accepted within ${BUSINESS.returnWindowDays} days on unworn items with their tags attached.`}
    >
      <PolicySection heading="Cancelling an order">
        <p>
          You can cancel an order at no cost any time before it is dispatched —
          raise it from{" "}
          <Link
            href="/account/support"
            className="text-izhaana-burgundy hover:underline"
          >
            Help &amp; Issues
          </Link>{" "}
          in your account, or email us. Once a parcel has been handed to the
          carrier it can no longer be cancelled, but you can return it under the
          policy below.
        </p>
      </PolicySection>

      <PolicySection heading="What can be returned">
        <p>
          We accept returns within {BUSINESS.returnWindowDays} days of delivery,
          provided the item is:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>unworn, unwashed and unaltered</li>
          <li>still carrying its original tags and packaging</li>
          <li>free of stains, perfume or any signs of use</li>
        </ul>
        <p>
          Unstitched dress materials must be returned uncut. Once fabric has been
          cut or tailored we are unable to accept it back, as it can no longer be
          resold.
        </p>
      </PolicySection>

      <PolicySection heading="What can't be returned">
        <ul className="list-disc space-y-1 pl-5">
          <li>fabric that has been cut, stitched or altered</li>
          <li>items returned without tags, or after {BUSINESS.returnWindowDays} days</li>
          <li>personal care and hygiene products once opened</li>
          <li>items marked as final sale at the time of purchase</li>
        </ul>
        <p>
          Minor irregularities in hand-block printing — slight colour variation,
          small print misalignment, or tiny weave marks — are inherent to
          handcrafted textiles and are not considered defects.
        </p>
      </PolicySection>

      <PolicySection heading="How to request a return">
        <p>
          Open the order under{" "}
          <Link href="/account" className="text-izhaana-burgundy hover:underline">
            My Account
          </Link>{" "}
          and choose <strong>Request a return</strong>, telling us the reason. We
          review requests within 2 business days and will confirm the return
          address and next steps.
        </p>
      </PolicySection>

      <PolicySection heading="Refund timelines">
        <p>
          Once we receive the item and confirm its condition, refunds are issued to
          the original payment method within 5–7 business days. Depending on your
          bank or card issuer it may take a further 3–5 business days to appear on
          your statement.
        </p>
        <p>
          Original shipping charges are refunded only where the item arrived damaged
          or the wrong product was sent. Return postage is otherwise borne by the
          customer.
        </p>
      </PolicySection>

      <PolicySection heading="Wrong or damaged items">
        <p>
          If we sent the wrong item, or it arrived damaged, tell us within 48 hours
          of delivery with photographs. We&apos;ll arrange a replacement or a full
          refund including shipping, at no cost to you.
        </p>
      </PolicySection>

      <PolicySection heading="Questions">
        <p>
          Email{" "}
          <a
            href={`mailto:${BUSINESS.email}`}
            className="text-izhaana-burgundy hover:underline"
          >
            {BUSINESS.email}
          </a>{" "}
          and we&apos;ll help. Support hours are {BUSINESS.supportHours}.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
