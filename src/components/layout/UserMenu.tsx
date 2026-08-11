"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  User,
  LayoutDashboard,
  Package,
  MapPin,
  LifeBuoy,
  LogOut,
} from "lucide-react";

const customerLinks = [
  { href: "/account", label: "My Account", icon: User },
  { href: "/account/profile", label: "My Details", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/support", label: "Help & Issues", icon: LifeBuoy },
];

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Signed out (or still resolving) — go straight to sign in.
  if (status !== "authenticated" || !session?.user) {
    return (
      <Link
        href="/login"
        aria-label="Sign in"
        title="Sign in"
        className="text-izhaana-charcoal/70 transition-colors hover:text-izhaana-burgundy"
      >
        <User size={20} />
      </Link>
    );
  }

  const isAdmin = session.user.role === "ADMIN";
  const firstName = session.user.name?.split(" ")[0] ?? "Account";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="flex items-center gap-1.5 text-izhaana-charcoal/70 transition-colors hover:text-izhaana-burgundy"
      >
        <User size={20} />
        <span className="hidden max-w-[9rem] truncate text-sm sm:block">
          {firstName}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-3 w-60 border border-izhaana-charcoal/10 bg-white shadow-xl"
        >
          <div className="border-b border-izhaana-charcoal/10 px-4 py-3">
            {session.user.name && (
              <p className="truncate text-sm font-medium">{session.user.name}</p>
            )}
            <p className="truncate text-xs text-izhaana-charcoal/55">
              {session.user.email}
            </p>
            {isAdmin && (
              <span className="mt-2 inline-block bg-izhaana-burgundy/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-izhaana-burgundy">
                Admin
              </span>
            )}
          </div>

          <div className="py-1">
            {isAdmin && (
              <Link
                href="/admin"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-izhaana-charcoal/80 transition-colors hover:bg-izhaana-cream hover:text-izhaana-burgundy"
              >
                <LayoutDashboard size={15} />
                Admin Dashboard
              </Link>
            )}

            {customerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-izhaana-charcoal/80 transition-colors hover:bg-izhaana-cream hover:text-izhaana-burgundy"
              >
                <link.icon size={15} />
                {link.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-izhaana-charcoal/10 py-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-izhaana-charcoal/80 transition-colors hover:bg-izhaana-cream hover:text-red-600"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
