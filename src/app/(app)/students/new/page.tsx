"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea, Label } from "@/components/ui/input";

type ClassLevel = { id: string; name: string; sections: { id: string; name: string }[] };

export default function NewStudentPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassLevel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    sectionId: "",
    guardianName: "",
    guardianPhone: "",
    address: "",
  });

  useEffect(() => {
    fetch("/api/classes")
      .then((r) => r.json())
      .then(setClasses)
      .catch(() => {});
  }, []);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Admission fail hui");
        return;
      }
      router.push(`/students/${data.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="New Admission" description="Add a new student to the school" />

      <Card className="max-w-2xl">
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-rose-600 text-sm">{error}</p>}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  required
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  required
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                />
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={form.dob}
                  onChange={(e) => update("dob", e.target.value)}
                />
              </div>
              <div>
                <Label>Gender</Label>
                <Select
                  value={form.gender}
                  onChange={(e) => update("gender", e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Class / Section</Label>
                <Select
                  value={form.sectionId}
                  onChange={(e) => update("sectionId", e.target.value)}
                >
                  <option value="">Not assigned</option>
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
                <Label>Guardian Name</Label>
                <Input
                  value={form.guardianName}
                  onChange={(e) => update("guardianName", e.target.value)}
                />
              </div>
              <div>
                <Label>Guardian Phone</Label>
                <Input
                  value={form.guardianPhone}
                  onChange={(e) => update("guardianPhone", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label>Address</Label>
                <Textarea
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Saving..." : "Admit Student"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
