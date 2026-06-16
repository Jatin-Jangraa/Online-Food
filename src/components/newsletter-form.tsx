"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setMessage(typeof data.error === "string" ? data.error : "Could not subscribe.");
      return;
    }
    setMessage("Subscribed.");
    setEmail("");
  }

  return (
    <form onSubmit={submit} className="mt-8 flex flex-col gap-3 rounded-[1.5rem] border border-line bg-background p-2 sm:flex-row sm:rounded-full">
      <input value={email} onChange={(event) => setEmail(event.target.value)} aria-label="Email" placeholder="Email for newsletter" className="h-12 min-w-0 flex-1 bg-transparent px-4 outline-none" />
      <button disabled={loading} className="rounded-full bg-brand px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{loading ? "..." : "Subscribe"}</button>
      {message && <p className="px-4 py-3 text-sm font-semibold text-muted sm:absolute sm:mt-14">{message}</p>}
    </form>
  );
}
