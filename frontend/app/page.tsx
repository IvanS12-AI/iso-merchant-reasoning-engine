"use client";

import React, { useState } from "react";
import { MerchantForm } from "../components/MerchantForm";
import { CSVUploader } from "../components/CSVUploader";
import { ReasoningTimeline } from "../components/ReasoningTimeline";
import { AnalysisHistory } from "../components/AnalysisHistory";
import type { MerchantData, ReasoningResult as ReasoningResultType } from "../lib/api";

export default function HomePage() {
  const [result, setResult] = useState<ReasoningResultType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMerchant, setCurrentMerchant] = useState<MerchantData | null>(null);
  const [currentHistoryEntry, setCurrentHistoryEntry] = useState<{
    id: string;
    timestamp: string;
    merchant: MerchantData;
    result: ReasoningResultType;
  } | null>(null);

  const handleCompleted = (merchant: MerchantData, r: ReasoningResultType) => {
    setResult(r);
    setError(null);
    setCurrentMerchant(merchant);
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      merchant,
      result: r
    };
    setCurrentHistoryEntry(entry);
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
              ISO Merchant Reasoning Engine
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Enter merchant KPIs and get a clear 3-step reasoning chain:
              Analysis → Insight → Strategic Recommendation.
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <MerchantForm
              onResult={(r, merchant) => handleCompleted(merchant, r)}
              onLoadingChange={setLoading}
              onErrorChange={setError}
            />
            <CSVUploader
              onResult={(r, merchant) => handleCompleted(merchant, r)}
              onLoadingChange={setLoading}
              onErrorChange={setError}
            />
            {error && (
              <p className="rounded-md border border-rose-500/60 bg-rose-950/60 px-3 py-2 text-sm text-rose-100">
                {error}
              </p>
            )}
          </div>

          <ReasoningTimeline result={result} loading={loading} />
        </div>

        <AnalysisHistory
          currentEntry={currentHistoryEntry}
          onSelect={entry => {
            setResult(entry.result);
            setCurrentMerchant(entry.merchant);
          }}
        />
      </div>
    </main>
  );
}

