import Link from "next/link";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { BUSINESS } from "@/lib/business";
import { PolicyPage } from "@/components/layout/PolicyPage";

export const metadata = {
  title: "Contact Us",
  description: `Get in touch with ${BUSINESS.legalName} about an order, a product or a return.`,
};

export default function ContactPage() {
  return (
    <PolicyPage
      title="Contact Us"
      intro="Questions about an order, a fabric or a return? We're happy to help."
      showUpdated={false}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="border border-izhaana-charcoal/10 bg-white p-6">
          <Mail size={20} strokeWidth={1.5} className="text-izhaana-burgundy" />
          <h2 className="mt-3 font-serif text-lg">Email</h2>
          <a
            href={`mailto:${BUSINESS.email}`}
            className="mt-1 block text-sm text-izhaana-burgundy hover:underline"
          >
            {BUSINESS.email}
          </a>
          <p className="mt-2 text-sm text-izhaana-charcoal/55">
            We reply within 1–2 business days.
          </p>
        </div>

        {BUSINESS.phone && (
          <div className="border border-izhaana-charcoal/10 bg-white p-6">
            <Phone size={20} strokeWidth={1.5} className="text-izhaana-burgundy" />
            <h2 className="mt-3 font-serif text-lg">Phone</h2>
            <a
              href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}
              className="mt-1 block text-sm text-izhaana-burgundy hover:underline"
            >
              {BUSINESS.phone}
            </a>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-izhaana-charcoal/55">
              <Clock size={13} />
              {BUSINESS.supportHours}
            </p>
          </div>
        )}

        {BUSINESS.address && (
          <div className="border border-izhaana-charcoal/10 bg-white p-6 sm:col-span-2">
            <MapPin size={20} strokeWidth={1.5} className="text-izhaana-burgundy" />
            <h2 className="mt-3 font-serif text-lg">Registered address</h2>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-izhaana-charcoal/70">
              {BUSINESS.address}
            </p>
            {BUSINESS.gstin && (
              <p className="mt-3 text-xs text-izhaana-charcoal/50">
                GSTIN: {BUSINESS.gstin}
              </p>
            )}
          </div>
        )}
      </div>

      <section className="border border-izhaana-gold/30 bg-izhaana-cream/60 p-6">
        <h2 className="font-serif text-xl">Already placed an order?</h2>
        <p className="mt-2 text-sm leading-relaxed text-izhaana-charcoal/70">
          The quickest route is to raise it from your account — we&apos;ll see your
          order details alongside your message, and you can track our reply.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <Link
            href="/account/support"
            className="text-izhaana-burgundy hover:underline"
          >
            Raise an issue →
          </Link>
          <Link
            href="/account/returns"
            className="text-izhaana-burgundy hover:underline"
          >
            Request a return →
          </Link>
        </div>
      </section>
    </PolicyPage>
  );
}
