import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  Warehouse,
  RotateCcw,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/returns", label: "Returns", icon: RotateCcw },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 flex-shrink-0 border-r border-izhaana-charcoal/10 bg-izhaana-charcoal text-izhaana-cream">
        <div className="p-6">
          <Link href="/" className="font-serif text-xl tracking-widest text-izhaana-gold">
            IZHAANA
          </Link>
          <p className="mt-1 text-xs text-izhaana-cream/40">Admin Panel</p>
        </div>
        <nav className="px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded px-3 py-2.5 text-sm text-izhaana-cream/70 hover:bg-izhaana-cream/10 hover:text-izhaana-cream transition-colors"
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-izhaana-cream p-8">{children}</main>
    </div>
  );
}
