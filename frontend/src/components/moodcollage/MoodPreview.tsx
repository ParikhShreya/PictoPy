import React from "react";
import type { AnalyzeOutput } from "./MoodEngine";

export default function MoodPreview({ moodData }: { moodData: AnalyzeOutput | null }) {
  if (!moodData) return null;

  return (
    <div className="p-3 rounded bg-gray-100 text-sm">
      {moodData.results.map((r) => (
        <div key={r.src} className="mb-1">
          <b>{r.mood}</b> — score {r.score} — {r.src.slice(0, 40)}…
        </div>
      ))}
    </div>
  );
}
