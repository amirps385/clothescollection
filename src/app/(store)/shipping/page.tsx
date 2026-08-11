import Link from "next/link";
import { BUSINESS } from "@/lib/business";
import { PolicyPage, PolicySection } from "@/components/layout/PolicyPage";

export const metadata = {
  title: "Shipping Policy",
  description:
    "Delivery timelines, shipping charges and tracking for IZHAANA ENTERPRISES orders.",
};

/** Kept in step with the shipping rates seeded in prisma/seed.ts. */
const RATES = [
  { name: "Standard Shipping", carrier: "India Post", days: "5–7 business days", price: "₹99" },
  { name: "Express Shipping", carrier: "Delhivery", days: "2–3 business days", price: "₹199" },
  { name: "Premium Delivery", carrier: "BlueDart", days: "1–2 business days", price: "₹349" },
];

export default function ShippingPolicyPage() {
  return (
    <PolicyPage
      title="Shipping Policy"
      intro={`We ship across India. Delivery is free on orders over ₹${BUSINESS.freeShippingOver.toLocaleString("en-IN")}.`}
    >
      <PolicySection heading="Dispatch time">
        <p>
          Orders are packed and dispatched within {BUSINESS.dispatchDays} of payment
          being confirmed. Orders placed on Sundays and public holidays are
          dispatched the next working day.
        </p>
      </PolicySection>

      <PolicySection heading="Delivery options and charges">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-izhaana-charcoal/15 text-left">
                <th className="py-2 pr-4 font-medium">Method</th>
                <th className="py-2 pr-4 font-medium">Carrier</th>
                <th className="py-2 pr-4 font-medium">Estimated delivery</th>
                <th className="py-2 font-medium">Charge</th>
              </tr>
            </thead>
            <tbody>
              {RATES.map((r) => (
                <tr key={r.name} className="border-b border-izhaana-charcoal/5">
                  <td className="py-2 pr-4">{r.name}</td>
                  <td className="py-2 pr-4">{r.carrier}</td>
                  <td className="py-2 pr-4">{r.days}</td>
                  <td className="py-2">{r.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Orders above ₹{BUSINESS.freeShippingOver.toLocaleString("en-IN")} ship free
          on the standard method. Delivery estimates are counted from dispatch, not
          from the time the order is placed.
        </p>
      </PolicySection>

      <PolicySection heading="Tracking your order">
        <p>
          Once your parcel leaves us we add the carrier and tracking number to your
          order. You can see it any time under{" "}
          <Link href="/account" className="text-izhaana-burgundy hover:underline">
            My Account
          </Link>{" "}
          by opening the order, along with a progress timeline from confirmed to
          delivered.
        </p>
      </PolicySection>

      <PolicySection heading="Delays outside our control">
        <p>
          Carriers occasionally run late because of weather, strikes, regional
          restrictions or incorrect or incomplete addresses. We&apos;ll help chase a
          delayed parcel, but we can&apos;t be held responsible for carrier delays
          once a shipment has been handed over.
        </p>
        <p>
          Please double-check your address and PIN code at checkout. If a parcel is
          returned to us as undeliverable due to an incorrect address, re-shipping
          charges will apply.
        </p>
      </PolicySection>

      <PolicySection heading="Damaged or missing parcels">
        <p>
          If your parcel arrives damaged or tampered with, please refuse delivery
          where possible and tell us within 48 hours with photographs so we can
          raise it with the carrier. Contact us at{" "}
          <a
            href={`mailto:${BUSINESS.email}`}
            className="text-izhaana-burgundy hover:underline"
          >
            {BUSINESS.email}
          </a>{" "}
          or through{" "}
          <Link
            href="/account/support"
            className="text-izhaana-burgundy hover:underline"
          >
            Help &amp; Issues
          </Link>
          .
        </p>
      </PolicySection>

      <PolicySection heading="International orders">
        <p>
          We currently ship within India only. If you&apos;d like to order from
          outside India, write to us and we&apos;ll see what we can arrange.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
