import { SubScore, WordFormat } from "@/types/resume-analyser";

export function RenderCategory({
  title,
  data,
}: {
  title: string;
  data: SubScore;
}) {
  return (
    <div className="mb-4">
      <strong>{title}:</strong> {data.score}/{data.max}
      <div className="ml-4">
        <div>
          <em>Good:</em> {data.good.length ? data.good.join(", ") : "None"}
        </div>
        <div>
          <em>Bad:</em> {data.bad.length ? data.bad.join(", ") : "None"}
        </div>
      </div>
    </div>
  );
}

export function RenderWordFormat({ wf }: { wf: WordFormat }) {
  return (
    <div className="space-y-4">
      <div>
        <strong>Grammatical Errors:</strong>
        <ul className="list-disc list-inside">
          {wf.grammaticalErrors.map((e, i) => (
            <li key={i}>
              <em>{e.original}</em> → {e.correction}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <strong>Verb Suggestions:</strong>
        <ul className="list-disc list-inside">
          {wf.verbSuggestions.map((v, i) => (
            <li key={i}>
              <em>{v.original}</em> → {v.suggestion}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <strong>Quantification Suggestions:</strong>
        <ul className="list-disc list-inside">
          {wf.quantificationSuggestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Generic list renderer
export function renderListOfObjects<T extends Record<string, any>>(
  items: T[],
  formatItem?: (item: T) => string
) {
  if (!items.length) {
    return <li className="italic">None provided.</li>;
  }
  return items.map((item, i) => (
    <li key={i}>
      {formatItem
        ? formatItem(item)
        : Object.entries(item)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" — ")}
    </li>
  ));
}
