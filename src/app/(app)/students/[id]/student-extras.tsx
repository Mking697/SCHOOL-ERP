"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { Plus } from "lucide-react";

type Behavior = { id: string; type: string; category?: string; description: string; createdAt: string };
type Achievement = { id: string; title: string; category?: string; date: string };

export default function StudentExtras({
  studentId,
  behaviorRecords,
  achievements,
}: {
  studentId: string;
  behaviorRecords: Behavior[];
  achievements: Achievement[];
}) {
  const router = useRouter();
  const [behaviorForm, setBehaviorForm] = useState({ type: "POSITIVE", category: "", description: "" });
  const [achievementForm, setAchievementForm] = useState({ title: "", category: "", date: "" });

  async function submitBehavior(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/behavior-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, ...behaviorForm }),
    });
    setBehaviorForm({ type: "POSITIVE", category: "", description: "" });
    router.refresh();
  }

  async function submitAchievement(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/achievements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, ...achievementForm }),
    });
    setAchievementForm({ title: "", category: "", date: "" });
    router.refresh();
  }

  return (
    <div className="grid grid-cols-2 gap-6 max-w-2xl mt-6">
      <div>
        <h2 className="font-semibold text-slate-900 mb-2">Behavior / Discipline</h2>
        <Card className="mb-3">
          <CardBody>
            <form onSubmit={submitBehavior} className="space-y-2">
              <Select
                value={behaviorForm.type}
                onChange={(e) => setBehaviorForm((f) => ({ ...f, type: e.target.value }))}
                className="text-xs"
              >
                <option value="POSITIVE">Positive</option>
                <option value="NEGATIVE">Negative / Incident</option>
              </Select>
              <Input
                required
                placeholder="Description"
                value={behaviorForm.description}
                onChange={(e) => setBehaviorForm((f) => ({ ...f, description: e.target.value }))}
                className="text-xs"
              />
              <Button type="submit" size="sm" variant="primary">
                <Plus className="w-3.5 h-3.5" />
                Add Record
              </Button>
            </form>
          </CardBody>
        </Card>
        <div className="space-y-2">
          {behaviorRecords.map((b) => (
            <Card key={b.id}>
              <CardBody className="text-xs space-y-1">
                <Badge tone={b.type === "POSITIVE" ? "green" : "red"}>{b.type}</Badge>
                <p className="text-slate-600">{b.description}</p>
                <p className="text-slate-400">{new Date(b.createdAt).toLocaleDateString()}</p>
              </CardBody>
            </Card>
          ))}
          {behaviorRecords.length === 0 && <p className="text-slate-400 text-xs">Koi record nahi</p>}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-slate-900 mb-2">Achievements</h2>
        <Card className="mb-3">
          <CardBody>
            <form onSubmit={submitAchievement} className="space-y-2">
              <Input
                required
                placeholder="Achievement title"
                value={achievementForm.title}
                onChange={(e) => setAchievementForm((f) => ({ ...f, title: e.target.value }))}
                className="text-xs"
              />
              <Input
                placeholder="Category (Sports, Academics...)"
                value={achievementForm.category}
                onChange={(e) => setAchievementForm((f) => ({ ...f, category: e.target.value }))}
                className="text-xs"
              />
              <Button type="submit" size="sm" variant="primary">
                <Plus className="w-3.5 h-3.5" />
                Add Achievement
              </Button>
            </form>
          </CardBody>
        </Card>
        <div className="space-y-2">
          {achievements.map((a) => (
            <Card key={a.id}>
              <CardBody className="text-xs space-y-1">
                <p className="font-medium text-slate-900">{a.title}</p>
                <p className="text-slate-500">{a.category || "-"}</p>
                <p className="text-slate-400">{new Date(a.date).toLocaleDateString()}</p>
              </CardBody>
            </Card>
          ))}
          {achievements.length === 0 && <p className="text-slate-400 text-xs">Koi achievement nahi</p>}
        </div>
      </div>
    </div>
  );
}
