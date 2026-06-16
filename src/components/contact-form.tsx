"use client";

import { useState } from "react";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setStatus("");
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSending(false);
    if (!response.ok) {
      setStatus("Could not send message. Check MongoDB connection.");
      return;
    }
    setStatus("Message sent.");
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-[2rem] border border-line bg-card p-6">
      <label><span className="mb-2 block text-sm font-semibold">Name</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required className="h-12 w-full rounded-2xl border border-line bg-background px-4 outline-none focus:border-brand" /></label>
      <label><span className="mb-2 block text-sm font-semibold">Email</span><input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" required className="h-12 w-full rounded-2xl border border-line bg-background px-4 outline-none focus:border-brand" /></label>
      <label><span className="mb-2 block text-sm font-semibold">Message</span><textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} required rows={6} className="w-full rounded-2xl border border-line bg-background p-4 outline-none focus:border-brand" /></label>
      {status && <p className="rounded-2xl bg-background p-3 text-sm font-semibold text-muted">{status}</p>}
      <button disabled={sending} className="h-12 rounded-full bg-brand font-bold text-white disabled:opacity-60">{sending ? "Sending..." : "Send message"}</button>
    </form>
  );
}
