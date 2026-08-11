import type { ReactNode } from "react";
import { LAST_UPDATED } from "@/lib/business";

interface PolicyPageProps {
  title: string;
  intro?: string;
  /** Policy pages show a revision date; About/Contact don't need one. */
  showUpdated?: boolean;
  children: ReactNode;
}

export function PolicyPage({
  title,
  intro,
  showUpdated = true,
  children,
}: PolicyPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl sm:text-5xl">{title}</h1>
      <div className="mt-5 h-px w-16 bg-izhaana-gold" />

      {intro && (
        <p className="mt-6 text-lg leading-relaxed text-izhaana-charcoal/70">
          {intro}
        </p>
      )}

      {showUpdated && (
        <p className="mt-4 text-xs uppercase tracking-widest text-izhaana-charcoal/45">
          Last updated {LAST_UPDATED}
        </p>
      )}

      <div className="policy-body mt-10 space-y-8">{children}</div>
    </div>
  );
}

/** A titled block within a policy page. */
export function PolicySection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-serif text-2xl">{heading}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-izhaana-charcoal/75">
        {children}
      </div>
    </section>
  );
}
