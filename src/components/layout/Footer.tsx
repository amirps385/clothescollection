import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-izhaana-gold/20 bg-izhaana-charcoal text-izhaana-cream">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="font-serif text-xl tracking-[0.15em] text-izhaana-gold">IZHAANA</h3>
            <p className="mt-3 text-sm text-izhaana-cream/60 leading-relaxed">
              Handcrafted sarees, suit materials and everyday essentials, curated with elegance and intention.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium uppercase tracking-widest">Shop</h4>
            <ul className="mt-4 space-y-2 text-sm text-izhaana-cream/60">
              <li><Link href="/shop" className="hover:text-izhaana-gold">All Products</Link></li>
              <li><Link href="/shop?category=sarees" className="hover:text-izhaana-gold">Sarees</Link></li>
              <li><Link href="/shop?category=suit-dress-materials" className="hover:text-izhaana-gold">Suit & Dress Materials</Link></li>
              <li><Link href="/shop?category=handkerchiefs" className="hover:text-izhaana-gold">Handkerchiefs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium uppercase tracking-widest">Support</h4>
            <ul className="mt-4 space-y-2 text-sm text-izhaana-cream/60">
              <li><Link href="/contact" className="hover:text-izhaana-gold">Contact Us</Link></li>
              <li><Link href="/shipping" className="hover:text-izhaana-gold">Shipping Policy</Link></li>
              <li><Link href="/refund" className="hover:text-izhaana-gold">Refund &amp; Cancellation</Link></li>
              <li><Link href="/account/returns" className="hover:text-izhaana-gold">Request a Return</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium uppercase tracking-widest">Company</h4>
            <ul className="mt-4 space-y-2 text-sm text-izhaana-cream/60">
              <li><Link href="/about" className="hover:text-izhaana-gold">About Us</Link></li>
              <li><Link href="/privacy" className="hover:text-izhaana-gold">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-izhaana-gold">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-izhaana-cream/10 pt-6 text-center text-xs text-izhaana-cream/40">
          &copy; {new Date().getFullYear()} IZHAANA Enterprises. All rights reserved. GSTIN: {process.env.COMPANY_GSTIN ?? "22AAAAA0000A1Z5"}
        </div>
      </div>
    </footer>
  );
}
