import Link from "next/link";
import { BUSINESS } from "@/lib/business";
import { Button } from "@/components/ui/Button";
import { PolicyPage, PolicySection } from "@/components/layout/PolicyPage";

export const metadata = {
  title: "About Us",
  description:
    "Hand-block printed sarees, unstitched suit materials and everyday essentials from IZHAANA ENTERPRISES.",
};

export default function AboutPage() {
  return (
    <PolicyPage
      title="About IZHAANA"
      intro="Hand-block printed sarees, unstitched dress materials and everyday essentials — chosen for the quality of the cloth and the care in the printing."
      showUpdated={false}
    >
      <PolicySection heading="What we sell">
        <p>
          Our range centres on traditional Indian textiles: handprinted silk blend
          sarees with zari and banarasi borders, unstitched three-piece suit and
          dress materials in pure cotton, chanderi silk and jam cotton, and
          hand-block printed Jaipuri sets. Alongside these we stock everyday
          essentials such as cotton handkerchiefs and sustainable personal care
          sets.
        </p>
        <p>
          Because most of our dress materials are unstitched, you get to choose
          your own fit and finish — the fabric, dupatta and bottom come together as
          a coordinated set, ready for your tailor.
        </p>
      </PolicySection>

      <PolicySection heading="How we work">
        <p>
          Prints are done by hand, which means small variations between pieces are
          normal and part of the character of block printing. Colours can also read
          slightly differently between screens and daylight.
        </p>
        <p>
          Every price on the site is inclusive of GST, and we show the tax rate on
          each product page so there are no surprises at checkout.
        </p>
      </PolicySection>

      <PolicySection heading="Delivery and returns">
        <p>
          We ship across India, with free delivery on orders over ₹
          {BUSINESS.freeShippingOver.toLocaleString("en-IN")}. Returns are accepted
          within {BUSINESS.returnWindowDays} days on unworn items with tags
          attached — the full details are in our{" "}
          <Link href="/shipping" className="text-izhaana-burgundy hover:underline">
            shipping
          </Link>{" "}
          and{" "}
          <Link href="/refund" className="text-izhaana-burgundy hover:underline">
            refund
          </Link>{" "}
          policies.
        </p>
      </PolicySection>

      <PolicySection heading="Get in touch">
        <p>
          We&apos;re a small team and we read every message. Reach us at{" "}
          <a
            href={`mailto:${BUSINESS.email}`}
            className="text-izhaana-burgundy hover:underline"
          >
            {BUSINESS.email}
          </a>
          , or from the contact page.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/shop">
            <Button>Browse the collection</Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline">Contact us</Button>
          </Link>
        </div>
      </PolicySection>
    </PolicyPage>
  );
}
