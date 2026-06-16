import { NextResponse } from "next/server";
import { requireAdminResponse } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { couponSchema } from "@/lib/validation";
import { Coupon } from "@/models/Coupon";

export async function GET() {
  const forbidden = await requireAdminResponse();
  if (forbidden) return forbidden;

  await connectDB();
  return NextResponse.json(await Coupon.find().sort({ createdAt: -1 }).lean());
}

export async function POST(request: Request) {
  const forbidden = await requireAdminResponse();
  if (forbidden) return forbidden;

  const contentType = request.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json") ? await request.json() : Object.fromEntries(await request.formData());
  const parsed = couponSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  await connectDB();
  const coupon = await Coupon.create(parsed.data);
  return NextResponse.json(coupon, { status: 201 });
}
