"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [json, setJson] = useState<string | null>(null);

  /* grab result from sessionStorage (set by upload page) */
  useEffect(() => {
    const stored = sessionStorage.getItem(`result-${id}`);
    if (stored) setJson(JSON.stringify(JSON.parse(stored), null, 2));
    else
      fetch(`/api/process-document?id=${id}`) // ← fallback
        .then((r) => r.body?.getReader().read()) // grab first SSE chunk
        .then((readResult) => {
          if (!readResult || !readResult.value)
            return router.replace("/resume-analyser");
          const { result } = JSON.parse(
            new TextDecoder().decode(readResult.value).split("data: ")[1]
          );
          setJson(JSON.stringify(result ?? { error: "No data" }, null, 2));
        });
  }, [id, router]);

  if (!json) return null; // shouldn't flash—redirects if missing

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
        onClick={() => router.push("/resume-analyser")}
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  );
}
