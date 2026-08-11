"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "Overview" },
  { href: "/account/profile", label: "My Details" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/support", label: "Help & Issues" },
  { href: "/account/returns", label: "Returns" },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-x-6 gap-y-2 border-b border-izhaana-charcoal/10 pb-3">
      {links.map((link) => {
        const active =
          link.href === "/account"
            ? pathname === "/account"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-sm transition-colors hover:text-izhaana-burgundy",
              active
                ? "font-medium text-izhaana-burgundy"
                : "text-izhaana-charcoal/60"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
