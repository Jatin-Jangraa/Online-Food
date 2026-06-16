import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { RotateCcw, UserRound } from "lucide-react";
import { ButtonLink, EmptyState, Section } from "@/components/ui";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getLiveOrders } from "@/lib/live-data";
import { formatMoney } from "@/lib/money";

export const metadata = {
  title: "User Dashboard",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const orders = await getLiveOrders(session.user.email);
  const user = session?.user;

  return (
    <Section eyebrow="My account" title="Profile, addresses, and order history">
      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <aside className="h-fit rounded-[2rem] border border-line bg-card p-6">
          <UserRound className="size-12 rounded-2xl bg-brand/10 p-3 text-brand" />
          <h2 className="mt-4 text-xl font-bold">{user?.name ?? "Cafe Guest"}</h2>
          <p className="text-sm text-muted">{user?.email ?? "Login to sync your account"}</p>
          <div className="mt-6 rounded-3xl bg-background p-4 text-sm">
            <p className="font-bold">Saved address</p>
            <p className="mt-2 text-muted">Your checkout address appears inside each order below.</p>
          </div>
        </aside>
        <div className="space-y-5">
          {orders.length ? orders.map((order) => (
            <article key={order.id} className="rounded-[2rem] border border-line bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">{order.id}</h3>
                  <p className="text-sm text-muted">{order.date} - {order.fulfillment ?? "delivery"} - {order.paymentMethod ?? "cod"}</p>
                </div>
                <span className="rounded-full bg-brand/10 px-4 py-2 text-sm font-bold text-brand">{order.status}</span>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={`${order.id}-${item.name}-${index}`} className="rounded-3xl bg-background p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-bold">{item.quantity} x {item.name}</p>
                          <p className="mt-1 text-sm text-muted">{item.size ?? "Regular"} - {item.level ?? "Balanced"}</p>
                          <p className="mt-1 text-sm text-muted">{item.toppings?.length ? item.toppings.join(", ") : "No extra toppings"}</p>
                        </div>
                        <p className="font-bold">{formatMoney(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-3xl bg-background p-4 text-sm">
                  <h4 className="font-bold">Delivery and payment</h4>
                  <div className="mt-3 space-y-2 text-muted">
                    <p><span className="font-semibold text-foreground">Name:</span> {order.address?.name ?? user?.name ?? "Not provided"}</p>
                    <p><span className="font-semibold text-foreground">Email:</span> {order.address?.email ?? user?.email ?? "Not provided"}</p>
                    <p><span className="font-semibold text-foreground">Phone:</span> {order.address?.phone ?? "Not provided"}</p>
                    {order.fulfillment === "delivery" && (
                      <p>
                        <span className="font-semibold text-foreground">Address:</span>{" "}
                        {[order.address?.line1, order.address?.city, order.address?.pincode].filter(Boolean).join(", ") || "Not provided"}
                      </p>
                    )}
                    <p><span className="font-semibold text-foreground">Payment:</span> {order.paymentMethod ?? "cod"} ({order.paymentStatus ?? "Pending"})</p>
                    {order.razorpayPaymentId && <p className="break-all"><span className="font-semibold text-foreground">Payment ID:</span> {order.razorpayPaymentId}</p>}
                  </div>
                  <div className="mt-4 space-y-2 border-t border-line pt-4">
                    <Row label="Subtotal" value={formatMoney(order.subtotal ?? 0)} />
                    <Row label="Tax" value={formatMoney(order.tax ?? 0)} />
                    <Row label="Delivery" value={formatMoney(order.deliveryCharge ?? 0)} />
                    <Row label="Discount" value={`- ${formatMoney(order.discount ?? 0)}`} />
                    <Row label="Total" value={formatMoney(order.total)} strong />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
                <p className="font-bold">{formatMoney(order.total)}</p>
                <div className="flex flex-wrap gap-3">
                  <ButtonLink href={`/orders/${order.id}`}>Track order</ButtonLink>
                  <ButtonLink href="/menu" variant="secondary"><RotateCcw size={16} /> Reorder</ButtonLink>
                </div>
              </div>
            </article>
          )) : (
            <EmptyState title="No orders yet" text="Your real order history will show here after checkout." />
          )}
        </div>
      </div>
    </Section>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <p className={`flex justify-between gap-4 ${strong ? "font-black text-foreground" : "text-muted"}`}>
      <span>{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </p>
  );
}
