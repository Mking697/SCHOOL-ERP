"use client";

import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Notice = { id: string; title: string; body: string; audience: string; createdAt: string };

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [form, setForm] = useState({ title: "", body: "", audience: "ALL" });
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/notices").then((r) => r.json()).then(setNotices).catch(() => {});
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setForm({ title: "", body: "", audience: "ALL" });
    load();
  }

  return (
    <div>
      <PageHeader
        title="Notices / Announcements"
        description="Post announcements to the whole school or a specific audience."
      />

      <Card className="max-w-xl mb-6">
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-rose-600 text-sm">{error}</p>}
            <div>
              <Label>Title</Label>
              <Input
                required
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                required
                placeholder="Message"
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                rows={3}
              />
            </div>
            <div>
              <Label>Audience</Label>
              <Select
                value={form.audience}
                onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}
              >
                <option value="ALL">Everyone</option>
                <option value="TEACHERS">Teachers only</option>
                <option value="PARENTS">Parents only</option>
                <option value="STUDENTS">Students only</option>
              </Select>
            </div>
            <Button type="submit">
              <Megaphone className="h-4 w-4" /> Post Notice
            </Button>
          </form>
        </CardBody>
      </Card>

      <div className="space-y-3 max-w-xl">
        {notices.map((n) => (
          <Card key={n.id}>
            <CardBody>
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-900">{n.title}</p>
                <Badge tone="slate">{n.audience}</Badge>
              </div>
              <p className="text-sm text-slate-600 mt-1">{n.body}</p>
              <p className="text-xs text-slate-400 mt-2">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </CardBody>
          </Card>
        ))}
        {notices.length === 0 && <p className="text-slate-400 text-sm">Koi notice nahi hai</p>}
      </div>
    </div>
  );
}
