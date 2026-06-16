import { NextResponse } from "next/server";
import { requireAdminResponse } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { foodItemSchema } from "@/lib/validation";
import { FoodItem } from "@/models/FoodItem";

export async function GET() {
  await connectDB();
  const items = await FoodItem.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  try {
    const forbidden = await requireAdminResponse();
    if (forbidden) return forbidden;

    const contentType = request.headers.get("content-type") ?? "";
    const body = contentType.includes("application/json") ? await request.json() : Object.fromEntries(await request.formData());
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
    const categorySlug = parsed.data.category
      .split(",")[0]
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
    const images = parsed.data.images
      ? parsed.data.images.split("\n").flatMap((line) => line.split(",")).map((line) => line.trim()).filter(Boolean)
      : [parsed.data.image];
    const foodData: Partial<typeof parsed.data> = { ...parsed.data };
    delete foodData.category;
    const item = await FoodItem.create({
      ...foodData,
      categorySlug,
      images,
      image: parsed.data.image || images[0],
      tags: parsed.data.tags?.split(",").map((tag) => tag.trim()).filter(Boolean) ?? [],
      customizations: {
        sizes: [
          { label: "Regular", price: 0 },
          { label: "Large", price: 80 },
        ],
        toppings: [
          { label: "Extra cheese", price: 60 },
          { label: "Caramel drizzle", price: 45 },
          { label: "Roasted nuts", price: 55 },
        ],
        levels: ["Low sugar", "Balanced", "Extra sweet", "Mild spice", "Medium spice", "Hot"],
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
