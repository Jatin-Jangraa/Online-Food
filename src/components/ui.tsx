import Link from "next/link";
import { ReactNode } from "react";

export function Section({
  eyebrow,
  title,
  children,
  className = "",
}: {
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 ${className}`}>
      {(eyebrow || title) && (
        <div className="mb-9 max-w-2xl">
          {eyebrow && <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-brand">{eyebrow}</p>}
          {title && <h2 className="font-serif text-3xl font-bold text-foreground sm:text-5xl">{title}</h2>}
        </div>
      )}
      {children}
    </section>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      className={
        variant === "primary"
          ? "inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand/20 hover:bg-brand/90"
          : "inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-card px-6 py-3 text-sm font-bold text-foreground hover:border-brand"
      }
    >
      {children}
    </Link>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-card p-10 text-center">
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-2 text-muted">{text}</p>
    </div>
  );
}
