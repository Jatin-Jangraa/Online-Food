import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { contactSchema } from "@/lib/validation";
import { ContactMessage } from "@/models/ContactMessage";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json") ? await request.json() : Object.fromEntries(await request.formData());
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  await connectDB();
  const message = await ContactMessage.create(parsed.data);
  return NextResponse.json({ ok: true, message }, { status: 201 });
}
