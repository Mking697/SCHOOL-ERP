"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/input";
import { Badge, statusTone } from "@/components/ui/badge";

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      <div>
        <h2 className="font-semibold text-sm text-slate-900 mb-2">Leave Requests</h2>
        <Card className="mb-3">
          <CardBody>
            <form onSubmit={submitLeave} className="space-y-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label>From</Label>
                  <Input
                    required
                    type="date"
                    value={leaveForm.fromDate}
                    onChange={(e) => setLeaveForm((f) => ({ ...f, fromDate: e.target.value }))}
                  />
                </div>
                <div className="flex-1">
                  <Label>To</Label>
                  <Input
                    required
                    type="date"
                    value={leaveForm.toDate}
                    onChange={(e) => setLeaveForm((f) => ({ ...f, toDate: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label>Reason</Label>
                <Input
                  required
                  placeholder="Reason"
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm((f) => ({ ...f, reason: e.target.value }))}
                />
              </div>
              <Button type="submit" size="sm">Apply Leave</Button>
            </form>
          </CardBody>
        </Card>
        <div className="space-y-2">
          {leaveRequests.map((l) => (
            <Card key={l.id}>
              <CardBody className="p-3 text-xs">
                <p>
                  {new Date(l.fromDate).toLocaleDateString()} -{" "}
                  {new Date(l.toDate).toLocaleDateString()}
                </p>
                <p className="text-slate-600">{l.reason}</p>
                <div className="flex items-center justify-between mt-1">
                  <Badge tone={statusTone(l.status)}>{l.status}</Badge>
                  {l.status === "PENDING" && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="success" onClick={() => decideLeave(l.id, "APPROVED")}>
                        Approve
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => decideLeave(l.id, "REJECTED")}>
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
          {leaveRequests.length === 0 && (
            <p className="text-slate-400 text-xs">Koi leave request nahi</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-sm text-slate-900 mb-2">Work / Duty Assignments</h2>
        <Card className="mb-3">
          <CardBody>
            <form onSubmit={submitWork} className="space-y-2">
              <div>
                <Label>Task title</Label>
                <Input
                  required
                  placeholder="Task title"
                  value={workForm.title}
                  onChange={(e) => setWorkForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <Label>Due date</Label>
                <Input
                  type="date"
                  value={workForm.dueDate}
                  onChange={(e) => setWorkForm((f) => ({ ...f, dueDate: e.target.value }))}
                />
              </div>
              <Button type="submit" size="sm">Assign Task</Button>
            </form>
          </CardBody>
        </Card>
        <div className="space-y-2">
          {workAssignments.map((w) => (
            <Card key={w.id}>
              <CardBody className="p-3 text-xs">
                <p className="font-medium text-slate-900">{w.title}</p>
                {w.dueDate && <p className="text-slate-600">Due: {new Date(w.dueDate).toLocaleDateString()}</p>}
                <Select
                  value={w.status}
                  onChange={(e) => setWorkStatus(w.id, e.target.value)}
                  className="mt-1"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="DONE">DONE</option>
                </Select>
              </CardBody>
            </Card>
          ))}
          {workAssignments.length === 0 && (
            <p className="text-slate-400 text-xs">Koi task assign nahi hua</p>
          )}
        </div>
      </div>
    </div>
  );
}
