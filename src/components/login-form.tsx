"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const googleAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });
    setLoading(false);
    if (result?.ok) {
      window.location.href = "/dashboard";
    } else {
      setMessage("Invalid email or password.");
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md rounded-[2rem] border border-line bg-card p-7 premium-shadow">
      <h1 className="text-center font-serif text-3xl font-bold">Welcome back</h1>
      {googleAuthEnabled && (
        <>
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/dashboard", redirect: true })}
            className="mt-6 h-12 w-full rounded-full border border-line bg-background font-bold"
          >
            Continue with Google
          </button>
          <p className="mt-2 text-center text-xs font-semibold text-muted">Continues in this tab through Google OAuth.</p>
          <div className="my-6 h-px bg-line" />
        </>
      )}
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Email</span>
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="h-12 w-full rounded-2xl border border-line bg-background px-4 outline-none" />
      </label>
      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-semibold">Password</span>
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="h-12 w-full rounded-2xl border border-line bg-background px-4 outline-none" />
      </label>
      {message && <p className="mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-600">{message}</p>}
      <button disabled={loading} className="mt-6 h-12 w-full rounded-full bg-brand font-bold text-white disabled:opacity-60">
        {loading ? "Signing in..." : "Login"}
      </button>
      <p className="mt-4 text-center text-sm text-muted">
        New here? <Link href="/register" className="font-bold text-brand">Create an account</Link>
      </p>
    </form>
  );
}
