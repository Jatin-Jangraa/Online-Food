import mongoose, { Schema, models } from "mongoose";

const ReviewSchema = new Schema(
  {
    foodItem: { type: Schema.Types.ObjectId, ref: "FoodItem", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    userName: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Review = models.Review || mongoose.model("Review", ReviewSchema);
