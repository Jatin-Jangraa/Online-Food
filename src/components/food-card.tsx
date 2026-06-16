"use client";

import Image from "next/image";
import { Minus, Plus, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";
import { ReviewForm } from "@/components/review-form";
import { useCart } from "@/context/cart-context";
import { formatMoney } from "@/lib/money";
import { FoodItem } from "@/types";

export function FoodCard({ item }: { item: FoodItem }) {
  const { addItem } = useCart();
  const [size, setSize] = useState(item.customizations.sizes[0]?.label ?? "Regular");
  const [level, setLevel] = useState(item.customizations.levels[1] ?? "Balanced");
  const [quantity, setQuantity] = useState(1);
  const [toppings, setToppings] = useState<string[]>([]);
  const [added, setAdded] = useState(false);

  function toggleTopping(label: string) {
    setToppings((current) => (current.includes(label) ? current.filter((entry) => entry !== label) : [...current, label]));
  }

  function handleAdd() {
    addItem(item, { size, level, toppings, quantity });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <article className="overflow-hidden rounded-[2rem] border border-line bg-card premium-shadow">
      <div className="relative h-56 overflow-hidden">
        <Image
          src={item.images?.[0] ?? item.image}
          alt={item.name}
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-500 hover:scale-105"
        />
        <div className="absolute left-4 top-4 flex gap-2">
          {item.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-brand">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-5 p-5">
        <div>
          <div className="mb-2 flex items-start justify-between gap-4">
            <h3 className="text-xl font-bold">{item.name}</h3>
            <span className="font-bold text-brand">{formatMoney(item.price)}</span>
          </div>
          <p className="min-h-12 text-sm leading-6 text-muted">{item.description}</p>
          <p className="mt-3 flex items-center gap-1 text-sm font-semibold">
            <Star size={16} className="fill-brand-2 text-brand-2" /> {item.rating} <span className="text-muted">({item.reviews})</span>
          </p>
          <div className="mt-3">
            <ReviewForm foodId={item.id} />
          </div>
        </div>

        <div className="grid gap-3">
          <select value={size} onChange={(event) => setSize(event.target.value)} className="h-11 rounded-2xl border border-line bg-background px-3 text-sm">
            {item.customizations.sizes.map((option) => (
              <option key={option.label} value={option.label}>
                {option.label} {option.price ? `+ ${formatMoney(option.price)}` : ""}
              </option>
            ))}
          </select>
          <select value={level} onChange={(event) => setLevel(event.target.value)} className="h-11 rounded-2xl border border-line bg-background px-3 text-sm">
            {item.customizations.levels.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            {item.customizations.toppings.slice(0, 3).map((option) => (
              <button
                key={option.label}
                onClick={() => toggleTopping(option.label)}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                  toppings.includes(option.label) ? "border-brand bg-brand text-white" : "border-line bg-background"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center rounded-full border border-line bg-background">
            <button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="grid size-10 place-items-center">
              <Minus size={15} />
            </button>
            <span className="w-9 text-center text-sm font-bold">{quantity}</span>
            <button aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)} className="grid size-10 place-items-center">
              <Plus size={15} />
            </button>
          </div>
          <button onClick={handleAdd} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-brand px-4 text-sm font-bold text-white">
            <ShoppingBag size={16} /> {added ? "Added" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
