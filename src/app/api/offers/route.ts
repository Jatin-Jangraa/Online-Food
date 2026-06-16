import { NextResponse } from "next/server";
import { requireAdminResponse } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { offerSchema } from "@/lib/validation";
import { Offer } from "@/models/Offer";

export async function GET() {
  const forbidden = await requireAdminResponse();
  if (forbidden) return forbidden;

  await connectDB();
  const offers = await Offer.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(offers);
}

export async function POST(request: Request) {
  const forbidden = await requireAdminResponse();
  if (forbidden) return forbidden;

  const contentType = request.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json") ? await request.json() : Object.fromEntries(await request.formData());
  const parsed = offerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectDB();
  const offer = await Offer.create({
    ...parsed.data,
    foodItem: parsed.data.foodId || undefined,
    isActive: parsed.data.isActive ?? true,
  });
  return NextResponse.json(offer, { status: 201 });
}
