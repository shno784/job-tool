// pages/dashboard.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ScoreCircle from "@/components/resume-analyser/ScoreWidget";
import ShortBreakdown from "@/components/resume-analyser/ShortBreakdown";
import { Analysis } from "@/types/resume-analyser";

export default function DashboardPage() {
  const [lastAnalysis, setLastAnalysis] = useState<Analysis | null>(null);
  const [jobsApplied, setJobsApplied] = useState(42);
  const [coverLetters, setCoverLetters] = useState(17);

  useEffect(() => {
    fetch("/api/last-analysis")
      .then((r) => r.json())
      .then(setLastAnalysis);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Resumes Analyzed</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold">
                {lastAnalysis ? lastAnalysis.score : "–"}
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Jobs Applied</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold">{jobsApplied}</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cover Letters Generated</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold">{coverLetters}</span>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/resume-analyser">
              <Card className="hover:bg-gray-800 transition">
                <CardContent>
                  <h3 className="font-medium">Analyze Resume</h3>
                  <p className="text-sm text-gray-400">
                    Upload & score your CV
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/job-matcher">
              <Card className="hover:bg-gray-800 transition">
                <CardContent>
                  <h3 className="font-medium">Match Job</h3>
                  <p className="text-sm text-gray-400">
                    Find best fits for your resume
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/cover-letter">
              <Card className="hover:bg-gray-800 transition">
                <CardContent>
                  <h3 className="font-medium">Generate Cover Letter</h3>
                  <p className="text-sm text-gray-400">
                    Auto‑create a tailored cover letter
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        <Separator />

        {/* Recent Analysis Preview */}
        {lastAnalysis && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Your Last Resume Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="md:col-span-1">
                <ScoreCircle
                  score={lastAnalysis.score}
                  size={120}
                  strokeWidth={10}
                />
              </div>
              <div className="md:col-span-2 space-y-4">
                <ShortBreakdown breakdown={lastAnalysis.breakdown} />
                <Link href="/resume-analyser">
                  <Button variant="outline">View Full Report</Button>
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
