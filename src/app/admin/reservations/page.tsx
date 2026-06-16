import { AdminNav } from "@/components/admin-nav";
import { AdminReservationManager } from "@/components/admin-reservation-manager";
import { Section } from "@/components/ui";
import { connectDB } from "@/lib/db";
import { Reservation } from "@/models/Reservation";

export const metadata = { title: "Reservation Management" };

async function getReservations() {
  if (!process.env.MONGODB_URI) return [];
  try {
    await connectDB();
    const reservations = await Reservation.find().sort({ createdAt: -1 }).lean();
    return reservations.map((reservation) => ({
      id: String(reservation._id),
      name: String(reservation.name),
      phone: String(reservation.phone),
      date: String(reservation.date),
      time: String(reservation.time),
      guests: Number(reservation.guests),
      occasion: reservation.occasion ? String(reservation.occasion) : undefined,
      status: reservation.status as "Pending" | "Confirmed" | "Cancelled",
    }));
  } catch {
    return [];
  }
}

export default async function AdminReservationsPage() {
  const reservations = await getReservations();

  return (
    <Section eyebrow="Admin" title="Table reservation management">
      <AdminNav />
      <AdminReservationManager initialReservations={reservations} />
    </Section>
  );
}
