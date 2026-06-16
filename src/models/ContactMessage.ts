import mongoose, { Schema, models } from "mongoose";

const ContactMessageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["New", "Read", "Archived"], default: "New" },
  },
  { timestamps: true },
);

export const ContactMessage = models.ContactMessage || mongoose.model("ContactMessage", ContactMessageSchema);
