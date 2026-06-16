import { NextResponse } from "next/server";
import { requireAdminResponse } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";

function normalizeSlug(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, "-");
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const forbidden = await requireAdminResponse();
    if (forbidden) return forbidden;

    const { id } = await params;
    const body = await request.json();
    await connectDB();
    const slug = normalizeSlug(String(body.slug ?? body.name ?? id));
    const query = id.match(/^[a-f\d]{24}$/i) ? { _id: id } : { slug: id };
    const category = await Category.findOneAndUpdate(
      query,
      {
        $set: {
          name: body.name,
          slug,
          description: body.description,
          image: body.image,
          isActive: body.isActive ?? true,
        },
      },
      { returnDocument: "after" },
    );
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const forbidden = await requireAdminResponse();
  if (forbidden) return forbidden;

  const { id } = await params;
  await connectDB();
  const query = id.match(/^[a-f\d]{24}$/i) ? { _id: id } : { slug: id };
  const category = await Category.findOneAndUpdate(
    query,
    { $set: { isActive: false } },
    { returnDocument: "after" },
  );
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
