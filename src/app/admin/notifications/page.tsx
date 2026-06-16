import { AdminNav } from "@/components/admin-nav";
import { AdminNotificationManager } from "@/components/admin-notification-manager";
import { Section } from "@/components/ui";
import { getContactNotifications } from "@/lib/live-data";

export const metadata = { title: "Notifications" };

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const messages = await getContactNotifications();

  return (
    <Section eyebrow="Admin" title="Contact notifications">
      <AdminNav />
      <AdminNotificationManager initialMessages={messages} />
    </Section>
  );
}
