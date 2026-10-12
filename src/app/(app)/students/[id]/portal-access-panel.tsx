"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { KeyRound, Smartphone } from "lucide-react";

export default function PortalAccessPanel({
  studentId,
  admissionNo,
  hasPortalAccess,
}: {
  studentId: string;
  admissionNo: string;
  hasPortalAccess: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSet(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/students/${studentId}/portal-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error);
        return;
      }
      setSuccess(true);
      setPassword("");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl mt-4">
      <CardHeader>
        <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-indigo-500" />
          Student / Parent Portal
        </p>
        <Badge tone={hasPortalAccess ? "green" : "slate"}>
          {hasPortalAccess ? "Access Active" : "Not Activated"}
        </Badge>
      </CardHeader>
      <CardBody>
        {success && (
          <p className="text-emerald-700 text-sm mb-3">Portal password set ho gaya.</p>
        )}
        <p className="text-xs text-slate-500 mb-3">
          Login URL: <span className="font-mono">/portal/login</span> &middot; Admission No:{" "}
          <span className="font-mono">{admissionNo}</span>
        </p>
        {!open ? (
          <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
            <KeyRound className="w-3.5 h-3.5" />
            {hasPortalAccess ? "Reset Password" : "Activate Portal Access"}
          </Button>
        ) : (
          <form onSubmit={handleSet} className="flex items-end gap-2 flex-wrap">
            <div>
              <Label>New Password</Label>
              <Input
                type="text"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="min 6 characters"
                className="w-48"
              />
            </div>
            {error && <p className="text-rose-600 text-sm">{error}</p>}
            <Button type="submit" variant="success" size="sm" disabled={loading}>
              Save
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </form>
        )}
      </CardBody>
    </Card>
  );
}
