// components/resume-analyser/TopRow.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ScoreCircle from "./ScoreWidget";
import ShortBreakdown from "./ShortBreakdown";
import { Analysis } from "@/types/resume-analyser";

interface Props {
  analysis: Analysis;
}

export function TopRow({ analysis }: Props) {
  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle className="sr-only">Top Row</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 md:space-x-12">
        <div className="flex-shrink-0">
          <ScoreCircle score={analysis.score} />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-2">Resume Strength</h2>
          <ShortBreakdown breakdown={analysis.breakdown} />
        </div>
      </CardContent>
    </Card>
  );
}
