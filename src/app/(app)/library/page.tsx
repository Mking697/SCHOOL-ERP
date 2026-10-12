"use client";

import { useEffect, useState } from "react";
import { Library } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/input";
import { Table, Thead, Th, Td, Tr, EmptyRow } from "@/components/ui/table";

type Book = {
  id: string;
  title: string;
  author?: string;
  totalCopies: number;
  availableCopies: number;
};
type Student = { id: string; firstName: string; lastName: string; admissionNo: string };
type Issue = {
  id: string;
  book: Book;
  student: Student;
  dueDate: string;
  status: string;
};

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [bookForm, setBookForm] = useState({ title: "", author: "", totalCopies: "1" });
  const [issueForm, setIssueForm] = useState({ bookId: "", studentId: "", dueDate: "" });
  const [error, setError] = useState<string | null>(null);

  function loadAll() {
    fetch("/api/books").then((r) => r.json()).then(setBooks).catch(() => {});
    fetch("/api/students").then((r) => r.json()).then(setStudents).catch(() => {});
    fetch("/api/book-issues?status=ISSUED").then((r) => r.json()).then(setIssues).catch(() => {});
  }

  useEffect(loadAll, []);

  async function addBook(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookForm),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setBookForm({ title: "", author: "", totalCopies: "1" });
    loadAll();
  }

  async function issueBook(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/book-issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(issueForm),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setIssueForm({ bookId: "", studentId: "", dueDate: "" });
    loadAll();
  }

  async function returnBook(id: string) {
    await fetch(`/api/book-issues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "return" }),
    });
    loadAll();
  }

  return (
    <div>
      <PageHeader
        title="Library Management"
        description="Manage books, issues and returns."
      />
      {error && <p className="text-rose-600 text-sm mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-sm text-slate-900">Add Book</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={addBook} className="space-y-3">
              <div>
                <Label>Title</Label>
                <Input
                  required
                  placeholder="Title"
                  value={bookForm.title}
                  onChange={(e) => setBookForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <Label>Author</Label>
                <Input
                  placeholder="Author"
                  value={bookForm.author}
                  onChange={(e) => setBookForm((f) => ({ ...f, author: e.target.value }))}
                />
              </div>
              <div>
                <Label>Total Copies</Label>
                <Input
                  type="number"
                  placeholder="Total Copies"
                  value={bookForm.totalCopies}
                  onChange={(e) => setBookForm((f) => ({ ...f, totalCopies: e.target.value }))}
                />
              </div>
              <Button type="submit">
                <Library className="h-4 w-4" /> Add Book
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-sm text-slate-900">Issue Book</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={issueBook} className="space-y-3">
              <div>
                <Label>Book</Label>
                <Select
                  required
                  value={issueForm.bookId}
                  onChange={(e) => setIssueForm((f) => ({ ...f, bookId: e.target.value }))}
                >
                  <option value="">Select Book</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id} disabled={b.availableCopies < 1}>
                      {b.title} ({b.availableCopies}/{b.totalCopies} available)
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Student</Label>
                <Select
                  required
                  value={issueForm.studentId}
                  onChange={(e) => setIssueForm((f) => ({ ...f, studentId: e.target.value }))}
                >
                  <option value="">Select Student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.admissionNo})
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  required
                  type="date"
                  value={issueForm.dueDate}
                  onChange={(e) => setIssueForm((f) => ({ ...f, dueDate: e.target.value }))}
                />
              </div>
              <Button type="submit">Issue</Button>
            </form>
          </CardBody>
        </Card>
      </div>

      <h2 className="font-semibold text-sm text-slate-900 mb-2">Currently Issued</h2>
      <Card className="max-w-3xl overflow-hidden">
        <Table>
          <Thead>
            <tr>
              <Th>Book</Th>
              <Th>Student</Th>
              <Th>Due Date</Th>
              <Th></Th>
            </tr>
          </Thead>
          <tbody>
            {issues.map((i) => (
              <Tr key={i.id}>
                <Td>{i.book.title}</Td>
                <Td>
                  {i.student.firstName} {i.student.lastName}
                </Td>
                <Td>{new Date(i.dueDate).toLocaleDateString()}</Td>
                <Td>
                  <Button size="sm" variant="secondary" onClick={() => returnBook(i.id)}>
                    Mark Returned
                  </Button>
                </Td>
              </Tr>
            ))}
            {issues.length === 0 && <EmptyRow colSpan={4}>Koi book issue nahi hai</EmptyRow>}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
