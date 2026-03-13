import React from "react";
import type { ReasoningResult as ReasoningResultType } from "../lib/api";

type ReasoningResultProps = {
  result: ReasoningResultType | null;
  loading: boolean;
};

export function ReasoningResult({ result, loading }: ReasoningResultProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-md shadow-slate-950/40">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
          Analysis
        </h2>
        <p className="mb-2 text-xs text-slate-500">
          Quantitative view of merchant performance and KPIs.
        </p>
        <div className="mt-2 flex-1 rounded-lg bg-slate-950/60 p-3 text-sm text-slate-200">
          {loading && !result && (
            <p className="text-slate-500">Analyzing merchant data...</p>
          )}
          {!loading && !result && (
            <p className="text-slate-500">
              Run an analysis to see the detailed data breakdown here.
            </p>
          )}
          {result && (
            <p className="whitespace-pre-wrap text-slate-100">
              {result.analysis}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-md shadow-slate-950/40">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
          Insight
        </h2>
        <p className="mb-2 text-xs text-slate-500">
          Business interpretation of what the patterns really mean.
        </p>
        <div className="mt-2 flex-1 rounded-lg bg-slate-950/60 p-3 text-sm text-slate-200">
          {loading && !result && (
            <p className="text-slate-500">Deriving portfolio insights...</p>
          )}
          {!loading && !result && (
            <p className="text-slate-500">
              Insights derived from the analysis will appear here.
            </p>
          )}
          {result && (
            <p className="whitespace-pre-wrap text-slate-100">
              {result.insight}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-md shadow-slate-950/40">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
          Recommendation
        </h2>
        <p className="mb-2 text-xs text-slate-500">
          Concrete actions the ISO can take to improve merchant outcomes.
        </p>
        <div className="mt-2 flex-1 rounded-lg bg-slate-950/60 p-3 text-sm text-slate-200">
          {loading && !result && (
            <p className="text-slate-500">
              Generating strategic recommendations...
            </p>
          )}
          {!loading && !result && (
            <p className="text-slate-500">
              Actionable recommendations for the ISO will be listed here.
            </p>
          )}
          {result && (
            <p className="whitespace-pre-wrap text-slate-100">
              {result.recommendation}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

