import mongoose, { Schema, models } from "mongoose";

const OfferSchema = new Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    code: String,
    image: { type: String, required: true },
    foodItem: { type: Schema.Types.ObjectId, ref: "FoodItem" },
    ctaLabel: { type: String, default: "Order now" },
    ctaHref: { type: String, default: "/menu" },
    placement: {
      type: String,
      enum: ["home-hero", "home-banner", "menu-banner"],
      default: "home-banner",
    },
    startsAt: Date,
    endsAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Offer = models.Offer || mongoose.model("Offer", OfferSchema);
