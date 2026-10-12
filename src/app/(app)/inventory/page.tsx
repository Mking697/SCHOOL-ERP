"use client";

import { useEffect, useState } from "react";
import { Boxes } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Table, Thead, Th, Td, Tr, EmptyRow } from "@/components/ui/table";

type Item = {
  id: string;
  name: string;
  category?: string;
  quantity: number;
  unit?: string;
  location?: string;
};

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState({ name: "", category: "", quantity: "0", unit: "", location: "" });
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/inventory").then((r) => r.json()).then(setItems).catch(() => {});
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setForm({ name: "", category: "", quantity: "0", unit: "", location: "" });
    load();
  }

  return (
    <div>
      <PageHeader
        title="Inventory & Assets"
        description="Track school inventory items, quantities and locations."
      />

      <Card className="max-w-xl mb-6">
        <CardBody>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            {error && <p className="text-rose-600 text-sm col-span-2">{error}</p>}
            <div className="col-span-2">
              <Label>Item name</Label>
              <Input
                required
                placeholder="Item name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                placeholder="Category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                placeholder="Quantity"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              />
            </div>
            <div>
              <Label>Unit</Label>
              <Input
                placeholder="Unit (pcs, kg...)"
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                placeholder="Location"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <Button type="submit">
                <Boxes className="h-4 w-4" /> Add Item
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card className="max-w-2xl overflow-hidden">
        <Table>
          <Thead>
            <tr>
              <Th>Item</Th>
              <Th>Category</Th>
              <Th>Quantity</Th>
              <Th>Location</Th>
            </tr>
          </Thead>
          <tbody>
            {items.map((i) => (
              <Tr key={i.id}>
                <Td>{i.name}</Td>
                <Td>{i.category || "-"}</Td>
                <Td>
                  {i.quantity} {i.unit || ""}
                </Td>
                <Td>{i.location || "-"}</Td>
              </Tr>
            ))}
            {items.length === 0 && <EmptyRow colSpan={4}>Koi item nahi hai</EmptyRow>}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
