import Link from "next/link";
import { BUSINESS } from "@/lib/business";
import { PolicyPage, PolicySection } from "@/components/layout/PolicyPage";

export const metadata = {
  title: "Privacy Policy",
  description:
    "What data IZHAANA ENTERPRISES collects, why, and how you can control it.",
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      intro={`This policy explains what ${BUSINESS.legalName} collects when you use this website, why we collect it, and what choices you have.`}
    >
      <PolicySection heading="What we collect">
        <p>When you create an account or place an order we collect:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>your name, email address and phone number</li>
          <li>delivery addresses you save or enter at checkout</li>
          <li>your order history, returns and any support messages you send us</li>
          <li>reviews you submit, shown publicly with your first name only</li>
        </ul>
        <p>
          We do <strong>not</strong> store your card details. Payments are handled
          by our payment gateway, and card and UPI information is entered on their
          systems, never ours.
        </p>
        <p>
          Your password is stored only as a salted cryptographic hash — we cannot
          read it, and neither can anyone with access to our database.
        </p>
      </PolicySection>

      <PolicySection heading="Why we use it">
        <ul className="list-disc space-y-1 pl-5">
          <li>to process, pack, ship and invoice your orders</li>
          <li>to calculate GST correctly for your state</li>
          <li>to send order confirmations and delivery updates</li>
          <li>to handle returns, refunds and support requests</li>
          <li>to keep the required records for tax and accounting</li>
        </ul>
        <p>
          We do not sell your personal data, and we do not use it for advertising
          profiles.
        </p>
      </PolicySection>

      <PolicySection heading="Who we share it with">
        <p>
          We share only what is necessary, with providers who help us run the shop:
          delivery carriers (to deliver your parcel), our payment gateway (to take
          payment), our email provider (to send order emails), and our hosting and
          database providers (to run the site).
        </p>
        <p>
          We may also disclose information where we are legally required to, for
          example to tax authorities or in response to a lawful order.
        </p>
      </PolicySection>

      <PolicySection heading="Cookies">
        <p>
          We use a small number of essential cookies to keep you signed in and to
          remember your shopping bag. These are required for the site to work and
          are not used for tracking you across other websites.
        </p>
      </PolicySection>

      <PolicySection heading="How long we keep it">
        <p>
          Account and order records are kept for as long as your account is open,
          and afterwards for as long as tax and accounting law requires us to retain
          invoices. Support messages are kept while they are useful for resolving
          your query.
        </p>
      </PolicySection>

      <PolicySection heading="Your choices">
        <p>
          You can view and update your name, phone number and saved addresses at any
          time from{" "}
          <Link
            href="/account/profile"
            className="text-izhaana-burgundy hover:underline"
          >
            My Details
          </Link>
          , and change your password there too.
        </p>
        <p>
          To request a copy of your data, or ask us to delete your account, email{" "}
          <a
            href={`mailto:${BUSINESS.email}`}
            className="text-izhaana-burgundy hover:underline"
          >
            {BUSINESS.email}
          </a>
          . Note that we may need to retain invoice records even after an account is
          closed, where the law requires it.
        </p>
      </PolicySection>

      <PolicySection heading="Children">
        <p>
          This site is not intended for children under 18, and we do not knowingly
          collect their personal information.
        </p>
      </PolicySection>

      <PolicySection heading="Changes and contact">
        <p>
          We may update this policy as the shop changes; the revision date at the
          top will always tell you when. Questions about privacy can be sent to{" "}
          <a
            href={`mailto:${BUSINESS.email}`}
            className="text-izhaana-burgundy hover:underline"
          >
            {BUSINESS.email}
          </a>
          .
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
