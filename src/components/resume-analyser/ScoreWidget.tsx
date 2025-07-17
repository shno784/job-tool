"use client";

import { useEffect, useState } from "react";

interface ScoreCircleProps {
  score: number; // 0–100
  size?: number; // px
  strokeWidth?: number; // px
  duration?: number; // ms
}

export default function ScoreCircle({
  score,
  size = 144,
  strokeWidth = 12,
  duration = 800,
}: ScoreCircleProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const id = window.setTimeout(() => setProgress(score), 50);
    return () => window.clearTimeout(id);
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      style={{ display: "block", margin: "0 auto" }}
    >
      {/* White background so it “starts blank” */}
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" />
      {/* Grey track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e0e0e0"
        strokeWidth={strokeWidth}
      />
      {/* Animated colored arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e76c61"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        style={{
          transition: `stroke-dashoffset ${duration}ms ease-out`,
          strokeDashoffset: offset,
          transform: "rotate(-90deg)",
          transformOrigin: "50% 50%",
        }}
      />
      {/* Center text */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={size * 0.22}
        fill="currentColor"
        fontWeight="bold"
      >
        {progress}%
      </text>
    </svg>
  );
}
