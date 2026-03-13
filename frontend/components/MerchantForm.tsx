"use client";

import React, { useState } from "react";
import { analyzeMerchant, type MerchantData, type ReasoningResult } from "../lib/api";

type MerchantFormProps = {
  onResult: (result: ReasoningResult, merchant: MerchantData) => void;
  onLoadingChange?: (loading: boolean) => void;
  onErrorChange?: (error: string | null) => void;
};

export function MerchantForm({
  onResult,
  onLoadingChange,
  onErrorChange
}: MerchantFormProps) {
  const [form, setForm] = useState<MerchantData>({
    monthly_revenue: 120000,
    transactions: 850,
    chargebacks: 5,
    avg_ticket: 140
  });
  const [localLoading, setLocalLoading] = useState(false);

  const updateField = <K extends keyof MerchantData>(
    key: K,
    value: string
  ) => {
    const numeric = Number(value);
    setForm(prev => ({
      ...prev,
      [key]: isNaN(numeric) ? ("" as unknown as number) : numeric
    }));
  };

  const runAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    onErrorChange?.(null);
    onLoadingChange?.(true);
    setLocalLoading(true);

    try {
      const result = await analyzeMerchant(form);
      onResult(result, form);
    } catch (err) {
      console.error(err);
      onErrorChange?.(
        err instanceof Error
          ? err.message
          : "Unexpected error while running analysis."
      );
    } finally {
      setLocalLoading(false);
      onLoadingChange?.(false);
    }
  };

  const isLoading = localLoading;

  return (
    <form
      onSubmit={runAnalysis}
      className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/40 backdrop-blur"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="monthly_revenue"
            className="block text-sm font-medium text-slate-200"
          >
            Monthly revenue
          </label>
          <input
            id="monthly_revenue"
            type="number"
            inputMode="decimal"
            value={form.monthly_revenue}
            onChange={e => updateField("monthly_revenue", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <p className="text-xs text-slate-500">
            Total processed volume for the last full month.
          </p>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="transactions"
            className="block text-sm font-medium text-slate-200"
          >
            Transactions
          </label>
          <input
            id="transactions"
            type="number"
            inputMode="numeric"
            value={form.transactions}
            onChange={e => updateField("transactions", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <p className="text-xs text-slate-500">
            Number of transactions in the same period.
          </p>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="chargebacks"
            className="block text-sm font-medium text-slate-200"
          >
            Chargebacks
          </label>
          <input
            id="chargebacks"
            type="number"
            inputMode="numeric"
            value={form.chargebacks}
            onChange={e => updateField("chargebacks", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <p className="text-xs text-slate-500">
            Count of chargebacks or disputes in the period.
          </p>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="avg_ticket"
            className="block text-sm font-medium text-slate-200"
          >
            Average ticket size
          </label>
          <input
            id="avg_ticket"
            type="number"
            inputMode="decimal"
            value={form.avg_ticket}
            onChange={e => updateField("avg_ticket", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <p className="text-xs text-slate-500">
            Average transaction size for the period.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-500">
          Enter key merchant KPIs and run the 3-step reasoning engine.
        </p>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-slate-50 shadow-md shadow-indigo-900/40 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-700"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-transparent" />
              Analyzing...
            </span>
          ) : (
            "Run Analysis"
          )}
        </button>
      </div>
    </form>
  );
}

