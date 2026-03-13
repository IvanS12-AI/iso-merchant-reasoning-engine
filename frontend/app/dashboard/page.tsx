"use client";

import React, { useState } from "react";

type ReasoningResult = {
  analysis: string;
  insight: string;
  recommendation: string;
};

type ApiResponse = {
  result: ReasoningResult;
  session_id?: string | null;
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<"csv" | "json" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReasoningResult | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setResult(null);
    setError(null);

    if (!selected) {
      setFormat(null);
      return;
    }

    // Simple format inference from file extension and MIME type.
    const name = selected.name.toLowerCase();
    if (name.endsWith(".csv") || selected.type === "text/csv") {
      setFormat("csv");
    } else if (
      name.endsWith(".json") ||
      selected.type === "application/json"
    ) {
      setFormat("json");
    } else {
      setFormat(null);
    }
  };

  const runAnalysis = async () => {
    if (!file) {
      setError("Please upload a CSV or JSON file first.");
      return;
    }

    if (!format) {
      setError("Unsupported file type. Use CSV or JSON.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const text = await file.text();

      const response = await fetch(`${BACKEND_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          format,
          data: text
        })
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(
          `Backend returned ${response.status}. Details: ${body}`
        );
      }

      const json = (await response.json()) as ApiResponse;
      setResult(json.result);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unexpected error while running analysis."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
              ISO Merchant Reasoning Engine
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Upload merchant data and get a clear 3-step reasoning chain:
              Analysis → Insight → Strategic Recommendation.
            </p>
          </div>
        </header>

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/40 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <label
                htmlFor="file"
                className="block text-sm font-medium text-slate-200"
              >
                Merchant dataset (CSV or JSON)
              </label>
              <input
                id="file"
                type="file"
                accept=".csv, text/csv, .json, application/json"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-200 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-50 hover:file:bg-indigo-500"
              />
              <p className="text-xs text-slate-500">
                The file is processed locally in your browser and sent as plain
                text to the backend for analysis.
              </p>
              {file && (
                <p className="text-xs text-slate-400">
                  Selected:{" "}
                  <span className="font-medium text-slate-100">
                    {file.name}
                  </span>{" "}
                  {format && (
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
                      {format}
                    </span>
                  )}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={runAnalysis}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-slate-50 shadow-md shadow-indigo-900/40 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-transparent" />
                  Running analysis…
                </span>
              ) : (
                "Run analysis"
              )}
            </button>
          </div>

          {error && (
            <p className="mt-4 rounded-md border border-rose-500/60 bg-rose-950/60 px-3 py-2 text-sm text-rose-100">
              {error}
            </p>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-md shadow-slate-950/40">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
              Step 1 — Analysis
            </h2>
            <p className="mb-2 text-xs text-slate-500">
              Quantitative view of merchant performance and KPIs.
            </p>
            <div className="mt-2 flex-1 rounded-lg bg-slate-950/60 p-3 text-sm text-slate-200">
              {loading && !result && (
                <p className="text-slate-500">Analyzing merchant data…</p>
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
              Step 2 — Insight
            </h2>
            <p className="mb-2 text-xs text-slate-500">
              Business interpretation of what the patterns really mean.
            </p>
            <div className="mt-2 flex-1 rounded-lg bg-slate-950/60 p-3 text-sm text-slate-200">
              {loading && !result && (
                <p className="text-slate-500">Deriving portfolio insights…</p>
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
              Step 3 — Recommendation
            </h2>
            <p className="mb-2 text-xs text-slate-500">
              Concrete actions the ISO can take to improve merchant outcomes.
            </p>
            <div className="mt-2 flex-1 rounded-lg bg-slate-950/60 p-3 text-sm text-slate-200">
              {loading && !result && (
                <p className="text-slate-500">
                  Generating strategic recommendations…
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
      </div>
    </main>
  );
}

