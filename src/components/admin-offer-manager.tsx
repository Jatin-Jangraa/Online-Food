"use client";

import Image from "next/image";
import { useState } from "react";
import { Offer } from "@/types";

export function AdminOfferManager({ initialOffers }: { initialOffers: Offer[] }) {
  const [offers, setOffers] = useState(initialOffers);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    code: "",
    image: "",
    foodId: "",
    ctaLabel: "Order now",
    ctaHref: "/menu",
    placement: "home-banner",
    isActive: true,
  });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      setMessage("Could not save offer. Check MongoDB and required fields.");
      return;
    }
    const saved = await response.json();
    setOffers((current) => [
      {
        id: saved._id,
        title: saved.title,
        subtitle: saved.subtitle,
        code: saved.code,
        image: saved.image,
        foodId: saved.foodItem,
        ctaLabel: saved.ctaLabel,
        ctaHref: saved.ctaHref,
        placement: saved.placement,
        isActive: saved.isActive,
      },
      ...current,
    ]);
    setMessage("Offer banner created.");
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[25rem_1fr]">
      <form onSubmit={submit} className="grid h-fit gap-4 rounded-[2rem] border border-line bg-card p-6">
        <h2 className="text-xl font-bold">Create offer banner</h2>
        <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Offer title" className="h-12 rounded-2xl border border-line bg-background px-4 outline-none" />
        <textarea value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} placeholder="Offer subtitle" rows={3} className="rounded-2xl border border-line bg-background p-4 outline-none" />
        <input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} placeholder="Coupon code" className="h-12 rounded-2xl border border-line bg-background px-4 outline-none" />
        <input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="Banner image URL" className="h-12 rounded-2xl border border-line bg-background px-4 outline-none" />
        <input value={form.foodId} onChange={(event) => setForm({ ...form, foodId: event.target.value })} placeholder="Linked product ID optional" className="h-12 rounded-2xl border border-line bg-background px-4 outline-none" />
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={form.ctaLabel} onChange={(event) => setForm({ ...form, ctaLabel: event.target.value })} placeholder="Button label" className="h-12 rounded-2xl border border-line bg-background px-4 outline-none" />
          <input value={form.ctaHref} onChange={(event) => setForm({ ...form, ctaHref: event.target.value })} placeholder="Button link" className="h-12 rounded-2xl border border-line bg-background px-4 outline-none" />
        </div>
        <select value={form.placement} onChange={(event) => setForm({ ...form, placement: event.target.value })} className="h-12 rounded-2xl border border-line bg-background px-4 outline-none">
          <option value="home-banner">Home banner</option>
          <option value="home-hero">Home hero</option>
          <option value="menu-banner">Menu banner</option>
        </select>
        {message && <p className="rounded-2xl bg-background p-3 text-sm font-semibold text-muted">{message}</p>}
        <button className="h-12 rounded-full bg-brand font-bold text-white">Save offer</button>
      </form>
      <div className="grid gap-4">
        {offers.map((offer) => (
          <article key={offer.id} className="grid overflow-hidden rounded-[2rem] border border-line bg-card md:grid-cols-[16rem_1fr]">
            <div className="relative h-56 md:h-full">
              <Image src={offer.image} alt={offer.title} fill sizes="(min-width: 768px) 16rem, 100vw" className="object-cover" />
            </div>
            <div className="p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">{offer.placement}</p>
              <h2 className="mt-3 text-2xl font-black">{offer.title}</h2>
              <p className="mt-2 text-muted">{offer.subtitle}</p>
              {offer.code && <p className="mt-4 inline-flex rounded-full bg-brand/10 px-4 py-2 text-sm font-bold text-brand">{offer.code}</p>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
