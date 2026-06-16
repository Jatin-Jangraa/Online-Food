import mongoose, { Schema, models } from "mongoose";

const AddressSchema = new Schema(
  {
    name: String,
    email: String,
    label: String,
    line1: String,
    city: String,
    pincode: String,
    phone: String,
  },
  { _id: false },
);

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: String,
    provider: { type: String, enum: ["credentials", "google"], default: "credentials" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    image: String,
    addresses: [AddressSchema],
  },
  { timestamps: true },
);

export const User = models.User || mongoose.model("User", UserSchema);
