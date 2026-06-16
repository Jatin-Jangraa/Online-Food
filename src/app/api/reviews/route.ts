import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { reviewSchema } from "@/lib/validation";
import { FoodItem } from "@/models/FoodItem";
import { Review } from "@/models/Review";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const foodId = searchParams.get("foodId");
  await connectDB();
  const query = foodId ? { foodItem: foodId, isApproved: true } : { isApproved: true };
  const reviews = await Review.find(query).sort({ createdAt: -1 }).limit(30).lean();
  return NextResponse.json(reviews);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login required to rate food" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectDB();
  const review = await Review.create({
    foodItem: parsed.data.foodId,
    userName: session.user.name ?? session.user.email,
    user: undefined,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
  });

  const aggregate = await Review.aggregate([
    { $match: { foodItem: review.foodItem, isApproved: true } },
    { $group: { _id: "$foodItem", rating: { $avg: "$rating" }, reviews: { $sum: 1 } } },
  ]);

  if (aggregate[0]) {
    await FoodItem.findByIdAndUpdate(review.foodItem, {
      rating: Number(aggregate[0].rating.toFixed(1)),
      reviews: aggregate[0].reviews,
    });
  }

  return NextResponse.json(review, { status: 201 });
}
