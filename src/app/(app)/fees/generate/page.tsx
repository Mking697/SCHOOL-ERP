"use client";

import { useEffect, useState } from "react";
import { Wand2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/input";

type ClassLevel = { id: string; name: string; sections: { id: string; name: string }[] };

export default function GenerateInvoicesPage() {
  const [classes, setClasses] = useState<ClassLevel[]>([]);
  const [sectionId, setSectionId] = useState("");
  const [title, setTitle] = useState("Term 1 Fee");
  const [dueDate, setDueDate] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/classes").then((r) => r.json()).then(setClasses).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "bulk", sectionId, title, dueDate }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setMessage(`${data.count} invoices generate ho gaye.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="Generate Fee Invoices" description="Bulk-create invoices for every active student in a section" />

      <Card className="max-w-md">
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900">Bulk Invoice Generation</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-rose-600 text-sm">{error}</p>}
            {message && <p className="text-emerald-700 text-sm">{message}</p>}
            <div>
              <Label>Class / Section</Label>
              <Select required value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
                <option value="">Select</option>
                {classes.map((c) =>
                  c.sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {c.name} - {s.name}
                    </option>
                  ))
                )}
              </Select>
            </div>
            <div>
              <Label>Invoice Title</Label>
              <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input required type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              <Wand2 className="h-4 w-4" />
              {loading ? "Generating..." : "Generate Invoices for Section"}
            </Button>
            <p className="text-xs text-slate-500">
              Section ke us class ke fee structure (Fee Structure Setup page) ke hisaab se
              har active student ke liye invoice ban jayega.
            </p>
          </form>
        </CardBody>
      </Card>
    </>
  );
}
