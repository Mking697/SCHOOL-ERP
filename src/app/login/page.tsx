"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, AlertCircle } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login fail hua");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#312e81,_transparent_55%)]" />
      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-indigo-600 rounded-2xl p-3 shadow-lg shadow-indigo-900/40 mb-3">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-white">School ERP</h1>
          <p className="text-sm text-slate-400">Sign in to your school&apos;s dashboard</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-7 space-y-4"
        >
          {error && (
            <div className="flex items-start gap-2 bg-rose-50 text-rose-700 text-sm rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu"
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
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <p className="text-center text-xs text-slate-500 mt-5">
          Self-hosted on your school&apos;s own server.
        </p>
      </div>
    </div>
  );
}
