"use client";

import { useEffect, useState } from "react";
import { Bus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type Route = {
  id: string;
  name: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
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
          <Card key={r.id}>
            <CardBody>
              <p className="font-semibold text-slate-900">{r.name}</p>
              <p className="text-sm text-slate-600">
                {r.vehicleNumber || "-"} · {r.driverName || "-"} {r.driverPhone ? `(${r.driverPhone})` : ""}
              </p>
              <p className="text-xs text-slate-400 mt-1">{r.students.length} students assigned</p>
            </CardBody>
          </Card>
        ))}
        {routes.length === 0 && <p className="text-slate-400 text-sm">Koi route nahi bana</p>}
      </div>
    </div>
  );
}
