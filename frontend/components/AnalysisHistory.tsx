"use client";

import React, { useEffect, useState } from "react";
import type { MerchantData, ReasoningResult } from "../lib/api";

type HistoryEntry = {
  id: string;
  timestamp: string;
  merchant: MerchantData;
  result: ReasoningResult;
};

type AnalysisHistoryProps = {
  currentEntry: HistoryEntry | null;
  onSelect: (entry: HistoryEntry) => void;
};

const STORAGE_KEY = "iso-reasoning-history";

export function AnalysisHistory({
  currentEntry,
  onSelect
}: AnalysisHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as HistoryEntry[];
      setHistory(parsed);
    } catch {
      // ignore malformed storage
    }
  }, []);

  useEffect(() => {
    if (!currentEntry) return;

    setHistory(prev => {
      const next = [currentEntry, ...prev].slice(0, 20);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, [currentEntry]);

  return (
    <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/40 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
            Analysis history
          </h2>
          <p className="text-xs text-slate-500">
            Revisit prior runs and reload their full reasoning.
          </p>
        </div>
      </div>
      {history.length === 0 ? (
        <p className="text-xs text-slate-500">
          No analyses yet. Run your first merchant through the engine to build
          a history.
        </p>
      ) : (
        <ul className="divide-y divide-slate-800 text-xs">
          {history.map(entry => (
            <li
              key={entry.id}
              className="flex cursor-pointer items-center justify-between gap-3 py-2 transition hover:bg-slate-900/80"
              onClick={() => onSelect(entry)}
            >
              <div>
                <p className="font-medium text-slate-100">
                  {new Date(entry.timestamp).toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500">
                  Revenue:{" "}
                  <span className="font-mono text-slate-200">
                    {entry.merchant.monthly_revenue.toLocaleString()}
                  </span>{" "}
                  · Txns:{" "}
                  <span className="font-mono text-slate-200">
                    {entry.merchant.transactions.toLocaleString()}
                  </span>
                </p>
              </div>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
                View
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

