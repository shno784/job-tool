// components/resume-analyser/BreakdownGrid.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Analysis } from "@/types/resume-analyser";

interface Props {
  breakdown: Analysis["breakdown"];
}

export function BreakdownGrid({ breakdown }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(breakdown).map(([key, sub]) => {
            const pass = sub.score / sub.max >= 0.8;
            return (
              <div
                key={key}
                className="p-4  rounded shadow flex flex-col items-center text-center"
              >
                <span className="font-medium capitalize">{key}</span>
                <span className="mt-1 text-2xl font-bold">
                  {sub.score}/{sub.max}
                </span>
                <Badge
                  variant={pass ? "default" : "destructive"}
                  className="mt-2"
                >
                  {pass ? "Good" : "Fix"}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
