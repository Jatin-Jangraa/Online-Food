import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import { requireAdminResponse } from "@/lib/admin-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { User } from "@/models/User";

export async function GET() {
  const forbidden = await requireAdminResponse();
  if (forbidden) return forbidden;

  await connectDB();
  return NextResponse.json(await Order.find().sort({ createdAt: -1 }).lean());
}

export async function POST(request: Request) {
  const body = await request.json();
  const paymentMethod = body.paymentMethod === "razorpay" ? "razorpay" : "cod";

  if (paymentMethod === "razorpay") {
    const verified = verifyRazorpayPayment({
      orderId: body.razorpayOrderId,
      paymentId: body.razorpayPaymentId,
      signature: body.razorpaySignature,
    });
    if (!verified) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }
  }

  await connectDB();
  const session = await getServerSession(authOptions);
  const user = session?.user?.email ? await User.findOne({ email: session.user.email }).select("_id email name").lean() : null;
  const address = {
    ...(body.address ?? {}),
    email: body.address?.email ?? session?.user?.email,
    name: body.address?.name ?? session?.user?.name,
  };
  const shouldSaveAddress =
    user?._id &&
    body.fulfillment === "delivery" &&
    address.name &&
    address.email &&
    address.phone &&
    address.line1 &&
    address.city &&
    address.pincode;

  if (shouldSaveAddress) {
    await User.findByIdAndUpdate(user._id, {
      $set: {
        addresses: [
          {
            name: address.name,
            email: address.email,
            phone: address.phone,
            line1: address.line1,
            city: address.city,
            pincode: address.pincode,
            label: "Default",
          },
        ],
      },
    });
  }

  const order = await Order.create({
    ...body,
    address,
    paymentMethod,
    paymentStatus: paymentMethod === "razorpay" ? "Paid" : "Pending",
    user: user?._id,
  });
  return NextResponse.json(order, { status: 201 });
}

function verifyRazorpayPayment({
  orderId,
  paymentId,
  signature,
}: {
  orderId?: string;
  paymentId?: string;
  signature?: string;
}) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !orderId || !paymentId || !signature) return false;

  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
