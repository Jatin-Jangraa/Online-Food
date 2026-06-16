import mongoose, { Schema, models } from "mongoose";

const OptionSchema = new Schema(
  {
    label: { type: String, required: true },
    price: { type: Number, default: 0 },
  },
  { _id: false },
);

const FoodItemSchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    categorySlug: String,
    description: { type: String, required: true },
    image: { type: String, required: true },
    images: [String],
    cloudinaryPublicId: String,
    price: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    tags: [String],
    isFeatured: { type: Boolean, default: false },
    offerBadge: String,
    offerPrice: Number,
    isVeg: { type: Boolean, default: true },
    customizations: {
      sizes: [OptionSchema],
      toppings: [OptionSchema],
      levels: [String],
    },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const FoodItem = models.FoodItem || mongoose.model("FoodItem", FoodItemSchema);
