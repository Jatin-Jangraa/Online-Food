import { NextResponse } from "next/server";
import { requireAdminResponse } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";

export async function GET() {
  await connectDB();
  return NextResponse.json(await Category.find().sort({ name: 1 }).lean());
}

export async function POST(request: Request) {
  try {
    const forbidden = await requireAdminResponse();
    if (forbidden) return forbidden;

    const body = await request.json();
    await connectDB();
    const category = await Category.create({
      ...body,
      slug: String(body.slug ?? body.name).toLowerCase().trim().replace(/\s+/g, "-"),
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
