"use client";

import { useEffect, useState } from "react";

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
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold mb-6">Library Management</h1>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="grid grid-cols-2 gap-6 max-w-4xl mb-6">
        <form onSubmit={addBook} className="bg-white rounded-lg shadow p-4 space-y-2">
          <h2 className="font-semibold text-sm">Add Book</h2>
          <input
            required
            placeholder="Title"
            value={bookForm.title}
            onChange={(e) => setBookForm((f) => ({ ...f, title: e.target.value }))}
            className="border rounded px-3 py-2 text-sm w-full"
          />
          <input
            placeholder="Author"
            value={bookForm.author}
            onChange={(e) => setBookForm((f) => ({ ...f, author: e.target.value }))}
            className="border rounded px-3 py-2 text-sm w-full"
          />
          <input
            type="number"
            placeholder="Total Copies"
            value={bookForm.totalCopies}
            onChange={(e) => setBookForm((f) => ({ ...f, totalCopies: e.target.value }))}
            className="border rounded px-3 py-2 text-sm w-full"
          />
          <button className="bg-blue-600 text-white rounded px-3 py-2 text-sm">Add Book</button>
        </form>

        <form onSubmit={issueBook} className="bg-white rounded-lg shadow p-4 space-y-2">
          <h2 className="font-semibold text-sm">Issue Book</h2>
          <select
            required
            value={issueForm.bookId}
            onChange={(e) => setIssueForm((f) => ({ ...f, bookId: e.target.value }))}
            className="border rounded px-3 py-2 text-sm w-full"
          >
            <option value="">Select Book</option>
            {books.map((b) => (
              <option key={b.id} value={b.id} disabled={b.availableCopies < 1}>
                {b.title} ({b.availableCopies}/{b.totalCopies} available)
              </option>
            ))}
          </select>
          <select
            required
            value={issueForm.studentId}
            onChange={(e) => setIssueForm((f) => ({ ...f, studentId: e.target.value }))}
            className="border rounded px-3 py-2 text-sm w-full"
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName} ({s.admissionNo})
              </option>
            ))}
          </select>
          <input
            required
            type="date"
            value={issueForm.dueDate}
            onChange={(e) => setIssueForm((f) => ({ ...f, dueDate: e.target.value }))}
            className="border rounded px-3 py-2 text-sm w-full"
          />
          <button className="bg-blue-600 text-white rounded px-3 py-2 text-sm">Issue</button>
        </form>
      </div>

      <h2 className="font-semibold mb-2">Currently Issued</h2>
      <div className="bg-white rounded-lg shadow max-w-3xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Book</th>
              <th className="p-3">Student</th>
              <th className="p-3">Due Date</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {issues.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="p-3">{i.book.title}</td>
                <td className="p-3">
                  {i.student.firstName} {i.student.lastName}
                </td>
                <td className="p-3">{new Date(i.dueDate).toLocaleDateString()}</td>
                <td className="p-3">
                  <button
                    onClick={() => returnBook(i.id)}
                    className="bg-gray-700 text-white rounded px-2 py-1 text-xs"
                  >
                    Mark Returned
                  </button>
                </td>
              </tr>
            ))}
            {issues.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-400">
                  Koi book issue nahi hai
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
