import { Breakdown, SubScore } from "@/types/resume-analyser";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";

// 1) create a mapping from your JSON keys → 2‑word labels
const LABELS: Record<keyof Breakdown, string> = {
  keywords: "Skills",
  formatting: "Layout",
  length: "Length",
  readability: "Grammar",
  impact: "Impact",
};

export default function ShortBreakdown({
  breakdown,
}: {
  breakdown: Breakdown;
}) {
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
      {(Object.entries(breakdown) as [keyof Breakdown, SubScore][]).map(
        ([key, sub]) => {
          // 2) decide pass/fail however you like; here's a simple full‑marks check:
          const passed = sub.score >= sub.max;

          // choose an icon
          const Icon = passed ? CheckCircleIcon : ExclamationCircleIcon;
          const colorClass = passed ? "text-green-500" : "text-red-500";

          return (
            <li key={key} className="flex items-center space-x-2">
              <Icon className={`w-5 h-5 ${colorClass}`} />
              <span className="font-medium">{LABELS[key]}</span>
            </li>
          );
        }
      )}
    </ul>
  );
}
