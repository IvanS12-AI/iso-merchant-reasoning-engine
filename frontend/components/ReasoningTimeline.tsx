import React from "react";
import type { ReasoningResult } from "../lib/api";

type ReasoningTimelineProps = {
  result: ReasoningResult | null;
  loading: boolean;
};

const steps = [
  {
    id: 1,
    title: "Data Analysis",
    description:
      "Quantitative breakdown of merchant performance and key risk indicators.",
    key: "analysis" as const
  },
  {
    id: 2,
    title: "Business Insight",
    description:
      "Interpretation of what the numbers mean for the ISO and portfolio.",
    key: "insight" as const
  },
  {
    id: 3,
    title: "Strategic Recommendation",
    description:
      "Concrete actions the ISO can take to improve outcomes and manage risk.",
    key: "recommendation" as const
  }
];

export function ReasoningTimeline({
  result,
  loading
}: ReasoningTimelineProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/40 backdrop-blur">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-300">
        AI Reasoning Timeline
      </h2>
      <p className="mb-4 text-xs text-slate-500">
        Trace how the AI moves from raw KPIs to insights and recommended
        actions.
      </p>
      <ol className="relative space-y-6 border-l border-slate-800 pl-4">
        {steps.map((step, index) => {
          const active = !!result;
          const content =
            result && (result as any)[step.key]
              ? (result as any)[step.key]
              : null;

          return (
            <li key={step.id} className="relative pl-4">
              <span className="absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-[10px] text-slate-300">
                {step.id}
              </span>
              <div
                className={`group rounded-xl border border-slate-800/70 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-3 shadow-md shadow-slate-950/40 transition hover:border-indigo-500/60 hover:shadow-indigo-900/40 ${
                  active && content ? "animate-in fade-in slide-in-from-left-1" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">
                      {step.title}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {step.description}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                    {index + 1} / 3
                  </span>
                </div>

                <div className="mt-3 rounded-lg bg-slate-950/80 p-3 text-xs text-slate-200">
                  {loading && !result && (
                    <p className="text-slate-500">
                      AI analyzing merchant performance...
                    </p>
                  )}
                  {!loading && !result && (
                    <p className="text-slate-500">
                      Run an analysis to see this step&apos;s reasoning.
                    </p>
                  )}
                  {content && (
                    <p className="whitespace-pre-wrap text-slate-100">
                      {content}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

