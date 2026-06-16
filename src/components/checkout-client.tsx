"use client";

import Link from "next/link";
import { CreditCard, MapPin, PackageCheck, Wallet } from "lucide-react";
import { useState } from "react";
import { Section } from "@/components/ui";
import { useCart } from "@/context/cart-context";
import { formatMoney } from "@/lib/money";
import { CheckoutAddress } from "@/types";

type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
};

type RazorpayConstructor = new (options: {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccess) => void;
  prefill: { name: string; email?: string; contact: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
}) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const emptyAddress: CheckoutAddress = { name: "", email: "", phone: "", line1: "", city: "", pincode: "" };

export function CheckoutClient({ initialAddress }: { initialAddress?: CheckoutAddress }) {
  const { items, subtotal, tax, delivery, discount, total, coupon, clearCart } = useCart();
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const [payment, setPayment] = useState<"cod" | "razorpay">("razorpay");
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState("");
  const [address, setAddress] = useState<CheckoutAddress>(initialAddress ?? emptyAddress);

  const orderPayload = {
    items: items.map((item) => ({
      foodItem: item.foodId,
      name: item.name,
      quantity: item.quantity,
      size: item.size,
      toppings: item.toppings,
      level: item.level,
      price: item.basePrice,
    })),
    fulfillment: mode,
    address: mode === "delivery" ? address : undefined,
    subtotal,
    tax,
    deliveryCharge: delivery,
    discount,
    total,
    couponCode: coupon,
    paymentMethod: payment,
    paymentStatus: payment === "cod" ? "Pending" : "Paid",
  };

  function loadRazorpayScript() {
    return new Promise<boolean>((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function saveOrder(extra: Record<string, unknown> = {}) {
    return fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...orderPayload, ...extra }),
    });
  }

  async function placeOrder() {
    setPlacing(true);
    setMessage("");

    if (mode === "delivery" && (!address.name || !address.email || !address.phone || !address.line1 || !address.city || !address.pincode)) {
      setPlacing(false);
      setMessage("Please complete the delivery address before placing the order.");
      return;
    }

    if (payment === "cod") {
      const response = await saveOrder({ paymentStatus: "Pending" });
      setPlacing(false);
      if (!response.ok) {
        setMessage("Could not place order. Check MongoDB connection.");
        return;
      }
      const order = await response.json();
      clearCart();
      window.location.href = `/order-confirmation?order=${order._id}`;
      return;
    }

    const scriptReady = await loadRazorpayScript();
    if (!scriptReady || !window.Razorpay) {
      setPlacing(false);
      setMessage("Razorpay checkout could not load. Check your internet connection.");
      return;
    }

    const razorpayResponse = await fetch("/api/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: total, receipt: `bnb_${Date.now()}` }),
    });

    if (!razorpayResponse.ok) {
      const data = await razorpayResponse.json().catch(() => ({}));
      setPlacing(false);
      setMessage(typeof data.error === "string" ? data.error : "Could not create Razorpay order.");
      return;
    }

    const razorpayOrder = await razorpayResponse.json();
    const checkout = new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "Brew & Bite Cafe",
      description: "Online food order",
      order_id: razorpayOrder.id,
      prefill: {
        name: address.name,
        email: address.email,
        contact: address.phone,
      },
      theme: { color: "#8f3f1f" },
      modal: {
        ondismiss: () => setPlacing(false),
      },
      handler: async (response) => {
        const orderSave = await saveOrder({
          paymentStatus: "Paid",
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
        setPlacing(false);
        if (!orderSave.ok) {
          const data = await orderSave.json().catch(() => ({}));
          setMessage(typeof data.error === "string" ? data.error : "Payment completed, but order save failed. Please contact support.");
          return;
        }
        const order = await orderSave.json();
        clearCart();
        window.location.href = `/order-confirmation?order=${order._id}`;
      },
    });
    checkout.open();
  }

  return (
    <Section eyebrow="Checkout" title="Choose delivery, pickup, and payment">
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-line bg-card p-6">
            <h2 className="mb-4 text-xl font-bold">Fulfilment</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["delivery", "Delivery", "Sent to your doorstep"],
                ["pickup", "Pickup", "Ready at the counter"],
              ].map(([value, title, text]) => (
                <button key={value} onClick={() => setMode(value as "delivery" | "pickup")} className={`rounded-3xl border p-5 text-left ${mode === value ? "border-brand bg-brand/10" : "border-line bg-background"}`}>
                  <PackageCheck className="mb-3 text-brand" />
                  <span className="block font-bold">{title}</span>
                  <span className="text-sm text-muted">{text}</span>
                </button>
              ))}
            </div>
          </div>

          {mode === "delivery" && (
            <form className="grid gap-4 rounded-[2rem] border border-line bg-card p-6 sm:grid-cols-2">
              <h2 className="sm:col-span-2 text-xl font-bold">Address</h2>
              <label><span className="mb-2 block text-sm font-semibold">Full name</span><input value={address.name} onChange={(event) => setAddress({ ...address, name: event.target.value })} required className="h-12 w-full rounded-2xl border border-line bg-background px-4 outline-none focus:border-brand" /></label>
              <label><span className="mb-2 block text-sm font-semibold">Email</span><input value={address.email} onChange={(event) => setAddress({ ...address, email: event.target.value })} type="email" required className="h-12 w-full rounded-2xl border border-line bg-background px-4 outline-none focus:border-brand" /></label>
              <label><span className="mb-2 block text-sm font-semibold">Phone</span><input value={address.phone} onChange={(event) => setAddress({ ...address, phone: event.target.value })} required className="h-12 w-full rounded-2xl border border-line bg-background px-4 outline-none focus:border-brand" /></label>
              <label className="sm:col-span-2"><span className="mb-2 block text-sm font-semibold">Address line</span><input value={address.line1} onChange={(event) => setAddress({ ...address, line1: event.target.value })} required className="h-12 w-full rounded-2xl border border-line bg-background px-4 outline-none focus:border-brand" /></label>
              <label><span className="mb-2 block text-sm font-semibold">City</span><input value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} required className="h-12 w-full rounded-2xl border border-line bg-background px-4 outline-none focus:border-brand" /></label>
              <label><span className="mb-2 block text-sm font-semibold">Pincode</span><input value={address.pincode} onChange={(event) => setAddress({ ...address, pincode: event.target.value })} required className="h-12 w-full rounded-2xl border border-line bg-background px-4 outline-none focus:border-brand" /></label>
            </form>
          )}

          <div className="rounded-[2rem] border border-line bg-card p-6">
            <h2 className="mb-4 text-xl font-bold">Payment</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <button onClick={() => setPayment("razorpay")} className={`rounded-3xl border p-5 text-left ${payment === "razorpay" ? "border-brand bg-brand/10" : "border-line bg-background"}`}>
                <CreditCard className="mb-3 text-brand" /><span className="block font-bold">Razorpay</span><span className="text-sm text-muted">UPI, cards, wallets</span>
              </button>
              <button onClick={() => setPayment("cod")} className={`rounded-3xl border p-5 text-left ${payment === "cod" ? "border-brand bg-brand/10" : "border-line bg-background"}`}>
                <Wallet className="mb-3 text-brand" /><span className="block font-bold">Cash on delivery</span><span className="text-sm text-muted">Pay when order arrives</span>
              </button>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-[2rem] border border-line bg-card p-6">
          <h2 className="text-xl font-bold">Order summary</h2>
          <div className="mt-5 space-y-3">
            {items.length ? items.map((item) => (
              <p key={item.cartId} className="flex justify-between gap-4 text-sm text-muted">
                <span>{item.quantity} x {item.name}</span><span>{formatMoney(item.lineTotal)}</span>
              </p>
            )) : <p className="text-sm text-muted">Your cart is empty. Add items before placing an order.</p>}
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-line pt-5 text-lg font-black"><span>Total</span><span>{formatMoney(total)}</span></div>
          {message && <p className="mt-4 rounded-2xl bg-red-500/10 p-3 text-sm font-semibold text-red-600">{message}</p>}
          <button disabled={!items.length || placing} onClick={placeOrder} className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-brand font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
            {placing ? "Processing..." : payment === "razorpay" ? "Pay with Razorpay" : "Place COD order"}
          </button>
          <Link href="/cart" className="mt-3 flex justify-center text-sm font-bold text-brand">Back to cart</Link>
          <p className="mt-5 flex gap-2 text-xs leading-5 text-muted"><MapPin size={15} /> Use Razorpay test keys in `.env.local` while testing payments.</p>
        </aside>
      </div>
    </Section>
  );
}
