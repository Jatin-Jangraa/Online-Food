import Image from "next/image";
import { Clock, MapPin, Star, Truck } from "lucide-react";
import { FoodCard } from "@/components/food-card";
import { NewsletterForm } from "@/components/newsletter-form";
import { ButtonLink, Section } from "@/components/ui";
import { getLiveCategories, getLiveFoodItems, getLiveOffers, getLiveReviews } from "@/lib/live-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, featured, offers, reviews] = await Promise.all([
    getLiveCategories(),
    getLiveFoodItems({ featuredOnly: true, limit: 8 }),
    getLiveOffers(),
    getLiveReviews(),
  ]);
  const heroOffer = offers.find((offer) => offer.placement === "home-hero");
  const bannerOffers = offers.filter((offer) => offer.placement === "home-banner").slice(0, 3);

  return (
    <>
      <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
        <Image
          src={heroOffer?.image ?? "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1800&q=85"}
          alt="Warm premium cafe interior"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
        <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center px-4 pb-16 pt-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-white">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-brand-2">Order, pickup, reserve</p>
            <h1 className="font-serif text-5xl font-black leading-tight sm:text-7xl">{heroOffer?.title ?? "Brew & Bite Cafe"}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82">
              {heroOffer?.subtitle ?? "Specialty coffee, fresh cafe plates, desserts, delivery, table reservations, and smooth online checkout."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={heroOffer?.ctaHref ?? "/menu"}>{heroOffer?.ctaLabel ?? "Order now"}</ButtonLink>
              <ButtonLink href="/reservations" variant="secondary">Reserve table</ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <Section eyebrow="Featured" title="Cafe favorites, ready to customize">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featured.map((item) => <FoodCard key={item.id} item={item} />)}
        </div>
      </Section>

      <Section eyebrow="Categories" title="Browse by craving" className="pt-4">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <a key={category.id} href={`/menu?category=${category.id}`} className="group overflow-hidden rounded-[2rem] border border-line bg-card">
              <div className="relative h-44 overflow-hidden">
                <Image src={category.image} alt={category.name} fill sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold">{category.name}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{category.description}</p>
              </div>
            </a>
          ))}
        </div>
      </Section>

      <section className="bg-foreground text-background">
        <Section eyebrow="Offers" title={bannerOffers[0]?.title ?? "20% off on orders above Rs. 799"}>
          <div className="grid gap-5 md:grid-cols-3">
            {(bannerOffers.length ? bannerOffers : [
              { id: "cafe20", title: "CAFE20", subtitle: "Use this coupon for dine-at-home brunch boxes.", code: "CAFE20" },
              { id: "delivery", title: "Free delivery", subtitle: "No delivery charge above Rs. 999." },
              { id: "happy", title: "Happy hours", subtitle: "4 PM to 7 PM coffee and dessert combos." },
            ]).map((offer) => (
              <div key={offer.id} className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
                <h3 className="text-2xl font-bold">{offer.title}</h3>
                <p className="mt-3 text-background/75">{offer.subtitle}</p>
                {offer.code && <p className="mt-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-black">{offer.code}</p>}
              </div>
            ))}
          </div>
        </Section>
      </section>

      <Section eyebrow="Guest notes" title="Loved by regulars">
        <div className="grid gap-5 md:grid-cols-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-[2rem] border border-line bg-card p-6">
              <p className="flex gap-1 text-brand-2">
                {Array.from({ length: Math.round(review.rating) }).map((_, index) => <Star key={index} size={16} className="fill-current" />)}
              </p>
              <p className="mt-5 leading-7 text-muted">{review.comment}</p>
              <h3 className="mt-5 font-bold">{review.userName}</h3>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Visit us" title="Opening hours and contact">
        <div className="grid min-w-0 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="min-w-0 rounded-[2rem] border border-line bg-card p-6">
            <div className="grid gap-4">
              <p className="flex min-w-0 items-start gap-3"><Clock className="shrink-0 text-brand" /> <span>Mon-Fri: 8 AM - 11 PM</span></p>
              <p className="flex min-w-0 items-start gap-3"><Clock className="shrink-0 text-brand" /> <span>Sat-Sun: 7 AM - 12 AM</span></p>
              <p className="flex min-w-0 items-start gap-3"><Truck className="shrink-0 text-brand" /> <span>Delivery within 35 minutes nearby</span></p>
              <p className="flex min-w-0 items-start gap-3"><MapPin className="shrink-0 text-brand" /> <span>24 Park Street, Fatehabad</span></p>
            </div>
            <NewsletterForm />
          </div>
          <iframe
            title="Brew & Bite Cafe map"
            className="min-h-80 min-w-0 max-w-full rounded-[2rem] border border-line"
            loading="lazy"
            src="https://www.google.com/maps?q=Park%20Street%20Kolkata&output=embed"
          />
        </div>
      </Section>
    </>
  );
}
