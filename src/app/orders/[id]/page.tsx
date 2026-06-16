import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { CheckCircle2, Circle, Clock, PackageCheck, Truck } from "lucide-react";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { OrderLiveTracking } from "@/components/order-live-tracking";
import { Section } from "@/components/ui";
import { connectDB } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { Order } from "@/models/Order";

const steps = ["Pending", "Preparing", "Out for Delivery", "Delivered"] as const;

type OrderItem = {
  name?: string;
  quantity?: number;
  size?: string;
  level?: string;
  price?: number;
};

export const metadata = { title: "Track Order" };

export const dynamic = "force-dynamic";

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect(`/login?callbackUrl=/orders/${id}`);
  }

  await connectDB();
  const order = await Order.findById(id).lean();
  if (!order) notFound();

  const isAdmin = (session.user as { role?: string }).role === "admin";
  if (!isAdmin && order.address?.email !== session.user.email) {
    notFound();
  }

  const currentIndex = order.status === "Cancelled" ? -1 : Math.max(steps.findIndex((step) => step === order.status), 0);

  return (
    <Section eyebrow="Order tracking" title={`Order ${String(order._id).slice(-8).toUpperCase()}`}>
      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <div className="rounded-[2rem] border border-line bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">{order.status}</h2>
              <p className="mt-1 text-sm text-muted">
                {order.fulfillment === "pickup" ? "Pickup from cafe counter" : "Delivery to your address"}
              </p>
            </div>
            <span className="rounded-full bg-brand/10 px-4 py-2 text-sm font-bold text-brand">
              {order.paymentMethod} - {order.paymentStatus}
            </span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {steps.map((step, index) => {
              const done = currentIndex >= index;
              const Icon = step === "Pending" ? Clock : step === "Preparing" ? PackageCheck : step === "Out for Delivery" ? Truck : CheckCircle2;
              return (
                <div key={step} className={`rounded-3xl border p-4 ${done ? "border-brand bg-brand/10" : "border-line bg-background"}`}>
                  {done ? <Icon className="text-brand" /> : <Circle className="text-muted" />}
                  <p className="mt-3 text-sm font-bold">{step}</p>
                </div>
              );
            })}
          </div>

          {order.status === "Cancelled" && (
            <p className="mt-6 rounded-2xl bg-red-500/10 p-4 text-sm font-semibold text-red-600">This order was cancelled.</p>
          )}

          <OrderLiveTracking
            orderId={String(order._id)}
            initialTracking={{
              status: order.status,
              fulfillment: order.fulfillment,
              deliveryPartner: order.deliveryPartner
                ? {
                    ...order.deliveryPartner,
                    updatedAt: order.deliveryPartner.updatedAt ? String(order.deliveryPartner.updatedAt) : undefined,
                  }
                : null,
            }}
          />

          <div className="mt-8 space-y-3">
            <h3 className="font-bold">Items</h3>
            {(order.items as OrderItem[]).map((item, index) => (
              <div key={`${item.name}-${index}`} className="rounded-3xl bg-background p-4">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-bold">{item.quantity} x {item.name}</p>
                    <p className="mt-1 text-sm text-muted">{item.size ?? "Regular"} - {item.level ?? "Balanced"}</p>
                  </div>
                  <p className="font-bold">{formatMoney(Number(item.price ?? 0) * Number(item.quantity ?? 1))}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-[2rem] border border-line bg-card p-6">
          <h2 className="text-xl font-bold">Bill details</h2>
          <div className="mt-4 space-y-3 text-sm">
            <Row label="Subtotal" value={formatMoney(Number(order.subtotal ?? 0))} />
            <Row label="Tax" value={formatMoney(Number(order.tax ?? 0))} />
            <Row label="Delivery" value={formatMoney(Number(order.deliveryCharge ?? 0))} />
            <Row label="Discount" value={`- ${formatMoney(Number(order.discount ?? 0))}`} />
            <div className="border-t border-line pt-3">
              <Row label="Total" value={formatMoney(Number(order.total ?? 0))} strong />
            </div>
          </div>

          <h3 className="mt-6 font-bold">Customer</h3>
          <div className="mt-3 space-y-2 text-sm text-muted">
            <p>{order.address?.name ?? "Not provided"}</p>
            <p>{order.address?.email ?? "Not provided"}</p>
            <p>{order.address?.phone ?? "Not provided"}</p>
            {order.fulfillment === "delivery" && (
              <p>{[order.address?.line1, order.address?.city, order.address?.pincode].filter(Boolean).join(", ")}</p>
            )}
          </div>

          <Link href="/menu" className="mt-6 flex h-12 items-center justify-center rounded-full bg-brand font-bold text-white">
            Order more
          </Link>
        </aside>
      </div>
    </Section>
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
