"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Leave = { id: string; fromDate: string; toDate: string; reason: string; status: string };
type Work = { id: string; title: string; status: string; dueDate: string | null };

export default function StaffActions({
  staffId,
  leaveRequests,
  workAssignments,
}: {
  staffId: string;
  leaveRequests: Leave[];
  workAssignments: Work[];
}) {
  const router = useRouter();
  const [leaveForm, setLeaveForm] = useState({ fromDate: "", toDate: "", reason: "" });
  const [workForm, setWorkForm] = useState({ title: "", description: "", dueDate: "" });

  async function submitLeave(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/leave-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staffId, ...leaveForm }),
    });
    setLeaveForm({ fromDate: "", toDate: "", reason: "" });
    router.refresh();
  }

  async function decideLeave(id: string, status: string) {
    await fetch(`/api/leave-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  async function submitWork(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/work-assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staffId, ...workForm }),
    });
    setWorkForm({ title: "", description: "", dueDate: "" });
    router.refresh();
  }

  async function setWorkStatus(id: string, status: string) {
    await fetch(`/api/work-assignments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  return (
    <div className="grid grid-cols-2 gap-6 max-w-4xl">
      <div>
        <h2 className="font-semibold mb-2">Leave Requests</h2>
        <form onSubmit={submitLeave} className="bg-white rounded-lg shadow p-3 mb-3 space-y-2">
          <div className="flex gap-2">
            <input
              required
              type="date"
              value={leaveForm.fromDate}
              onChange={(e) => setLeaveForm((f) => ({ ...f, fromDate: e.target.value }))}
              className="border rounded px-2 py-1 text-xs flex-1"
            />
            <input
              required
              type="date"
              value={leaveForm.toDate}
              onChange={(e) => setLeaveForm((f) => ({ ...f, toDate: e.target.value }))}
              className="border rounded px-2 py-1 text-xs flex-1"
            />
          </div>
          <input
            required
            placeholder="Reason"
            value={leaveForm.reason}
            onChange={(e) => setLeaveForm((f) => ({ ...f, reason: e.target.value }))}
            className="border rounded px-2 py-1 text-xs w-full"
          />
          <button className="bg-blue-600 text-white rounded px-3 py-1 text-xs">Apply Leave</button>
        </form>
        <div className="space-y-2">
          {leaveRequests.map((l) => (
            <div key={l.id} className="bg-white rounded shadow p-3 text-xs">
              <p>
                {new Date(l.fromDate).toLocaleDateString()} -{" "}
                {new Date(l.toDate).toLocaleDateString()}
              </p>
              <p className="text-gray-600">{l.reason}</p>
              <div className="flex items-center justify-between mt-1">
                <span
                  className={
                    l.status === "APPROVED"
                      ? "text-green-700"
                      : l.status === "REJECTED"
                      ? "text-red-600"
                      : "text-yellow-700"
                  }
                >
                  {l.status}
                </span>
                {l.status === "PENDING" && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => decideLeave(l.id, "APPROVED")}
                      className="bg-green-600 text-white rounded px-2 py-0.5"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => decideLeave(l.id, "REJECTED")}
                      className="bg-red-600 text-white rounded px-2 py-0.5"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {leaveRequests.length === 0 && (
            <p className="text-gray-400 text-xs">Koi leave request nahi</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Work / Duty Assignments</h2>
        <form onSubmit={submitWork} className="bg-white rounded-lg shadow p-3 mb-3 space-y-2">
          <input
            required
            placeholder="Task title"
            value={workForm.title}
            onChange={(e) => setWorkForm((f) => ({ ...f, title: e.target.value }))}
            className="border rounded px-2 py-1 text-xs w-full"
          />
          <input
            type="date"
            value={workForm.dueDate}
            onChange={(e) => setWorkForm((f) => ({ ...f, dueDate: e.target.value }))}
            className="border rounded px-2 py-1 text-xs w-full"
          />
          <button className="bg-blue-600 text-white rounded px-3 py-1 text-xs">Assign Task</button>
        </form>
        <div className="space-y-2">
          {workAssignments.map((w) => (
            <div key={w.id} className="bg-white rounded shadow p-3 text-xs">
              <p className="font-medium">{w.title}</p>
              {w.dueDate && <p className="text-gray-600">Due: {new Date(w.dueDate).toLocaleDateString()}</p>}
              <select
                value={w.status}
                onChange={(e) => setWorkStatus(w.id, e.target.value)}
                className="border rounded px-2 py-1 text-xs mt-1"
              >
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
            </div>
          ))}
          {workAssignments.length === 0 && (
            <p className="text-gray-400 text-xs">Koi task assign nahi hua</p>
          )}
        </div>
      </div>
    </div>
  );
}
