"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  Warehouse,
  RotateCcw,
  LifeBuoy,
  Store,
  UserCircle,
  Star,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Nav lives here rather than in the server layout because the icons are React
 * components, which can't be serialised across the server/client boundary.
 */
const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/returns", label: "Returns", icon: RotateCcw },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/support", label: "Support", icon: LifeBuoy },
];

const secondaryItems = [
  { href: "/", label: "View store", icon: Store },
  { href: "/account", label: "My account", icon: UserCircle },
];

const linkClass =
  "flex items-center gap-3 rounded px-3 py-2.5 text-sm transition-colors";

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav className="px-3 pb-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            linkClass,
            isActive(item.href)
              ? "bg-izhaana-cream/10 font-medium text-izhaana-cream"
              : "text-izhaana-cream/70 hover:bg-izhaana-cream/10 hover:text-izhaana-cream"
          )}
        >
          <item.icon size={18} />
          {item.label}
        </Link>
      ))}

      <div className="my-3 border-t border-izhaana-cream/10" />

      {secondaryItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            linkClass,
            "text-izhaana-cream/70 hover:bg-izhaana-cream/10 hover:text-izhaana-cream"
          )}
        >
          <item.icon size={18} />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="p-6">
      <Link
        href="/admin"
        className="font-serif text-xl tracking-widest text-izhaana-gold"
      >
        IZHAANA
      </Link>
      <p className="mt-1 text-xs text-izhaana-cream/40">Admin Panel</p>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the drawer once a navigation lands.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen">
      {/* Desktop: permanent sidebar. Mobile drawer is rendered separately below
          so neither depends on conditional transform classes. */}
      <aside className="hidden w-64 flex-shrink-0 overflow-y-auto border-r border-izhaana-charcoal/10 bg-izhaana-charcoal text-izhaana-cream lg:block">
        <Brand />
        <SidebarNav />
      </aside>

      {open && (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/50"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto bg-izhaana-charcoal text-izhaana-cream shadow-xl">
            <div className="flex items-start justify-between">
              <Brand />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="p-6 text-izhaana-cream/60 hover:text-izhaana-cream"
              >
                <X size={20} />
              </button>
            </div>
            <SidebarNav onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* min-w-0 lets wide tables scroll inside their own overflow-x-auto
          wrapper instead of stretching the whole page. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 bg-izhaana-charcoal px-4 py-3 text-izhaana-cream lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <span className="font-serif tracking-widest text-izhaana-gold">
            IZHAANA
          </span>
          <span className="text-xs text-izhaana-cream/40">Admin</span>
        </header>

        <main className="min-w-0 flex-1 bg-izhaana-cream p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
