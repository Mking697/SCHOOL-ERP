import { Suspense } from "react";
import ExamDetailClient from "./exam-detail-client";

export default function ExamDetailPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <ExamDetailClient />
    </Suspense>
  );
}
