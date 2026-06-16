"use client";

import { useState } from "react";

export function ReservationForm() {
  const [form, setForm] = useState({ name: "", phone: "", date: "", time: "", guests: "2", occasion: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!response.ok) {
      setMessage("Could not reserve table. Check the form or MongoDB connection.");
      return;
    }
    setMessage("Reservation request saved.");
    setForm({ name: "", phone: "", date: "", time: "", guests: "2", occasion: "" });
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-[2rem] border border-line bg-card p-6 sm:grid-cols-2">
      <label>
        <span className="mb-2 block text-sm font-semibold">Name</span>
        <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required className="h-12 w-full rounded-2xl border border-line bg-background px-4 outline-none focus:border-brand" />
      </label>
      <label>
        <span className="mb-2 block text-sm font-semibold">Phone</span>
        <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required className="h-12 w-full rounded-2xl border border-line bg-background px-4 outline-none focus:border-brand" />
      </label>
      <label>
        <span className="mb-2 block text-sm font-semibold">Date</span>
        <input value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} type="date" required className="h-12 w-full rounded-2xl border border-line bg-background px-4 outline-none focus:border-brand" />
      </label>
      <label>
        <span className="mb-2 block text-sm font-semibold">Time</span>
        <input value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} type="time" required className="h-12 w-full rounded-2xl border border-line bg-background px-4 outline-none focus:border-brand" />
      </label>
      <label>
        <span className="mb-2 block text-sm font-semibold">Guests</span>
        <input value={form.guests} onChange={(event) => setForm({ ...form, guests: event.target.value })} type="number" min="1" max="12" className="h-12 w-full rounded-2xl border border-line bg-background px-4 outline-none focus:border-brand" />
      </label>
      <label>
        <span className="mb-2 block text-sm font-semibold">Occasion</span>
        <input value={form.occasion} onChange={(event) => setForm({ ...form, occasion: event.target.value })} className="h-12 w-full rounded-2xl border border-line bg-background px-4 outline-none focus:border-brand" />
      </label>
      {message && <p className="rounded-2xl bg-background p-3 text-sm font-semibold text-muted sm:col-span-2">{message}</p>}
      <button disabled={loading} className="h-12 rounded-full bg-brand font-bold text-white disabled:opacity-60 sm:col-span-2">{loading ? "Saving..." : "Reserve table"}</button>
    </form>
  );
}
