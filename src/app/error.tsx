"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-serif text-4xl font-bold">Something went wrong</h1>
      <p className="mt-3 text-muted">Please refresh the page or try again in a moment.</p>
      <button onClick={reset} className="mt-6 rounded-full bg-brand px-6 py-3 font-bold text-white">Try again</button>
    </div>
  );
}
