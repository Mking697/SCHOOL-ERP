"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";

type Event = {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  location?: string;
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState({ title: "", description: "", eventDate: "", location: "" });
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/events").then((r) => r.json()).then(setEvents).catch(() => {});
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setForm({ title: "", description: "", eventDate: "", location: "" });
    load();
  }

  return (
    <div>
      <PageHeader
        title="School Events"
        description="Plan and publish upcoming school events."
      />

      <Card className="max-w-xl mb-6">
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-rose-600 text-sm">{error}</p>}
            <div>
              <Label>Event title</Label>
              <Input
                required
                placeholder="Event title e.g. Annual Sports Day"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label>Date</Label>
                <Input
                  required
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
                />
              </div>
              <div className="flex-1">
                <Label>Location</Label>
                <Input
                  placeholder="Location"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                />
              </div>
            </div>
            <Button type="submit">
              <CalendarDays className="h-4 w-4" /> Add Event
            </Button>
          </form>
        </CardBody>
      </Card>

      <div className="space-y-3 max-w-xl">
        {events.map((e) => (
          <Card key={e.id}>
            <CardBody>
              <p className="font-semibold text-slate-900">{e.title}</p>
              <p className="text-sm text-slate-600">
                {new Date(e.eventDate).toLocaleDateString()}
                {e.location ? ` -- ${e.location}` : ""}
              </p>
              {e.description && <p className="text-sm text-slate-500 mt-1">{e.description}</p>}
            </CardBody>
          </Card>
        ))}
        {events.length === 0 && <p className="text-slate-400 text-sm">Koi event nahi hai</p>}
      </div>
    </div>
  );
}
