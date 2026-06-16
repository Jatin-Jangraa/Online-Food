import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/models/Coupon";

function fallbackCoupon(code: string, subtotal: number) {
  if (code === "CAFE20" && subtotal >= 799) {
    return { code, discountType: "percent", value: 20, discount: Math.round(subtotal * 0.2) };
  }
  if (code === "WELCOME100" && subtotal >= 499) {
    return { code, discountType: "flat", value: 100, discount: 100 };
  }
  return null;
}

export async function POST(request: Request) {
  const { code, subtotal } = await request.json();
  const normalizedCode = String(code ?? "").trim().toUpperCase();
  const orderSubtotal = Number(subtotal ?? 0);

  if (!normalizedCode) {
    return NextResponse.json({ error: "Enter a coupon code" }, { status: 400 });
  }

  try {
    await connectDB();
    const coupon = await Coupon.findOne({ code: normalizedCode, isActive: true }).lean();
    if (!coupon) {
      const fallback = fallbackCoupon(normalizedCode, orderSubtotal);
      if (fallback) return NextResponse.json(fallback);
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: "Coupon expired" }, { status: 400 });
    }

    if (orderSubtotal < Number(coupon.minOrderValue ?? 0)) {
      return NextResponse.json({ error: `Minimum order is Rs. ${coupon.minOrderValue}` }, { status: 400 });
    }

    const discount =
      coupon.discountType === "percent"
        ? Math.round(orderSubtotal * (Number(coupon.value) / 100))
        : Number(coupon.value);

    return NextResponse.json({
      code: coupon.code,
      discountType: coupon.discountType,
      value: coupon.value,
      discount: Math.min(discount, orderSubtotal),
    });
  } catch {
    const fallback = fallbackCoupon(normalizedCode, orderSubtotal);
    if (fallback) return NextResponse.json(fallback);
    return NextResponse.json({ error: "Coupon service is unavailable" }, { status: 503 });
  }
}
