"use client";

import Link from "next/link";
import { Coffee, LogOut, Menu, Moon, ShoppingBag, Sun, UserRound, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useCart } from "@/context/cart-context";

const nav = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/reservations", label: "Reserve" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const { items } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";
  const visibleNav = isAdmin ? [...nav, { href: "/admin", label: "Admin" }] : nav;

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-background/88 backdrop-blur-xl">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-brand text-white">
            <Coffee size={22} />
          </span>
          <span>
            <span className="block font-serif text-xl font-bold leading-none">Brew & Bite</span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Cafe</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {visibleNav.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-semibold text-muted hover:text-brand">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="grid size-11 place-items-center rounded-full border border-line bg-card text-foreground"
          >
            <Sun className="hidden dark:block" size={18} />
            <Moon className="dark:hidden" size={18} />
          </button>
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative grid size-11 place-items-center rounded-full bg-foreground text-background"
          >
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-brand-2 text-xs font-black text-foreground">
                {count}
              </span>
            )}
          </Link>
          {session?.user ? (
            <button
              aria-label="Logout"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="hidden h-11 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-bold text-foreground lg:inline-flex"
            >
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="hidden h-11 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-bold text-foreground lg:inline-flex"
            >
              <UserRound size={16} /> Login
            </Link>
          )}
          <button
            aria-label="Open menu"
            onClick={() => setOpen((value) => !value)}
            className="grid size-11 place-items-center rounded-full border border-line bg-card lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-line bg-card px-4 py-4 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            {visibleNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 font-semibold hover:bg-background"
              >
                {item.label}
              </Link>
            ))}
            {session?.user ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-2xl px-4 py-3 text-left font-semibold hover:bg-background"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 font-semibold hover:bg-background"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
