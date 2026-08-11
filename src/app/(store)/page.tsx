import Link from "next/link";
import { Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getRatingsFor } from "@/lib/reviews";
import { ProductCard } from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/Button";
import { HomeHero } from "@/components/home/HomeHero";
import { FadeInSection } from "@/components/home/FadeInSection";

const perks = [
  { icon: Truck, title: "Free Shipping", description: "On orders over ₹2,999" },
  { icon: RotateCcw, title: "Easy Returns", description: "30-day hassle-free returns" },
  { icon: ShieldCheck, title: "Secure Checkout", description: "Encrypted payments via Stripe" },
];

export default async function HomePage() {
  const featured = await prisma.product.findMany({
    where: { featured: true, active: true },
    include: { category: true, variants: true },
    take: 8,
  });

  const ratings = await getRatingsFor(featured.map((p) => p.id));

  return (
    <>
      <HomeHero />

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
        <FadeInSection className="text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-izhaana-burgundy">Featured</p>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">Our Favourites</h2>
          <div className="mx-auto mt-5 h-px w-16 bg-izhaana-gold" />
        </FadeInSection>
        <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-4">
          {featured.map((product, i) => (
            <FadeInSection key={product.id} delay={i * 0.08}>
              <ProductCard product={product} rating={ratings[product.id]} />
            </FadeInSection>
          ))}
        </div>
        <FadeInSection className="mt-16 text-center">
          <Link href="/shop">
            <Button variant="outline" size="lg" className="min-w-[200px]">
              View All Products
            </Button>
          </Link>
        </FadeInSection>
      </section>

      <section className="border-t border-izhaana-charcoal/10 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {perks.map((perk, i) => (
              <FadeInSection key={perk.title} delay={i * 0.1} className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-izhaana-cream text-izhaana-burgundy">
                  <perk.icon size={24} strokeWidth={1.5} />
                </div>
                <h3 className="mt-5 font-serif text-xl">{perk.title}</h3>
                <p className="mt-2 text-sm text-izhaana-charcoal/60">{perk.description}</p>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
