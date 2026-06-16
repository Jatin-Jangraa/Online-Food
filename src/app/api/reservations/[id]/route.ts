import { NextResponse } from "next/server";
import { requireAdminResponse } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { Reservation } from "@/models/Reservation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const forbidden = await requireAdminResponse();
  if (forbidden) return forbidden;

  const { id } = await params;
  const body = await request.json();
  await connectDB();
  const reservation = await Reservation.findByIdAndUpdate(id, { $set: body }, { returnDocument: "after" });
  if (!reservation) {
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  }
  return NextResponse.json(reservation);
}
