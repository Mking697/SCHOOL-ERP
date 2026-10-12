"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-blue-600 text-white rounded px-4 py-2 text-sm"
    >
      Print ID Card
    </button>
  );
}
