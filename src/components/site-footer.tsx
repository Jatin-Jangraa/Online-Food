import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
        <div>
          <h2 className="font-serif text-2xl font-bold">Brew & Bite Cafe</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted">
            Warm cafe plates, specialty coffee, pickup, delivery, and table reservations from one polished storefront.
          </p>
        </div>
        <div>
          <h3 className="font-bold">Visit</h3>
          <div className="mt-3 space-y-2 text-sm text-muted">
            <p className="flex gap-2"><MapPin size={16} /> 24 Park Street, Kolkata</p>
            <p className="flex gap-2"><Phone size={16} /> +91 98765 43210</p>
            <p className="flex gap-2"><Mail size={16} /> hello@brewandbite.in</p>
          </div>
        </div>
        <div>
          <h3 className="font-bold">Explore</h3>
          <div className="mt-3 grid gap-2 text-sm text-muted">
            <Link href="/menu">Order online</Link>
            <Link href="/reservations">Reserve a table</Link>
            <Link href="/contact">Contact us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
