"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Truck } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DriverLoginForm({ schoolName }: { schoolName: string }) {
  const router = useRouter();
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/driver/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleNumber, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login fail hua");
        return;
      }
      router.push("/driver");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-950 relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#78350f,_transparent_55%)]" />
      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-amber-600 rounded-2xl p-3 shadow-lg shadow-amber-900/40 mb-3 w-14 h-14 flex items-center justify-center">
            <Truck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-white">{schoolName}</h1>
          <p className="text-sm text-amber-200">Driver App &middot; Live GPS</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-7 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-rose-50 text-rose-700 text-sm rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          <div>
            <Label>Vehicle Number</Label>
            <Input
              required
              autoFocus
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              placeholder="e.g. DL01AB1234"
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
          <Button type="submit" disabled={loading} className="w-full !bg-amber-600 hover:!bg-amber-700">
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <p className="text-center text-xs text-amber-300/70 mt-5">
          Login details school transport office se milenge.
        </p>
      </div>
    </div>
  );
}
