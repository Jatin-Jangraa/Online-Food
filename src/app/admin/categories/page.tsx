import { AdminNav } from "@/components/admin-nav";
import { AdminCategoryManager } from "@/components/admin-category-manager";
import { Section } from "@/components/ui";
import { getLiveCategories } from "@/lib/live-data";

export const metadata = { title: "Category Management" };

export default async function AdminCategoriesPage() {
  const categories = await getLiveCategories();

  return (
    <Section eyebrow="Admin" title="Category management">
      <AdminNav />
      <AdminCategoryManager initialCategories={categories} />
    </Section>
  );
}
