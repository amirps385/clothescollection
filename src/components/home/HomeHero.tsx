"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1920&q=80";

export function HomeHero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden text-izhaana-cream">
      <Image
        src={HERO_IMAGE}
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-izhaana-charcoal via-izhaana-charcoal/70 to-izhaana-charcoal/30" />
      <div className="absolute inset-0 bg-gradient-to-br from-izhaana-burgundy/25 via-transparent to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto max-w-3xl px-4 text-center"
      >
        <p className="text-sm uppercase tracking-[0.35em] text-izhaana-gold">
          New Collection
        </p>
        <h1 className="mt-5 font-serif text-6xl leading-[1.05] sm:text-8xl">
          Timeless Elegance
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-izhaana-cream/80 leading-relaxed">
          Handcrafted sarees, suit materials and everyday essentials, curated
          for those who appreciate refined style.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/shop">
            <Button size="lg" className="min-w-[200px]">
              Shop Collection
            </Button>
          </Link>
          <Link href="/shop?category=sarees">
            <Button
              variant="outline"
              size="lg"
              className="min-w-[200px] border-izhaana-cream/40 text-izhaana-cream hover:bg-izhaana-cream/10"
            >
              Shop Sarees
            </Button>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-izhaana-cream/60"
      >
        Scroll to explore
      </motion.div>
    </section>
  );
}
