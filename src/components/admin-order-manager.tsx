"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/money";
import { DeliveryPartnerLocation, LiveOrder, OrderStatus } from "@/types";

const statuses: OrderStatus[] = ["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

export function AdminOrderManager({ initialOrders }: { initialOrders: LiveOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [message, setMessage] = useState("");
  const [trackingForms, setTrackingForms] = useState<Record<string, DeliveryPartnerLocation>>(() =>
    Object.fromEntries(initialOrders.map((order) => [order.id, order.deliveryPartner ?? {}])),
  );

  async function updateStatus(id: string, status: OrderStatus) {
    setMessage("");
    const response = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      setMessage("Could not update order status.");
      return;
    }
    setOrders((current) => current.map((order) => (order.id === id ? { ...order, status } : order)));
    setMessage("Order status updated.");
  }

  function updateTrackingForm(id: string, field: keyof DeliveryPartnerLocation, value: string) {
    setTrackingForms((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: field === "latitude" || field === "longitude" || field === "etaMinutes" ? (value === "" ? undefined : Number(value)) : value,
      },
    }));
  }

  function fillCurrentLocation(id: string) {
    if (!navigator.geolocation) {
      setMessage("Location is not available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setTrackingForms((current) => ({
          ...current,
          [id]: {
            ...current[id],
            latitude: Number(position.coords.latitude.toFixed(6)),
            longitude: Number(position.coords.longitude.toFixed(6)),
          },
        }));
        setMessage("Current location filled. Save tracking to publish it.");
      },
      () => setMessage("Could not read current location. Allow location permission and try again."),
    );
  }

  async function saveTracking(id: string) {
    setMessage("");
    const form = trackingForms[id] ?? {};
    const hasTrackingDetails = form.name || form.phone || form.vehicle || form.latitude || form.longitude || form.etaMinutes;
    if (!hasTrackingDetails) {
      setMessage("Enter partner details or location before saving tracking.");
      return;
    }

    const response = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: form.latitude && form.longitude ? "Out for Delivery" : undefined,
        deliveryPartner: form,
      }),
    });

    if (!response.ok) {
      setMessage("Could not update delivery tracking.");
      return;
    }

    const saved = await response.json();
    const savedTracking = {
      name: saved.deliveryPartner?.name,
      phone: saved.deliveryPartner?.phone,
      vehicle: saved.deliveryPartner?.vehicle,
      latitude: saved.deliveryPartner?.latitude,
      longitude: saved.deliveryPartner?.longitude,
      etaMinutes: saved.deliveryPartner?.etaMinutes,
      updatedAt: saved.deliveryPartner?.updatedAt ? new Date(saved.deliveryPartner.updatedAt).toLocaleString("en-IN") : undefined,
    };
    setTrackingForms((current) => ({ ...current, [id]: savedTracking }));
    setOrders((current) =>
      current.map((order) =>
        order.id === id
          ? {
              ...order,
              status: saved.status,
              deliveryPartner: savedTracking,
            }
          : order,
      ),
    );
    setMessage("Delivery tracking updated.");
  }

  return (
    <div className="mt-8 grid gap-5">
      {message && <p className="rounded-2xl bg-card p-4 text-sm font-semibold text-muted">{message}</p>}
      {orders.map((order) => (
        <article key={order.id} className="rounded-[2rem] border border-line bg-card p-6">
          {(() => {
            const tracking = trackingForms[order.id] ?? {};
            return (
          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.9fr_0.7fr]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-bold">{order.id}</h2>
                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">{order.status}</span>
                <span className="rounded-full bg-background px-3 py-1 text-xs font-bold text-muted">{order.date}</span>
              </div>

              <div className="mt-5 space-y-3">
                {order.items.map((item, index) => (
                  <div key={`${order.id}-${item.name}-${index}`} className="rounded-3xl bg-background p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold">{item.quantity} x {item.name}</p>
                        <p className="mt-1 text-sm text-muted">
                          {item.size ?? "Regular"} - {item.level ?? "Balanced"}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {item.toppings?.length ? item.toppings.join(", ") : "No extra toppings"}
                        </p>
                      </div>
                      <p className="font-bold">{formatMoney(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-background p-5">
              <h3 className="font-bold">Customer and address</h3>
              <div className="mt-4 space-y-2 text-sm text-muted">
                <p><span className="font-semibold text-foreground">Name:</span> {order.address?.name ?? "Not provided"}</p>
                <p><span className="font-semibold text-foreground">Email:</span> {order.address?.email ?? "Not provided"}</p>
                <p><span className="font-semibold text-foreground">Phone:</span> {order.address?.phone ?? "Not provided"}</p>
                <p><span className="font-semibold text-foreground">Fulfilment:</span> {order.fulfillment ?? "delivery"}</p>
                {order.fulfillment === "delivery" ? (
                  <p>
                    <span className="font-semibold text-foreground">Address:</span>{" "}
                    {[order.address?.line1, order.address?.city, order.address?.pincode].filter(Boolean).join(", ") || "Not provided"}
                  </p>
                ) : (
                  <p><span className="font-semibold text-foreground">Pickup:</span> Customer will collect from cafe.</p>
                )}
              </div>

              <h3 className="mt-6 font-bold">Payment</h3>
              <div className="mt-4 space-y-2 text-sm text-muted">
                <p><span className="font-semibold text-foreground">Method:</span> {order.paymentMethod ?? "cod"}</p>
                <p><span className="font-semibold text-foreground">Status:</span> {order.paymentStatus ?? "Pending"}</p>
                {order.couponCode && <p><span className="font-semibold text-foreground">Coupon:</span> {order.couponCode}</p>}
                {order.razorpayPaymentId && <p className="break-all"><span className="font-semibold text-foreground">Payment ID:</span> {order.razorpayPaymentId}</p>}
                {order.razorpayOrderId && <p className="break-all"><span className="font-semibold text-foreground">Razorpay order:</span> {order.razorpayOrderId}</p>}
              </div>
            </div>

            <div className="rounded-3xl bg-background p-5">
              <h3 className="font-bold">Bill details</h3>
              <div className="mt-4 space-y-3 text-sm">
                <Row label="Subtotal" value={formatMoney(order.subtotal ?? 0)} />
                <Row label="Tax" value={formatMoney(order.tax ?? 0)} />
                <Row label="Delivery" value={formatMoney(order.deliveryCharge ?? 0)} />
                <Row label="Discount" value={`- ${formatMoney(order.discount ?? 0)}`} />
                <div className="border-t border-line pt-3">
                  <Row label="Total" value={formatMoney(order.total)} strong />
                </div>
              </div>
              <label className="mt-6 block">
                <span className="mb-2 block text-sm font-semibold">Update status</span>
                <select value={order.status} onChange={(event) => updateStatus(order.id, event.target.value as OrderStatus)} className="h-11 w-full rounded-full border border-line bg-card px-4 text-sm font-bold">
                  {statuses.map((status) => <option key={status}>{status}</option>)}
                </select>
              </label>
              {order.fulfillment === "delivery" && (
                <div className="mt-6 rounded-3xl border border-line bg-card p-4">
                  <h3 className="font-bold">Live delivery location</h3>
                  <div className="mt-4 grid gap-3">
                    <input value={tracking.name ?? ""} onChange={(event) => updateTrackingForm(order.id, "name", event.target.value)} placeholder="Partner name" className="h-11 rounded-2xl border border-line bg-background px-4 text-sm outline-none" />
                    <input value={tracking.phone ?? ""} onChange={(event) => updateTrackingForm(order.id, "phone", event.target.value)} placeholder="Partner phone" className="h-11 rounded-2xl border border-line bg-background px-4 text-sm outline-none" />
                    <input value={tracking.vehicle ?? ""} onChange={(event) => updateTrackingForm(order.id, "vehicle", event.target.value)} placeholder="Vehicle, e.g. Bike WB 01 AB 1234" className="h-11 rounded-2xl border border-line bg-background px-4 text-sm outline-none" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input value={tracking.latitude ?? ""} onChange={(event) => updateTrackingForm(order.id, "latitude", event.target.value)} placeholder="Latitude" type="number" step="any" className="h-11 rounded-2xl border border-line bg-background px-4 text-sm outline-none" />
                      <input value={tracking.longitude ?? ""} onChange={(event) => updateTrackingForm(order.id, "longitude", event.target.value)} placeholder="Longitude" type="number" step="any" className="h-11 rounded-2xl border border-line bg-background px-4 text-sm outline-none" />
                    </div>
                    <input value={tracking.etaMinutes ?? ""} onChange={(event) => updateTrackingForm(order.id, "etaMinutes", event.target.value)} placeholder="ETA minutes" type="number" className="h-11 rounded-2xl border border-line bg-background px-4 text-sm outline-none" />
                    {(tracking.name || tracking.phone || tracking.vehicle || tracking.latitude || tracking.longitude || tracking.etaMinutes) && (
                      <div className="rounded-2xl bg-background p-3 text-xs font-semibold text-muted">
                        <p className="text-foreground">Saved tracking preview</p>
                        {tracking.name && <p>{tracking.name}</p>}
                        {tracking.phone && <p>{tracking.phone}</p>}
                        {tracking.vehicle && <p>{tracking.vehicle}</p>}
                        {tracking.latitude && tracking.longitude && <p>{tracking.latitude}, {tracking.longitude}</p>}
                        {tracking.etaMinutes !== undefined && <p>ETA: {tracking.etaMinutes} min</p>}
                        {tracking.updatedAt && <p>Last update: {tracking.updatedAt}</p>}
                      </div>
                    )}
                    <div className="grid gap-2 sm:grid-cols-2">
                      <button type="button" onClick={() => fillCurrentLocation(order.id)} className="h-11 rounded-full border border-line text-sm font-bold">Use my location</button>
                      <button type="button" onClick={() => saveTracking(order.id)} className="h-11 rounded-full bg-brand text-sm font-bold text-white">Save tracking</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
            );
          })()}
        </article>
      ))}
      {!orders.length && <p className="rounded-[2rem] border border-line bg-card p-8 text-center text-muted">No orders yet.</p>}
    </div>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <p className={`flex justify-between gap-4 ${strong ? "text-base font-black text-foreground" : "text-muted"}`}>
      <span>{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </p>
  );
}
