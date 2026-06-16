import { AdminNav } from "@/components/admin-nav";
import { AdminCouponManager } from "@/components/admin-coupon-manager";
import { Section } from "@/components/ui";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/models/Coupon";

export const metadata = { title: "Coupon Management" };

async function getCoupons() {
  if (!process.env.MONGODB_URI) {
    return [
      { code: "CAFE20", discountType: "percent" as const, value: 20, minOrderValue: 799 },
      { code: "WELCOME100", discountType: "flat" as const, value: 100, minOrderValue: 499 },
    ];
  }
  try {
    await connectDB();
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return coupons.map((coupon) => ({
      code: String(coupon.code),
      discountType: coupon.discountType as "percent" | "flat",
      value: Number(coupon.value),
      minOrderValue: Number(coupon.minOrderValue ?? 0),
      expiresAt: coupon.expiresAt?.toISOString(),
    }));
  } catch {
    return [];
  }
}

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();

  return (
    <Section eyebrow="Admin" title="Coupon and offer management">
      <AdminNav />
      <AdminCouponManager initialCoupons={coupons} />
    </Section>
  );
}
