import { Suspense } from "react";
import { MenuClient } from "@/components/menu-client";
import { getLiveCategories, getLiveFoodItems, getLiveOffers } from "@/lib/live-data";

export const metadata = {
  title: "Menu",
  description: "Browse cafe food, coffee, desserts, filters, ratings, prices, and customization options.",
};

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const [categories, items, offers] = await Promise.all([getLiveCategories(), getLiveFoodItems(), getLiveOffers()]);

  return (
    <Suspense>
      <MenuClient categories={categories} items={items} offer={offers.find((item) => item.placement === "menu-banner")} />
    </Suspense>
  );
}
