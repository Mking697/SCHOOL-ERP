"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, AlertCircle, Upload, ImageIcon } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function SetupWizardForm() {
  const router = useRouter();
  const [schoolName, setSchoolName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) {
      setError("Logo chhota rakho (under 1.5MB), bade image compress karke try karo");
      return;
    }
    setError(null);
    setLogoUrl(await fileToDataUrl(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (adminPassword !== confirmPassword) {
      setError("Passwords match nahi kar rahe");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolName, logoUrl, adminName, adminEmail, adminPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Setup fail hua");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#312e81,_transparent_55%)]" />
      <div className="relative w-full max-w-lg">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-indigo-600 rounded-2xl p-3 shadow-lg shadow-indigo-900/40 mb-3">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-white">Welcome to School ERP</h1>
          <p className="text-sm text-slate-400">
            One-time setup -- this runs only once for this install
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-7 space-y-5">
          {error && (
            <div className="flex items-start gap-2 bg-rose-50 text-rose-700 text-sm rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              School Details
            </p>
            <Label>School Name</Label>
            <Input
              required
              autoFocus
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="e.g. Green Valley Public School"
            />
            <div className="mt-3">
              <Label>School Logo (optional)</Label>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt="Logo preview" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                <label className="flex-1">
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  <span className="inline-flex items-center gap-1.5 cursor-pointer border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                    <Upload className="w-3.5 h-3.5" />
                    Choose image
                  </span>
                </label>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Shows on the dashboard, fee invoices and report cards.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Admin Account
            </p>
            <div className="space-y-3">
              <div>
                <Label>Admin Name</Label>
                <Input
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. Principal / Administrator"
                />
              </div>
              <div>
                <Label>Admin Email</Label>
                <Input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@yourschool.edu"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    name="adminPassword"
                    required
                    minLength={8}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Setting up..." : "Complete Setup"}
          </Button>
        </form>
      </div>
    </div>
  );
}
