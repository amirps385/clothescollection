"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { UserMenu } from "@/components/layout/UserMenu";
import { SearchBox } from "@/components/shop/SearchBox";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=sarees", label: "Sarees" },
  { href: "/shop?category=suit-dress-materials", label: "Suit Materials" },
  { href: "/shop?category=handkerchiefs", label: "Handkerchiefs" },
  { href: "/about", label: "About" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount());
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-izhaana-charcoal/10 bg-izhaana-cream/95 backdrop-blur-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          className="lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link href="/" className="font-serif text-2xl tracking-[0.15em] text-izhaana-burgundy">
          IZHAANA
        </Link>

        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group relative py-2 text-sm uppercase tracking-widest transition-colors hover:text-izhaana-burgundy",
                pathname === link.href ? "text-izhaana-burgundy" : "text-izhaana-charcoal/70"
              )}
            >
              {link.label}
              <span
                className={cn(
                  "absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-izhaana-gold transition-transform duration-300 group-hover:scale-x-100",
                  pathname === link.href && "scale-x-100"
                )}
              />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <SearchBox />
          </div>
          <UserMenu />
          <Link href="/cart" className="relative text-izhaana-charcoal/70 hover:text-izhaana-burgundy">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-izhaana-burgundy text-[10px] font-medium text-white">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-izhaana-charcoal/10 bg-izhaana-cream px-4 py-4 lg:hidden">
          {/* The header magnifier is sm-and-up only, so phones had no way to
              search at all — this is their only entry point. */}
          <div className="pb-3 sm:hidden">
            <SearchBox variant="inline" onNavigate={() => setMobileOpen(false)} />
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-sm uppercase tracking-widest text-izhaana-charcoal/70 hover:text-izhaana-burgundy"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
