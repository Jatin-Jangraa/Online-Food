import { CalendarDays } from "lucide-react";
import { ReservationForm } from "@/components/reservation-form";
import { Section } from "@/components/ui";

export const metadata = {
  title: "Table Reservations",
};

export default function ReservationsPage() {
  return (
    <Section eyebrow="Reservations" title="Book your favorite table">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <ReservationForm />
        <div className="rounded-[2rem] border border-line bg-card p-6">
          <CalendarDays className="size-14 rounded-3xl bg-brand/10 p-3 text-brand" />
          <h2 className="mt-5 text-2xl font-bold">Reservation notes</h2>
          <p className="mt-3 leading-7 text-muted">We hold reservations for 15 minutes. For groups larger than 12, use the contact form or WhatsApp button for a custom setup.</p>
          <div className="mt-6 rounded-3xl bg-background p-5">
            <p className="font-bold">Best slots</p>
            <p className="mt-2 text-sm text-muted">Breakfast: 8:30 AM - 10:30 AM</p>
            <p className="text-sm text-muted">Dinner: 7:00 PM - 9:30 PM</p>
          </div>
        </div>
      </div>
    </Section>
  );
}
