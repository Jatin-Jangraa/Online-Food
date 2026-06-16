import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { requireAdminResponse } from "@/lib/admin-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  await connectDB();
  const order = await Order.findById(id).select("address status fulfillment deliveryPartner").lean();
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const isAdmin = (session.user as { role?: string }).role === "admin";
  if (!isAdmin && order.address?.email !== session.user.email) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: order.status,
    fulfillment: order.fulfillment,
    deliveryPartner: order.deliveryPartner ?? null,
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const forbidden = await requireAdminResponse();
  if (forbidden) return forbidden;

  const { id } = await params;
  const body = await request.json();
  const update: Record<string, unknown> = {};
  if (body.status !== undefined) update.status = body.status;

  if (body.deliveryPartner) {
    for (const [key, value] of Object.entries(body.deliveryPartner)) {
      if (value !== "" && value !== undefined && value !== null) {
        update[`deliveryPartner.${key}`] = value;
      }
    }
    update["deliveryPartner.updatedAt"] = new Date();
  }

  await connectDB();
  const order = await Order.findByIdAndUpdate(id, { $set: update }, { returnDocument: "after" });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json(order);
}
