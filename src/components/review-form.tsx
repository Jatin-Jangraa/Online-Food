"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

export function ReviewForm({ foodId }: { foodId: string }) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foodId, rating, comment }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (response.ok) {
      setMessage("Rating saved. Refresh to see the new average.");
      setComment("");
      return;
    }
    setMessage(typeof data.error === "string" ? data.error : "Could not save rating.");
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-left text-sm font-bold text-brand">
        Rate this item
      </button>
    );
  }

  if (status !== "loading" && !session?.user) {
    return (
      <div className="rounded-3xl bg-background p-4 text-sm">
        <p className="font-semibold text-muted">Login to give a real star rating.</p>
        <Link href="/login" className="mt-3 inline-flex rounded-full bg-brand px-4 py-2 text-xs font-bold text-white">
          Login to rate
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-3xl bg-background p-4">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <button key={index} type="button" onClick={() => setRating(index + 1)} aria-label={`${index + 1} star`}>
            <Star size={20} className={index < rating ? "fill-brand-2 text-brand-2" : "text-muted"} />
          </button>
        ))}
      </div>
      <p className="text-xs font-semibold text-muted">Rating as {session?.user?.name ?? session?.user?.email}</p>
      <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Your review" rows={3} className="rounded-2xl border border-line bg-card p-3 text-sm outline-none" />
      {message && <p className="text-xs font-semibold text-muted">{message}</p>}
      <div className="flex gap-2">
        <button disabled={saving} className="rounded-full bg-brand px-4 py-2 text-xs font-bold text-white disabled:opacity-60">
          {saving ? "Saving..." : "Submit rating"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-line px-4 py-2 text-xs font-bold">Cancel</button>
      </div>
    </form>
  );
}
