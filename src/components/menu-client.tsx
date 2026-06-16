"use client";

import Image from "next/image";
import { Search, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { FoodCard } from "@/components/food-card";
import { EmptyState, Section } from "@/components/ui";
import { Category, FoodItem, Offer } from "@/types";

export function MenuClient({ categories, items, offer }: { categories: Category[]; items: FoodItem[]; offer?: Offer }) {
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(params.get("category") ?? "all");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = `${item.name} ${item.description} ${item.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "all" || item.category === category;
      const matchesFilter =
        filter === "all" ||
        (filter === "veg" && item.isVeg) ||
        (filter === "featured" && item.isFeatured) ||
        (filter === "high" && item.rating >= 4.8);
      return matchesSearch && matchesCategory && matchesFilter;
    });
  }, [items, query, category, filter]);

  return (
    <Section eyebrow="Order online" title="Menu crafted for slow mornings and quick cravings">
      {offer && (
        <div className="mb-8 grid overflow-hidden rounded-[2rem] border border-line bg-foreground text-background md:grid-cols-[1fr_18rem]">
          <div className="p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-2">{offer.code ?? "Special offer"}</p>
            <h2 className="mt-3 font-serif text-3xl font-bold">{offer.title}</h2>
            <p className="mt-3 max-w-xl text-background/75">{offer.subtitle}</p>
            <a href={offer.ctaHref} className="mt-5 inline-flex rounded-full bg-brand px-5 py-3 text-sm font-bold text-white">{offer.ctaLabel}</a>
          </div>
          <div className="relative h-64 md:h-full">
            <Image src={offer.image} alt={offer.title} fill sizes="(min-width: 768px) 18rem, 100vw" className="object-cover" />
          </div>
        </div>
      )}
      <div className="mb-8 grid gap-4 rounded-[2rem] border border-line bg-card p-4 lg:grid-cols-[1fr_auto_auto]">
        <label className="flex h-12 items-center gap-3 rounded-full border border-line bg-background px-4">
          <Search size={18} className="text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search coffee, bowls, desserts..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </label>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-12 rounded-full border border-line bg-background px-4 text-sm font-semibold">
          <option value="all">All categories</option>
          {categories.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
        </select>
        <label className="flex h-12 items-center gap-3 rounded-full border border-line bg-background px-4">
          <SlidersHorizontal size={18} className="text-muted" />
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="bg-transparent text-sm font-semibold outline-none">
            <option value="all">All filters</option>
            <option value="veg">Vegetarian</option>
            <option value="featured">Featured</option>
            <option value="high">4.8+ rated</option>
          </select>
        </label>
      </div>

      {filtered.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => <FoodCard key={item.id} item={item} />)}
        </div>
      ) : (
        <EmptyState title="No dishes found" text="Try a different category, search term, or filter." />
      )}
    </Section>
  );
}
