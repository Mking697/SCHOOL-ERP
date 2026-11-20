"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const MapContainer = dynamic(() => import("@/components/ui/leaflet-base").then((m) => m.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import("@/components/ui/leaflet-base").then((m) => m.DefaultTiles), {
  ssr: false,
});
const Marker = dynamic(() => import("@/components/ui/leaflet-base").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("@/components/ui/leaflet-base").then((m) => m.Popup), { ssr: false });
const ClickCapture = dynamic(() => import("@/components/ui/leaflet-base").then((m) => m.ClickCapture), {
  ssr: false,
});

type Stop = { id: string; name: string; order: number; lat: number | null; lng: number | null };

// Default view centers on India (Delhi) when no stops are placed yet.
const DEFAULT_CENTER: [number, number] = [28.6139, 77.209];

export default function RouteStopsMap({
  routeId,
  stops,
  onChange,
}: {
  routeId: string;
  stops: Stop[];
  onChange: () => void;
}) {
  const [pending, setPending] = useState<{ lat: number; lng: number } | null>(null);
  const [stopName, setStopName] = useState("");

  const placed = stops.filter((s) => s.lat !== null && s.lng !== null);
  const center: [number, number] =
    placed.length > 0 ? [placed[0].lat as number, placed[0].lng as number] : DEFAULT_CENTER;

  async function saveStop(e: React.FormEvent) {
    e.preventDefault();
    if (!pending || !stopName) return;
    await fetch(`/api/transport-routes/${routeId}/stops`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: stopName, lat: pending.lat, lng: pending.lng }),
    });
    setPending(null);
    setStopName("");
    onChange();
  }

  async function removeStop(stopId: string) {
    await fetch(`/api/transport-routes/${routeId}/stops/${stopId}`, { method: "DELETE" });
    onChange();
  }

  return (
    <div>
      <p className="text-xs text-slate-500 mb-2">
        Map par click karke stop ka pin drop karo, naam do aur save karo.
      </p>
      <div className="rounded-lg overflow-hidden border border-slate-200" style={{ height: 288 }}>
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer />
          <ClickCapture onClick={(lat, lng) => setPending({ lat, lng })} />
          {placed.map((s) => (
            <Marker key={s.id} position={[s.lat as number, s.lng as number]}>
              <Popup>{s.name}</Popup>
            </Marker>
          ))}
          {pending && (
            <Marker position={[pending.lat, pending.lng]}>
              <Popup>Naya stop -- neeche naam bharo</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {pending && (
        <form onSubmit={saveStop} className="flex items-end gap-2 mt-2">
          <div>
            <Label>Stop Name</Label>
            <Input
              autoFocus
              value={stopName}
              onChange={(e) => setStopName(e.target.value)}
              placeholder="e.g. Gandhi Chowk"
              className="w-56"
            />
          </div>
          <Button type="submit" size="sm">
            Save Stop
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setPending(null)}>
            Cancel
          </Button>
        </form>
      )}

      {stops.length > 0 && (
        <ol className="mt-3 space-y-1">
          {stops.map((s, i) => (
            <li key={s.id} className="text-sm flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-medium">
                  {i + 1}
                </span>
                {s.name}
                {(s.lat === null || s.lng === null) && (
                  <span className="text-[10px] text-slate-400">(no pin)</span>
                )}
              </span>
              <button onClick={() => removeStop(s.id)} className="text-rose-500 hover:text-rose-700">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
