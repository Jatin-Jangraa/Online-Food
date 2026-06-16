import { AdminNav } from "@/components/admin-nav";
import { AdminFoodManager } from "@/components/admin-food-manager";
import { Section } from "@/components/ui";
import { getLiveFoodItems } from "@/lib/live-data";

export const metadata = { title: "Food Management" };

export const dynamic = "force-dynamic";

export default async function AdminFoodsPage() {
  const items = await getLiveFoodItems();

  return (
    <Section eyebrow="Admin" title="Food management">
      <AdminNav />
      <AdminFoodManager initialItems={items} />
    </Section>
  );
}
