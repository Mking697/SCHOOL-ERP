"use client";

import { useEffect, useState } from "react";

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
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-6">School Events</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 mb-6 max-w-xl space-y-2">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input
          required
          placeholder="Event title e.g. Annual Sports Day"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="border rounded px-3 py-2 text-sm w-full"
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="border rounded px-3 py-2 text-sm w-full"
        />
        <div className="flex gap-2">
          <input
            required
            type="date"
            value={form.eventDate}
            onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
            className="border rounded px-3 py-2 text-sm flex-1"
          />
          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            className="border rounded px-3 py-2 text-sm flex-1"
          />
        </div>
        <button className="bg-blue-600 text-white rounded px-4 py-2 text-sm">Add Event</button>
      </form>

      <div className="space-y-3 max-w-xl">
        {events.map((e) => (
          <div key={e.id} className="bg-white rounded-lg shadow p-4">
            <p className="font-semibold">{e.title}</p>
            <p className="text-sm text-gray-600">
              {new Date(e.eventDate).toLocaleDateString()}
              {e.location ? ` -- ${e.location}` : ""}
            </p>
            {e.description && <p className="text-sm text-gray-500 mt-1">{e.description}</p>}
          </div>
        ))}
        {events.length === 0 && <p className="text-gray-400">Koi event nahi hai</p>}
      </div>
    </div>
  );
}
