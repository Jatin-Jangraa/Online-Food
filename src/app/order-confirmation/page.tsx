import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Section } from "@/components/ui";

export const metadata = {
  title: "Order Confirmed",
};

export default async function OrderConfirmationPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  const orderLabel = order ? order.slice(-8).toUpperCase() : "Pending";

  return (
    <Section>
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-line bg-card p-8 text-center premium-shadow">
        <CheckCircle2 className="mx-auto size-16 text-brand" />
        <h1 className="mt-5 font-serif text-4xl font-black">Order confirmed</h1>
        <p className="mt-4 text-muted">Your order number is <strong className="text-foreground">{orderLabel}</strong>. You can track live status from your dashboard.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href={order ? `/orders/${order}` : "/dashboard"} className="rounded-full bg-brand px-6 py-3 font-bold text-white">Track order</Link>
          <Link href="/menu" className="rounded-full border border-line px-6 py-3 font-bold">Order more</Link>
        </div>
      </div>
    </Section>
  );
}
