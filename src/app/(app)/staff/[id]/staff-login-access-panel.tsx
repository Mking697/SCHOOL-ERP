"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { KeyRound, Smartphone } from "lucide-react";

export default function StaffLoginAccessPanel({
  staffId,
  email,
  hasLoginAccess,
  role,
}: {
  staffId: string;
  email: string | null;
  hasLoginAccess: boolean;
  role: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState(role ?? "TEACHER");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSet(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/staff/${staffId}/login-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, role: selectedRole }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error);
        return;
      }
      setSuccess(true);
      setPassword("");
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl mt-4">
      <CardHeader>
        <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-indigo-500" />
          Staff &amp; Admin App Login
        </p>
        <Badge tone={hasLoginAccess ? "green" : "slate"}>
          {hasLoginAccess ? "Access Active" : "Not Activated"}
        </Badge>
      </CardHeader>
      <CardBody>
        {success && (
          <p className="text-emerald-700 text-sm mb-3">Login password set ho gaya.</p>
        )}
        {!email && (
          <p className="text-rose-600 text-sm mb-3">
            Login access ke liye pehle upar staff ka email add karo.
          </p>
        )}
        <p className="text-xs text-slate-500 mb-3">
          Login URL: <span className="font-mono">/login</span>
          {email && (
            <>
              {" "}&middot; Email: <span className="font-mono">{email}</span>
            </>
          )}
        </p>
        <p className="text-xs text-slate-500 mb-3">
          Staff apne phone ke browser me yahi URL khol ke, ye email/password se login kar sakta hai, aur
          &quot;Add to Home Screen&quot; karke isko app jaisa use kar sakta hai (koi separate download/app
          store nahi chahiye).
        </p>
        {!open ? (
          <Button variant="secondary" size="sm" onClick={() => setOpen(true)} disabled={!email}>
            <KeyRound className="w-3.5 h-3.5" />
            {hasLoginAccess ? "Reset Password" : "Activate Login Access"}
          </Button>
        ) : (
          <form onSubmit={handleSet} className="flex items-end gap-2 flex-wrap">
            {!hasLoginAccess && (
              <div>
                <Label>Role</Label>
                <Select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-40"
                >
                  <option value="TEACHER">Teacher</option>
                  <option value="ACCOUNTANT">Accountant</option>
                  <option value="HR">HR</option>
                  <option value="SCHOOL_ADMIN">School Admin</option>
                  <option value="PRINCIPAL">Principal</option>
                </Select>
              </div>
            )}
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
