// src/app/resume-analyser/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [json, setJson] = useState<string | null>(null);

  useEffect(() => {
    // pull from sessionStorage
    const stored = sessionStorage.getItem(`result-${id}`);
    if (stored) {
      setJson(JSON.stringify(JSON.parse(stored), null, 2));
    } else {
      // no result found → go back to upload
      router.replace("/resume-analyser"); // or "/upload"
    }
  }, [id, router]);

  if (!json) return null; // or a loader

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Analysis complete</h1>
      <pre
        className="whitespace-pre-wrap break-words p-4 rounded
                   bg-gray-100 dark:bg-gray-800
                   text-gray-900 dark:text-gray-100"
      >
        {json}
      </pre>

      <button
        onClick={() => router.push("/upload")}
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  );
}
