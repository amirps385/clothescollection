"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface SearchBoxProps {
  /**
   * "icon" is the header magnifier, which expands into a field on click.
   * "inline" is a permanently visible field, for places with room for one —
   * the mobile menu (where the header icon is hidden) and the shop page.
   */
  variant?: "icon" | "inline";
  /** Current search term, so the shop page's field shows what was searched. */
  defaultValue?: string;
  /** Lets the mobile menu close itself once a search navigates away. */
  onNavigate?: () => void;
}

export function SearchBox({
  variant = "icon",
  defaultValue = "",
  onNavigate,
}: SearchBoxProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // The shop page keeps its field in step with the URL, so clearing a search
  // (or landing on a ?q= link) doesn't leave a stale term in the box.
  useEffect(() => setValue(defaultValue), [defaultValue]);

  // Expanding a field the shopper then has to click into would waste the click
  // that opened it.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }

    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const term = value.trim();
    // Submitting an empty box means "show me everything" rather than a dead end.
    router.push(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
    setOpen(false);
    onNavigate?.();
  }

  const field = (
    <form
      onSubmit={submit}
      role="search"
      className="flex items-center gap-2 border border-izhaana-charcoal/20 bg-white px-3 py-2 focus-within:border-izhaana-burgundy"
    >
      <Search size={16} className="shrink-0 text-izhaana-charcoal/40" />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search sarees, suit materials…"
        aria-label="Search products"
        maxLength={80}
        className="min-w-0 flex-1 bg-transparent text-sm placeholder:text-izhaana-charcoal/40 focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 bg-izhaana-burgundy px-3 py-1 text-xs uppercase tracking-widest text-white transition-opacity hover:opacity-90"
      >
        Search
      </button>
    </form>
  );

  if (variant === "inline") return field;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Search products"
        aria-expanded={open}
        className="block text-izhaana-charcoal/70 hover:text-izhaana-burgundy"
      >
        <Search size={20} />
      </button>

      {open && (
        // Anchored to the icon and floated over the nav, so opening the field
        // never reflows the header row.
        <div className="absolute right-0 top-full z-50 mt-3 w-[min(22rem,calc(100vw-2rem))] border border-izhaana-charcoal/15 bg-white p-2 shadow-xl">
          {field}
        </div>
      )}
    </div>
  );
}
