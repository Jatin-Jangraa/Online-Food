import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CheckoutClient } from "@/components/checkout-client";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { CheckoutAddress } from "@/types";

export const metadata = {
  title: "Checkout",
};

export const dynamic = "force-dynamic";

async function getSavedAddress(): Promise<CheckoutAddress | undefined> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !process.env.MONGODB_URI) return undefined;

  await connectDB();
  const user = await User.findOne({ email: session.user.email }).select("name email addresses").lean();
  const saved = Array.isArray(user?.addresses) ? user.addresses[0] : undefined;

  return {
    name: String(saved?.name ?? user?.name ?? session.user.name ?? ""),
    email: String(saved?.email ?? user?.email ?? session.user.email ?? ""),
    phone: String(saved?.phone ?? ""),
    line1: String(saved?.line1 ?? ""),
    city: String(saved?.city ?? ""),
    pincode: String(saved?.pincode ?? ""),
  };
}

export default async function CheckoutPage() {
  const savedAddress = await getSavedAddress();

  return <CheckoutClient initialAddress={savedAddress} />;
}
