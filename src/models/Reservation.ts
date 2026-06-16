import mongoose, { Schema, models } from "mongoose";

const ReservationSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    guests: { type: Number, required: true },
    occasion: String,
    status: { type: String, enum: ["Pending", "Confirmed", "Cancelled"], default: "Pending" },
  },
  { timestamps: true },
);

export const Reservation = models.Reservation || mongoose.model("Reservation", ReservationSchema);
