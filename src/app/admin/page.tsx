import { Coffee, DollarSign, ShoppingBag, Users } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { Section } from "@/components/ui";
import { getAdminStats } from "@/lib/live-data";
import { formatMoney } from "@/lib/money";

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminPage() {
  const stats = await getAdminStats();
  const cards = [
    ["Total orders", stats.totalOrders.toString(), ShoppingBag],
    ["Sales", formatMoney(stats.sales), DollarSign],
    ["Customers", stats.customers.toString(), Users],
    ["Popular items", stats.popularItems.toString(), Coffee],
  ];
  const maxMonthlySale = Math.max(...stats.monthlySales.map((item) => item.total), 1);

  return (
    <Section eyebrow="Admin" title="Cafe operations dashboard">
      <AdminNav />
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon]) => (
          <div key={label as string} className="rounded-[2rem] border border-line bg-card p-6">
            <Icon className="size-11 rounded-2xl bg-brand/10 p-3 text-brand" />
            <p className="mt-5 text-sm font-semibold text-muted">{label as string}</p>
            <h2 className="mt-1 text-3xl font-black">{value as string}</h2>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-[2rem] border border-line bg-card p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Monthly sales</h2>
            <p className="mt-1 text-sm text-muted">Last 6 months order revenue</p>
          </div>
          <p className="rounded-full bg-background px-4 py-2 text-sm font-bold text-muted">
            {formatMoney(stats.monthlySales.reduce((sum, item) => sum + item.total, 0))}
          </p>
        </div>
        <div className="mt-6 grid h-72 grid-cols-6 items-end gap-3 border-b border-line pb-3">
          {stats.monthlySales.map((item) => (
            <div key={item.label} className="flex h-full min-w-0 flex-col justify-end gap-2">
              <div className="text-center text-xs font-bold text-muted">{formatMoney(item.total)}</div>
              <div
                className="min-h-2 rounded-t-2xl bg-brand"
                style={{ height: `${Math.max((item.total / maxMonthlySale) * 100, item.total ? 8 : 2)}%` }}
                title={`${item.label}: ${formatMoney(item.total)} from ${item.orders} orders`}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-6 gap-3 text-center text-xs font-bold text-muted">
          {stats.monthlySales.map((item) => (
            <div key={item.label}>
              <p>{item.label}</p>
              <p className="mt-1 font-semibold">{item.orders} orders</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 rounded-[2rem] border border-line bg-card p-6">
        <h2 className="text-xl font-bold">Recent orders</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-muted"><tr><th className="py-3">Order</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="border-t border-line">
                  <td className="py-4 font-bold">{order.id}</td>
                  <td>{order.items.map((item) => item.name).join(", ")}</td>
                  <td>{formatMoney(order.total)}</td>
                  <td><span className="rounded-full bg-brand/10 px-3 py-1 font-bold text-brand">{order.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!stats.recentOrders.length && <p className="py-8 text-center text-muted">No real orders yet.</p>}
        </div>
      </div>
    </Section>
  );
}
