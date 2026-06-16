import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { NewsletterSubscriber } from "@/models/NewsletterSubscriber";

const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors.email?.[0] ?? "Invalid email" }, { status: 400 });
  }

  await connectDB();
  await NewsletterSubscriber.findOneAndUpdate(
    { email: parsed.data.email.toLowerCase() },
    { $set: { isActive: true, source: "home" } },
    { upsert: true, new: true },
  );

  return NextResponse.json({ ok: true, message: "Subscribed" });
}
