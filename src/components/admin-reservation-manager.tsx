"use client";

import { useState } from "react";

type ReservationStatus = "Pending" | "Confirmed" | "Cancelled";

type AdminReservation = {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  occasion?: string;
  status: ReservationStatus;
};

const statuses: ReservationStatus[] = ["Pending", "Confirmed", "Cancelled"];

export function AdminReservationManager({ initialReservations }: { initialReservations: AdminReservation[] }) {
  const [reservations, setReservations] = useState(initialReservations);
  const [message, setMessage] = useState("");

  async function updateStatus(id: string, status: ReservationStatus) {
    setMessage("");
    const response = await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      setMessage("Could not update reservation.");
      return;
    }
    setReservations((current) => current.map((reservation) => (reservation.id === id ? { ...reservation, status } : reservation)));
    setMessage("Reservation updated.");
  }

  return (
    <div className="mt-8 grid gap-4">
      {message && <p className="rounded-2xl bg-card p-4 text-sm font-semibold text-muted">{message}</p>}
      {reservations.map((reservation) => (
        <article key={reservation.id} className="rounded-[2rem] border border-line bg-card p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
            <div>
              <h2 className="font-bold">{reservation.name}</h2>
              <p className="text-sm text-muted">{reservation.phone}</p>
              <p className="mt-2 text-sm text-muted">
                {reservation.date} at {reservation.time} - {reservation.guests} guest(s)
              </p>
              {reservation.occasion && <p className="mt-1 text-xs font-bold text-brand">{reservation.occasion}</p>}
            </div>
            <span className="rounded-full bg-brand/10 px-4 py-2 text-sm font-bold text-brand">{reservation.status}</span>
            <select value={reservation.status} onChange={(event) => updateStatus(reservation.id, event.target.value as ReservationStatus)} className="h-11 rounded-full border border-line bg-background px-4 text-sm font-bold">
              {statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>
        </article>
      ))}
      {!reservations.length && <p className="rounded-[2rem] border border-line bg-card p-8 text-center text-muted">No table reservations yet.</p>}
    </div>
  );
}
