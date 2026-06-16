import { AdminNav } from "@/components/admin-nav";
import { AdminOrderManager } from "@/components/admin-order-manager";
import { Section } from "@/components/ui";
import { getLiveOrders } from "@/lib/live-data";

export const metadata = { title: "Order Management" };

export default async function AdminOrdersPage() {
  const orders = await getLiveOrders();

  return (
    <Section eyebrow="Admin" title="Order management">
      <AdminNav />
      <AdminOrderManager initialOrders={orders} />
    </Section>
  );
}
