"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/ui/brand-mark";

export default function PortalLoginForm({
  schoolName,
  logoUrl,
}: {
  schoolName: string;
  logoUrl: string | null;
}) {
  const router = useRouter();
  const [admissionNo, setAdmissionNo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/portal/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admissionNo, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login fail hua");
        return;
      }
      router.push("/portal");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-950 relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#064e3b,_transparent_55%)]" />
      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-emerald-600 rounded-2xl p-3 shadow-lg shadow-emerald-900/40 mb-3 w-14 h-14 flex items-center justify-center overflow-hidden">
            <BrandMark logoUrl={logoUrl} schoolName={schoolName} className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-white">{schoolName}</h1>
          <p className="text-sm text-emerald-200">Student &amp; Parent Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-7 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-rose-50 text-rose-700 text-sm rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          <div>
            <Label>Admission No.</Label>
            <Input
              required
              autoFocus
              value={admissionNo}
              onChange={(e) => setAdmissionNo(e.target.value)}
              placeholder="e.g. 2026-0001"
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full !bg-emerald-600 hover:!bg-emerald-700">
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <p className="text-center text-xs text-emerald-300/70 mt-5">
          Login details school office se milenge. &middot;{" "}
          <a href="/apps" className="underline hover:text-emerald-200">
            All Apps &amp; Downloads
          </a>
        </p>
      </div>
    </div>
  );
}
