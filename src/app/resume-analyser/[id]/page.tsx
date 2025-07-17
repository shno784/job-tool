// pages/resume-analyser/[id].tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopRow } from "@/components/resume-analyser/TopRow";
import { BreakdownGrid } from "@/components/resume-analyser/BreakdownGrid";
import {
  RenderWordFormat,
  RenderCategory,
  renderListOfObjects,
} from "@/components/resume-analyser/RenderFormats";
import ShortBreakdown from "@/components/resume-analyser/ShortBreakdown";
import {
  Analysis,
  EducationEntry,
  ExperienceEntry,
} from "@/types/resume-analyser";

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`result-${id}`);
    if (!stored) return void router.replace("/resume-analyser");
    try {
      const { parts } = JSON.parse(stored) as { parts: { text: string }[] };
      setAnalysis(JSON.parse(parts[0].text));
    } catch {
      router.replace("/resume-analyser");
    }
  }, [id, router]);

  if (!analysis) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8 px-4">
      <h1 className="text-3xl font-bold text-center">Analysis Complete</h1>

      <TopRow analysis={analysis} />

      <Separator />

      <BreakdownGrid breakdown={analysis.breakdown} />

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Layout Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1">
            {analysis.layoutFormat.split("\n").map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Word Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <RenderWordFormat wf={analysis.wordFormat} />
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside">
            {analysis.skills.length ? (
              analysis.skills.map((s, i) => <li key={i}>{s}</li>)
            ) : (
              <li className="italic text-gray-500">None provided.</li>
            )}
          </ul>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Education</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside">
            {renderListOfObjects<EducationEntry>(analysis.education, (e) =>
              e.degree
                ? `${e.degree}, ${e.university} (${e.graduationDate}) – ${e.notes}`
                : `${e.certificate} (${e.year})`
            )}
          </ul>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Experience</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside">
            {renderListOfObjects<ExperienceEntry>(
              analysis.experience,
              (exp) =>
                `${exp.title} at ${exp.company} (${exp.startDate} – ${
                  exp.endDate
                }) • ${exp.responsibilities.join(", ")}`
            )}
          </ul>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Heading Format</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 pl-4">
            <div>
              <strong>Suggested Changes:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                {Object.entries(analysis.headingFormat.suggestedChanges).map(
                  ([oldH, newH], i) => (
                    <li key={i}>
                      {oldH} → {newH}
                    </li>
                  )
                )}
              </ul>
            </div>
            <div>
              <strong>Missing Headings:</strong>
              <ul className="list-disc list-inside mt-1">
                {analysis.headingFormat.missingHeadings.length ? (
                  analysis.headingFormat.missingHeadings.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))
                ) : (
                  <li className="italic text-gray-500">None</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <button
          onClick={() => router.push("/upload")}
          className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
