"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea, Label } from "@/components/ui/input";

export default function ActivateLicenseForm() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey: key }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error);
        return;
      }
      setKey("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-md">
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-rose-600 text-sm">{error}</p>}
          <div>
            <Label>License Key</Label>
            <Textarea
              required
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Paste the license key provided by Essor Automations"
              className="text-xs font-mono"
              rows={3}
            />
          </div>
          <Button disabled={loading} type="submit">
            <BadgeCheck className="h-4 w-4" />
            {loading ? "Activating..." : "Activate License"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
