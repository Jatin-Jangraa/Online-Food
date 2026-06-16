import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminResponse } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { ContactMessage } from "@/models/ContactMessage";

const statusSchema = z.object({
  status: z.enum(["New", "Read", "Archived"]),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const forbidden = await requireAdminResponse();
  if (forbidden) return forbidden;

  const { id } = await params;
  const parsed = statusSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message status" }, { status: 400 });
  }

  await connectDB();
  const message = await ContactMessage.findByIdAndUpdate(id, { $set: parsed.data }, { returnDocument: "after" });
  if (!message) {
    return NextResponse.json({ error: "Contact message not found" }, { status: 404 });
  }

  return NextResponse.json(message);
}
