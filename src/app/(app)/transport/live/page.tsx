"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import ExportButtons from "@/components/export-buttons";
import type { ExportColumn } from "@/lib/export";

const MapContainer = dynamic(() => import("@/components/ui/leaflet-base").then((m) => m.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import("@/components/ui/leaflet-base").then((m) => m.DefaultTiles), {
  ssr: false,
});
const Marker = dynamic(() => import("@/components/ui/leaflet-base").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("@/components/ui/leaflet-base").then((m) => m.Popup), { ssr: false });

type Route = {
  id: string;
  name: string;
  vehicleNumber?: string;
  driverName?: string;
  currentLat?: number | null;
  currentLng?: number | null;
  locationUpdatedAt?: string | null;
};

const DEFAULT_CENTER: [number, number] = [28.6139, 77.209];

export default function LiveTrackingPage() {
  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    function load() {
      fetch("/api/transport-routes").then((r) => r.json()).then(setRoutes).catch(() => {});
    }
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  const live = routes.filter((r) => r.currentLat !== null && r.currentLat !== undefined && r.currentLng !== null && r.currentLng !== undefined);
  const center: [number, number] = live.length > 0 ? [live[0].currentLat as number, live[0].currentLng as number] : DEFAULT_CENTER;

  const exportColumns: ExportColumn<Route>[] = [
    { header: "Route Name", value: (r) => r.name },
    { header: "Vehicle Number", value: (r) => r.vehicleNumber || "-" },
    { header: "Driver Name", value: (r) => r.driverName || "-" },
    { header: "Current Lat", value: (r) => r.currentLat ?? "-" },
    { header: "Current Lng", value: (r) => r.currentLng ?? "-" },
    { header: "Location Updated At", value: (r) => r.locationUpdatedAt || "-" },
  ];

  return (
    <div>
      <Link href="/transport" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Transport
      </Link>
      <PageHeader
        title="Live Bus Tracking"
        description={`${live.length} of ${routes.length} buses are currently sharing location -- auto-refreshes every 15s`}
        actions={
          <ExportButtons data={live} columns={exportColumns} filename="live-bus-tracking" sheetName="Live Tracking" />
        }
      />
      <div className="rounded-lg overflow-hidden border border-slate-200" style={{ height: 560 }}>
        <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer />
          {live.map((r) => (
            <Marker key={r.id} position={[r.currentLat as number, r.currentLng as number]}>
              <Popup>
                <b>{r.name}</b>
                <br />
                {r.vehicleNumber} -- {r.driverName}
                <br />
                {r.locationUpdatedAt && new Date(r.locationUpdatedAt).toLocaleTimeString()}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      {live.length === 0 && (
        <p className="text-sm text-slate-400 mt-2">
          Koi bus abhi live location share nahi kar raha -- driver ko apna app khol ke &quot;Start Trip&quot;
          dabana hoga.
        </p>
      )}
    </div>
  );
}
