"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ButtonLink, EmptyState, Section } from "@/components/ui";
import { useCart } from "@/context/cart-context";
import { formatMoney } from "@/lib/money";

export function CartClient() {
  const { items, updateQuantity, removeItem, subtotal, tax, delivery, discount, total, coupon, couponMessage, applyCoupon } = useCart();
  const [code, setCode] = useState(coupon);
  const [applying, setApplying] = useState(false);

  async function handleApplyCoupon() {
    setApplying(true);
    await applyCoupon(code);
    setApplying(false);
  }

  if (!items.length) {
    return (
      <Section eyebrow="Cart" title="Your cart is waiting">
        <EmptyState title="No items yet" text="Add a latte, bowl, or dessert from the menu to begin checkout." />
        <div className="mt-6"><ButtonLink href="/menu">Browse menu</ButtonLink></div>
      </Section>
    );
  }

  return (
    <Section eyebrow="Cart" title="Review your order">
      <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.cartId} className="grid gap-4 rounded-[2rem] border border-line bg-card p-4 sm:grid-cols-[8rem_1fr_auto]">
              <div className="relative h-32 w-full overflow-hidden rounded-3xl sm:w-32">
                <Image src={item.image} alt={item.name} fill sizes="8rem" className="object-cover" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p className="mt-1 text-sm text-muted">{item.size} - {item.level}</p>
                <p className="mt-1 text-sm text-muted">{item.toppings.length ? item.toppings.join(", ") : "No extra toppings"}</p>
                <p className="mt-4 font-bold text-brand">{formatMoney(item.basePrice)} each</p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                <button aria-label="Remove item" onClick={() => removeItem(item.cartId)} className="grid size-10 place-items-center rounded-full border border-line text-muted hover:text-brand">
                  <Trash2 size={17} />
                </button>
                <div className="flex items-center rounded-full border border-line bg-background">
                  <button aria-label="Decrease" onClick={() => updateQuantity(item.cartId, item.quantity - 1)} className="grid size-10 place-items-center"><Minus size={15} /></button>
                  <span className="w-9 text-center text-sm font-bold">{item.quantity}</span>
                  <button aria-label="Increase" onClick={() => updateQuantity(item.cartId, item.quantity + 1)} className="grid size-10 place-items-center"><Plus size={15} /></button>
                </div>
                <p className="font-bold">{formatMoney(item.lineTotal)}</p>
              </div>
            </article>
          ))}
        </div>

        <aside className="h-fit rounded-[2rem] border border-line bg-card p-6">
          <h2 className="text-xl font-bold">Bill details</h2>
          <div className="mt-5 flex gap-2">
            <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="CAFE20" className="h-12 min-w-0 flex-1 rounded-full border border-line bg-background px-4 outline-none" />
            <button onClick={handleApplyCoupon} disabled={applying} className="rounded-full bg-foreground px-5 text-sm font-bold text-background disabled:opacity-60">
              {applying ? "..." : "Apply"}
            </button>
          </div>
          {couponMessage && <p className="mt-3 text-sm font-semibold text-muted">{couponMessage}</p>}
          <div className="mt-6 space-y-3 text-sm">
            <Row label="Subtotal" value={formatMoney(subtotal)} />
            <Row label="Tax" value={formatMoney(tax)} />
            <Row label="Delivery" value={delivery ? formatMoney(delivery) : "Free"} />
            <Row label="Discount" value={`- ${formatMoney(discount)}`} />
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-line pt-5 text-lg font-black">
            <span>Total</span><span>{formatMoney(total)}</span>
          </div>
          <Link href="/checkout" className="mt-6 flex h-12 items-center justify-center rounded-full bg-brand font-bold text-white">Checkout</Link>
        </aside>
      </div>
    </Section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <p className="flex justify-between text-muted"><span>{label}</span><span className="font-semibold text-foreground">{value}</span></p>;
}
