import mongoose, { Schema, models } from "mongoose";

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: { type: String, enum: ["percent", "flat"], required: true },
    value: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    expiresAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Coupon = models.Coupon || mongoose.model("Coupon", CouponSchema);
