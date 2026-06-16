import mongoose, { Schema, models } from "mongoose";

const OrderItemSchema = new Schema(
  {
    foodItem: String,
    name: String,
    quantity: Number,
    size: String,
    toppings: [String],
    level: String,
    price: Number,
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    items: [OrderItemSchema],
    fulfillment: { type: String, enum: ["delivery", "pickup"], default: "delivery" },
    address: {
      name: String,
      email: String,
      phone: String,
      line1: String,
      city: String,
      pincode: String,
    },
    subtotal: Number,
    tax: Number,
    deliveryCharge: Number,
    discount: Number,
    total: Number,
    couponCode: String,
    paymentMethod: { type: String, enum: ["cod", "razorpay"], default: "cod" },
    paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    deliveryPartner: {
      name: String,
      phone: String,
      vehicle: String,
      latitude: Number,
      longitude: Number,
      etaMinutes: Number,
      updatedAt: Date,
    },
    status: {
      type: String,
      enum: ["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

export const Order = models.Order || mongoose.model("Order", OrderSchema);
