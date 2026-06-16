import { NextResponse } from "next/server";
import { requireAdminResponse } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { reservationSchema } from "@/lib/validation";
import { Reservation } from "@/models/Reservation";

export async function GET() {
  const forbidden = await requireAdminResponse();
  if (forbidden) return forbidden;

  await connectDB();
  return NextResponse.json(await Reservation.find().sort({ createdAt: -1 }).lean());
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const body = contentType.includes("form") ? Object.fromEntries(await request.formData()) : await request.json();
  const parsed = reservationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  await connectDB();
  const reservation = await Reservation.create(parsed.data);
  return NextResponse.json(reservation, { status: 201 });
}
