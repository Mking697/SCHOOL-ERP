"use client";

import { useEffect, useState } from "react";
import { Bus, KeyRound, MapPin } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Route = {
  id: string;
  name: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  hasDriverLogin: boolean;
  currentLat?: number | null;
  currentLng?: number | null;
  locationUpdatedAt?: string | null;
  stops: { id: string; name: string }[];
  students: { id: string }[];
};

export default function TransportPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [form, setForm] = useState({ name: "", vehicleNumber: "", driverName: "", driverPhone: "" });
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/transport-routes").then((r) => r.json()).then(setRoutes).catch(() => {});
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/transport-routes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setForm({ name: "", vehicleNumber: "", driverName: "", driverPhone: "" });
    load();
  }

  return (
    <div>
      <PageHeader
        title="Transport Management"
        description="Manage transport routes, vehicles and drivers."
      />

      <Card className="max-w-xl mb-6">
        <CardBody>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            {error && <p className="text-rose-600 text-sm col-span-2">{error}</p>}
            <div className="col-span-2">
              <Label>Route name</Label>
              <Input
                required
                placeholder="Route name e.g. Route 1 - North"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Vehicle Number</Label>
              <Input
                placeholder="Vehicle Number"
                value={form.vehicleNumber}
                onChange={(e) => setForm((f) => ({ ...f, vehicleNumber: e.target.value }))}
              />
            </div>
            <div>
              <Label>Driver Name</Label>
              <Input
                placeholder="Driver Name"
                value={form.driverName}
                onChange={(e) => setForm((f) => ({ ...f, driverName: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <Label>Driver Phone</Label>
              <Input
                placeholder="Driver Phone"
                value={form.driverPhone}
                onChange={(e) => setForm((f) => ({ ...f, driverPhone: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <Button type="submit">
                <Bus className="h-4 w-4" /> Add Route
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <div className="space-y-3 max-w-2xl">
        {routes.map((r) => (
          <RouteCard key={r.id} route={r} onChange={load} />
        ))}
        {routes.length === 0 && <p className="text-slate-400 text-sm">Koi route nahi bana</p>}
      </div>
    </div>
  );
}

function RouteCard({ route: r, onChange }: { route: Route; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/transport-routes/${r.id}/driver-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const d = await res.json();
        setErr(d.error);
        return;
      }
      setPassword("");
      setOpen(false);
      onChange();
    } finally {
      setSaving(false);
    }
  }

  const minutesAgo = r.locationUpdatedAt
    ? Math.round((Date.now() - new Date(r.locationUpdatedAt).getTime()) / 60000)
    : null;

  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-900">{r.name}</p>
            <p className="text-sm text-slate-600">
              {r.vehicleNumber || "-"} &middot; {r.driverName || "-"}{" "}
              {r.driverPhone ? `(${r.driverPhone})` : ""}
            </p>
            <p className="text-xs text-slate-400 mt-1">{r.students.length} students assigned</p>
            {r.currentLat && r.currentLng ? (
              <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                Live: {r.currentLat.toFixed(4)}, {r.currentLng.toFixed(4)} &middot;{" "}
                {minutesAgo !== null ? `${minutesAgo}m ago` : ""}
              </p>
            ) : (
              <p className="text-xs text-slate-400 mt-1">No live location yet</p>
            )}
          </div>
          <Badge tone={r.hasDriverLogin ? "green" : "slate"}>
            {r.hasDriverLogin ? "Driver App Active" : "Not Activated"}
          </Badge>
        </div>

        {!open ? (
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => setOpen(true)}>
            <KeyRound className="w-3.5 h-3.5" />
            {r.hasDriverLogin ? "Reset Driver Password" : "Activate Driver App"}
          </Button>
        ) : (
          <form onSubmit={handleActivate} className="flex items-end gap-2 flex-wrap mt-3">
            <div>
              <Label>New Password</Label>
              <Input
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="min 6 characters"
                className="w-48"
              />
            </div>
            {err && <p className="text-rose-600 text-sm">{err}</p>}
            <Button type="submit" variant="success" size="sm" disabled={saving}>
              Save
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </form>
        )}
        {r.hasDriverLogin && !r.vehicleNumber && (
          <p className="text-xs text-rose-600 mt-2">
            Vehicle Number missing -- Driver App login isi se hota hai.
          </p>
        )}
      </CardBody>
    </Card>
  );
}
