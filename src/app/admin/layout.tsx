import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getIsAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!(await getIsAdmin())) {
    redirect("/login?callbackUrl=/admin");
  }

  return children;
}
