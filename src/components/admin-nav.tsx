import Link from "next/link";
import { getUnreadContactMessageCount } from "@/lib/live-data";

export async function AdminNav() {
  const unreadMessages = await getUnreadContactMessageCount();
  const links = [
    ["/admin", "Overview"],
    ["/admin/foods", "Foods"],
    ["/admin/categories", "Categories"],
    ["/admin/orders", "Orders"],
    ["/admin/reservations", "Reservations"],
    ["/admin/notifications", "Notifications"],
    ["/admin/coupons", "Coupons"],
    ["/admin/offers", "Offers"],
  ];

  return (
    <nav className="flex flex-wrap gap-2 rounded-[2rem] border border-line bg-card p-2">
      {links.map(([href, label]) => (
        <Link key={href} href={href} className="rounded-full px-4 py-2 text-sm font-bold text-muted hover:bg-background hover:text-brand">
          {label}
          {href === "/admin/notifications" && unreadMessages > 0 && (
            <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-xs text-white">{unreadMessages}</span>
          )}
        </Link>
      ))}
    </nav>
  );
}
