import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getIsAdmin() {
  const session = await getServerSession(authOptions);
  return (session?.user as { role?: string } | undefined)?.role === "admin";
}

export async function requireAdminResponse() {
  if (await getIsAdmin()) return null;
  return NextResponse.json({ error: "Admin access required" }, { status: 403 });
}
