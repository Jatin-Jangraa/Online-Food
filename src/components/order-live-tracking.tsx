"use client";

import { MapPin, Navigation, Phone, RefreshCcw, Truck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { DeliveryPartnerLocation, OrderStatus } from "@/types";

type TrackingState = {
  status: OrderStatus;
  fulfillment?: string;
  deliveryPartner?: DeliveryPartnerLocation | null;
};

export function OrderLiveTracking({ orderId, initialTracking }: { orderId: string; initialTracking: TrackingState }) {
  const [tracking, setTracking] = useState(initialTracking);
  const [loading, setLoading] = useState(false);
  const partner = tracking.deliveryPartner;
  const hasLocation = typeof partner?.latitude === "number" && typeof partner?.longitude === "number";
  const mapsUrl = hasLocation ? `https://www.google.com/maps?q=${partner.latitude},${partner.longitude}` : undefined;
  const mapEmbedUrl = hasLocation ? `https://maps.google.com/maps?q=${partner.latitude},${partner.longitude}&z=15&output=embed` : undefined;
  const lastUpdated = partner?.updatedAt ? new Date(partner.updatedAt).toLocaleString("en-IN") : undefined;

  const refreshTracking = useCallback(async () => {
    setLoading(true);
    const response = await fetch(`/api/orders/${orderId}`, { cache: "no-store" });
    setLoading(false);
    if (!response.ok) return;
    const data = await response.json();
    setTracking(data);
  }, [orderId]);

  useEffect(() => {
    const timer = window.setInterval(refreshTracking, 15000);
    return () => window.clearInterval(timer);
  }, [refreshTracking]);

  if (tracking.fulfillment === "pickup") {
    return (
      <div className="mt-8 rounded-[2rem] border border-line bg-background p-5">
        <h3 className="font-bold">Pickup tracking</h3>
        <p className="mt-2 text-sm text-muted">Your order status updates here while the cafe prepares it for pickup.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-[2rem] border border-line bg-background p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-bold">Delivery partner location</h3>
          <p className="mt-1 text-sm text-muted">Refreshes automatically every 15 seconds.</p>
        </div>
        <button type="button" onClick={refreshTracking} className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-sm font-bold">
          <RefreshCcw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_16rem]">
        <div className="min-h-72 overflow-hidden rounded-3xl border border-line bg-card">
          {mapEmbedUrl ? (
            <iframe title="Delivery partner location" src={mapEmbedUrl} className="h-72 w-full" loading="lazy" />
          ) : (
            <div className="grid h-72 place-items-center p-6 text-center">
              <div>
                <MapPin className="mx-auto size-10 text-muted" />
                <p className="mt-3 font-bold">Waiting for location</p>
                <p className="mt-2 text-sm text-muted">The admin or delivery partner can publish GPS coordinates once the order is out for delivery.</p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-line bg-card p-4">
          <Truck className="size-10 rounded-2xl bg-brand/10 p-2 text-brand" />
          <h4 className="mt-4 font-bold">{partner?.name ?? "Partner not assigned"}</h4>
          <div className="mt-3 space-y-2 text-sm text-muted">
            {partner?.phone && <p className="flex gap-2"><Phone className="size-4" /> {partner.phone}</p>}
            {partner?.vehicle && <p>{partner.vehicle}</p>}
            {partner?.etaMinutes !== undefined && <p className="font-bold text-foreground">ETA: {partner.etaMinutes} min</p>}
            {lastUpdated && <p>Updated: {lastUpdated}</p>}
            {hasLocation && <p>{partner?.latitude}, {partner?.longitude}</p>}
          </div>
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-bold text-white">
              <Navigation className="size-4" />
              Open map
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
