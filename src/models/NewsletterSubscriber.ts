import mongoose, { Schema, models } from "mongoose";

const NewsletterSubscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    source: { type: String, default: "home" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const NewsletterSubscriber =
  models.NewsletterSubscriber || mongoose.model("NewsletterSubscriber", NewsletterSubscriberSchema);
