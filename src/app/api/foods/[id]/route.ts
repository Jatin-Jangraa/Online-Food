import { NextResponse } from "next/server";
import { requireAdminResponse } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { foodItemSchema } from "@/lib/validation";
import { FoodItem } from "@/models/FoodItem";

function normalizeCategory(category: string) {
  return category.split(",")[0].trim().toLowerCase().replace(/\s+/g, "-");
}

function normalizeImages(image: string, images?: string) {
  const parsedImages = images
    ? images.split("\n").flatMap((line) => line.split(",")).map((line) => line.trim()).filter(Boolean)
    : [];
  return parsedImages.length ? parsedImages : [image].filter(Boolean);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const forbidden = await requireAdminResponse();
    if (forbidden) return forbidden;

    const { id } = await params;
    const body = await request.json();
    const parsed = foodItemSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const message =
        fieldErrors.name?.[0] ??
        fieldErrors.category?.[0] ??
        fieldErrors.description?.[0] ??
        fieldErrors.price?.[0] ??
        fieldErrors.image?.[0] ??
        "Please check the product form.";
      return NextResponse.json({ error: message, fieldErrors }, { status: 400 });
    }

    await connectDB();
    const images = normalizeImages(parsed.data.image, parsed.data.images);
    const update = {
      name: parsed.data.name,
      categorySlug: normalizeCategory(parsed.data.category),
      description: parsed.data.description,
      price: parsed.data.price,
      image: parsed.data.image || images[0],
      images,
      rating: parsed.data.rating,
      tags: parsed.data.tags?.split(",").map((tag) => tag.trim()).filter(Boolean) ?? [],
      isFeatured: parsed.data.isFeatured,
      isVeg: parsed.data.isVeg,
      offerBadge: parsed.data.offerBadge,
      offerPrice: parsed.data.offerPrice,
    };
    const item = await FoodItem.findByIdAndUpdate(id, { $set: update }, { returnDocument: "after" });
    if (!item) {
      return NextResponse.json({ error: "Food item not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const forbidden = await requireAdminResponse();
  if (forbidden) return forbidden;

  const { id } = await params;
  await connectDB();
  const item = await FoodItem.findByIdAndUpdate(id, { $set: { isAvailable: false } }, { returnDocument: "after" });
  if (!item) {
    return NextResponse.json({ error: "Food item not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
