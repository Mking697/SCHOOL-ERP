"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
        <h2 className="font-semibold mb-2">Behavior / Discipline</h2>
        <form onSubmit={submitBehavior} className="bg-white rounded-lg shadow p-3 mb-3 space-y-2">
          <select
            value={behaviorForm.type}
            onChange={(e) => setBehaviorForm((f) => ({ ...f, type: e.target.value }))}
            className="border rounded px-2 py-1 text-xs w-full"
          >
            <option value="POSITIVE">Positive</option>
            <option value="NEGATIVE">Negative / Incident</option>
          </select>
          <input
            required
            placeholder="Description"
            value={behaviorForm.description}
            onChange={(e) => setBehaviorForm((f) => ({ ...f, description: e.target.value }))}
            className="border rounded px-2 py-1 text-xs w-full"
          />
          <button className="bg-blue-600 text-white rounded px-3 py-1 text-xs">Add Record</button>
        </form>
        <div className="space-y-2">
          {behaviorRecords.map((b) => (
            <div key={b.id} className="bg-white rounded shadow p-3 text-xs">
              <span className={b.type === "POSITIVE" ? "text-green-700" : "text-red-600"}>
                {b.type}
              </span>
              <p className="text-gray-600">{b.description}</p>
              <p className="text-gray-400">{new Date(b.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
          {behaviorRecords.length === 0 && <p className="text-gray-400 text-xs">Koi record nahi</p>}
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Achievements</h2>
        <form onSubmit={submitAchievement} className="bg-white rounded-lg shadow p-3 mb-3 space-y-2">
          <input
            required
            placeholder="Achievement title"
            value={achievementForm.title}
            onChange={(e) => setAchievementForm((f) => ({ ...f, title: e.target.value }))}
            className="border rounded px-2 py-1 text-xs w-full"
          />
          <input
            placeholder="Category (Sports, Academics...)"
            value={achievementForm.category}
            onChange={(e) => setAchievementForm((f) => ({ ...f, category: e.target.value }))}
            className="border rounded px-2 py-1 text-xs w-full"
          />
          <button className="bg-blue-600 text-white rounded px-3 py-1 text-xs">Add Achievement</button>
        </form>
        <div className="space-y-2">
          {achievements.map((a) => (
            <div key={a.id} className="bg-white rounded shadow p-3 text-xs">
              <p className="font-medium">{a.title}</p>
              <p className="text-gray-500">{a.category || "-"}</p>
              <p className="text-gray-400">{new Date(a.date).toLocaleDateString()}</p>
            </div>
          ))}
          {achievements.length === 0 && <p className="text-gray-400 text-xs">Koi achievement nahi</p>}
        </div>
      </div>
    </div>
  );
}
