import { NextResponse } from "next/server";
import { getRazorpay } from "@/lib/razorpay";

export async function POST(request: Request) {
  try {
    const { amount, receipt } = await request.json();
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: receipt ?? `bnb_${Date.now()}`,
    });
    return NextResponse.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Razorpay order failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
