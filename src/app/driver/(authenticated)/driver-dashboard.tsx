"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, MapPin, LogOut, Play, Square, AlertCircle } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Route = {
  id: string;
  name: string;
  vehicleNumber: string | null;
  driverName: string | null;
  stops: { id: string; name: string }[];
};

export default function DriverDashboard({ route }: { route: Route }) {
  const router = useRouter();
  const [sharing, setSharing] = useState(false);
  const [lastSent, setLastSent] = useState<{ lat: number; lng: number; at: Date } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastSendRef = useRef<number>(0);

  async function handleLogout() {
    stopSharing();
    await fetch("/api/driver/auth/logout", { method: "POST" });
    router.push("/driver/login");
    router.refresh();
  }

  function startSharing() {
    setError(null);
    if (!("geolocation" in navigator)) {
      setError("Is browser/device mein GPS/Geolocation support nahi hai.");
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        // Throttle to at most once every 10s so we don't flood the server.
        if (now - lastSendRef.current < 10000) return;
        lastSendRef.current = now;
        const { latitude, longitude } = pos.coords;
        fetch("/api/driver/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: latitude, lng: longitude }),
        })
          .then((r) => {
            if (r.ok) setLastSent({ lat: latitude, lng: longitude, at: new Date() });
          })
          .catch(() => {});
      },
      (err) => setError(`GPS error: ${err.message}`),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    watchIdRef.current = id;
    setSharing(true);
  }

  function stopSharing() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setSharing(false);
  }

  useEffect(() => stopSharing, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-amber-800 text-white px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          <div>
            <p className="text-sm font-semibold leading-tight">{route.name}</p>
            <p className="text-[11px] text-amber-200 leading-tight">{route.vehicleNumber}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-white/10">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      <main className="flex-1 p-4 max-w-md w-full mx-auto space-y-4">
        {error && (
          <div className="flex items-start gap-2 bg-rose-50 text-rose-700 text-sm rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Card>
          <CardBody className="text-center py-8">
            <div
              className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                sharing ? "bg-emerald-100 text-emerald-600 animate-pulse" : "bg-slate-100 text-slate-400"
              }`}
            >
              <MapPin className="w-9 h-9" />
            </div>
            <p className="font-semibold text-slate-900 mb-1">
              {sharing ? "Sharing Live Location" : "Location Sharing Off"}
            </p>
            {lastSent && (
              <p className="text-xs text-slate-500 mb-4">
                Last sent: {lastSent.lat.toFixed(4)}, {lastSent.lng.toFixed(4)} at{" "}
                {lastSent.at.toLocaleTimeString()}
              </p>
            )}
            {!sharing ? (
              <Button onClick={startSharing} className="!bg-emerald-600 hover:!bg-emerald-700">
                <Play className="w-4 h-4" />
                Start Trip / Share Location
              </Button>
            ) : (
              <Button onClick={stopSharing} variant="danger">
                <Square className="w-4 h-4" />
                Stop Sharing
              </Button>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-sm font-semibold text-slate-800">Stops on this route</p>
          </CardHeader>
          <CardBody>
            {route.stops.length === 0 ? (
              <p className="text-sm text-slate-400">Koi stops add nahi kiye gaye</p>
            ) : (
              <ol className="space-y-2">
                {route.stops.map((s, i) => (
                  <li key={s.id} className="text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-medium">
                      {i + 1}
                    </span>
                    {s.name}
                  </li>
                ))}
              </ol>
            )}
          </CardBody>
        </Card>
      </main>
    </div>
  );
}
