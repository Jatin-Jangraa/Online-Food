"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function RegisterForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const googleAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (response.ok) {
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        callbackUrl: "/dashboard",
      });
      return;
    }

    const data = await response.json().catch(() => ({}));
    const fieldErrors = data.fieldErrors as Record<string, string[] | undefined> | undefined;
    const fieldMessage = fieldErrors
      ? fieldErrors.name?.[0] ?? fieldErrors.email?.[0] ?? fieldErrors.password?.[0]
      : undefined;
    setMessage(typeof data.error === "string" ? data.error : fieldMessage ?? "Please check the form and try again.");
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md rounded-[2rem] border border-line bg-card p-7 premium-shadow">
      <h1 className="text-center font-serif text-3xl font-bold">Create account</h1>
      {(["name", "email", "password"] as const).map((field) => (
        <label key={field} className="mt-4 block">
          <span className="mb-2 block text-sm font-semibold capitalize">{field}</span>
          <input
            value={form[field]}
            onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
            type={field === "password" ? "password" : field === "email" ? "email" : "text"}
            className="h-12 w-full rounded-2xl border border-line bg-background px-4 outline-none"
          />
        </label>
      ))}
      {message && <p className="mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-600">{message}</p>}
      <button disabled={loading} className="mt-6 h-12 w-full rounded-full bg-brand font-bold text-white disabled:opacity-60">
        {loading ? "Creating..." : "Register"}
      </button>
      {googleAuthEnabled && (
        <button type="button" onClick={() => signIn("google", { callbackUrl: "/dashboard", redirect: true })} className="mt-3 h-12 w-full rounded-full border border-line bg-background font-bold">
          Register with Google
        </button>
      )}
      <p className="mt-4 text-center text-sm text-muted">
        Already registered? <Link href="/login" className="font-bold text-brand">Login</Link>
      </p>
    </form>
  );
}
