"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

type ClassLevel = { id: string; name: string; sections: { id: string; name: string }[] };

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassLevel[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const [newSectionName, setNewSectionName] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/classes")
      .then((r) => r.json())
      .then(setClasses)
      .catch(() => {});
  }

  useEffect(load, []);

  async function addClass(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newClassName }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setNewClassName("");
    load();
  }

  async function addSection(classLevelId: string) {
    const name = newSectionName[classLevelId];
    if (!name) return;
    const res = await fetch("/api/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, classLevelId }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setNewSectionName((s) => ({ ...s, [classLevelId]: "" }));
    load();
  }

  return (
    <div>
      <PageHeader title="Classes & Sections" description="Manage class levels and their sections" />
      {error && <p className="text-rose-600 text-sm mb-4">{error}</p>}

      <form onSubmit={addClass} className="flex gap-2 mb-6 max-w-md">
        <Input
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
          placeholder="e.g. Class 10"
          className="flex-1"
        />
        <Button variant="primary">
          <Plus className="w-4 h-4" />
          Add Class
        </Button>
      </form>

      <div className="space-y-4 max-w-2xl">
        {classes.map((c) => (
          <Card key={c.id}>
            <CardBody>
              <p className="font-semibold text-slate-900 mb-2">{c.name}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {c.sections.map((s) => (
                  <Badge key={s.id} tone="slate">
                    {s.name}
                  </Badge>
                ))}
                {c.sections.length === 0 && (
                  <span className="text-slate-400 text-sm">Koi section nahi</span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSectionName[c.id] || ""}
                  onChange={(e) =>
                    setNewSectionName((s) => ({ ...s, [c.id]: e.target.value }))
                  }
                  placeholder="Section name e.g. A"
                  className="text-sm"
                />
                <Button
                  onClick={() => addSection(c.id)}
                  variant="secondary"
                  size="sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Section
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
        {classes.length === 0 && (
          <p className="text-slate-400">Koi class nahi bani abhi</p>
        )}
      </div>
    </div>
  );
}
