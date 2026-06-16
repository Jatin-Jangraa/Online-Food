"use client";

import { useState } from "react";

type CouponView = {
  code: string;
  discountType: "percent" | "flat";
  value: number;
  minOrderValue?: number;
  expiresAt?: string;
};

export function AdminCouponManager({ initialCoupons }: { initialCoupons: CouponView[] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    code: "",
    discountType: "percent",
    value: "",
    minOrderValue: "0",
    expiresAt: "",
  });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      setMessage("Could not save coupon. Check MongoDB and required fields.");
      return;
    }
    const saved = await response.json();
    setCoupons((current) => [saved, ...current]);
    setMessage("Coupon created.");
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[24rem_1fr]">
      <form onSubmit={submit} className="grid h-fit gap-4 rounded-[2rem] border border-line bg-card p-6">
        <h2 className="text-xl font-bold">Create coupon</h2>
        <input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} placeholder="Code" className="h-12 rounded-2xl border border-line bg-background px-4 outline-none" />
        <select value={form.discountType} onChange={(event) => setForm({ ...form, discountType: event.target.value })} className="h-12 rounded-2xl border border-line bg-background px-4 outline-none">
          <option value="percent">Percent</option>
          <option value="flat">Flat</option>
        </select>
        <input value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} type="number" placeholder="Discount value" className="h-12 rounded-2xl border border-line bg-background px-4 outline-none" />
        <input value={form.minOrderValue} onChange={(event) => setForm({ ...form, minOrderValue: event.target.value })} type="number" placeholder="Minimum order" className="h-12 rounded-2xl border border-line bg-background px-4 outline-none" />
        <input value={form.expiresAt} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} type="date" className="h-12 rounded-2xl border border-line bg-background px-4 outline-none" />
        {message && <p className="rounded-2xl bg-background p-3 text-sm font-semibold text-muted">{message}</p>}
        <button className="h-12 rounded-full bg-brand font-bold text-white">Save coupon</button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {coupons.map((coupon) => (
          <div key={coupon.code} className="rounded-[2rem] border border-line bg-card p-6">
            <h2 className="text-2xl font-black">{coupon.code}</h2>
            <p className="mt-2 text-muted">
              {coupon.discountType === "percent" ? `${coupon.value}% off` : `Rs. ${coupon.value} off`} above Rs. {coupon.minOrderValue ?? 0}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
