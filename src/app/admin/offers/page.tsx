import { AdminNav } from "@/components/admin-nav";
import { AdminOfferManager } from "@/components/admin-offer-manager";
import { Section } from "@/components/ui";
import { getLiveOffers } from "@/lib/live-data";

export const metadata = { title: "Offer Management" };

export default async function AdminOffersPage() {
  const offers = await getLiveOffers();

  return (
    <Section eyebrow="Admin" title="Offer banners and ad placements">
      <AdminNav />
      <AdminOfferManager initialOffers={offers} />
    </Section>
  );
}
