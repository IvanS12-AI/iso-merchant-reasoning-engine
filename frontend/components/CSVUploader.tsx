"use client";

import React, { useState } from "react";
import Papa from "papaparse";
import {
  analyzeMerchant,
  type MerchantData,
  type ReasoningResult
} from "../lib/api";

type CSVUploaderProps = {
  onResult: (result: ReasoningResult, merchant: MerchantData) => void;
  onLoadingChange?: (loading: boolean) => void;
  onErrorChange?: (error: string | null) => void;
};

export function CSVUploader({
  onResult,
  onLoadingChange,
  onErrorChange
}: CSVUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    onErrorChange?.(null);
  };

  const handleUpload = async () => {
    if (!file) {
      onErrorChange?.("Please select a CSV file first.");
      return;
    }

    setLoading(true);
    onLoadingChange?.(true);
    onErrorChange?.(null);

    try {
      const text = await file.text();
      const parsed = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true
      });

      if (parsed.errors.length) {
        throw new Error(parsed.errors[0].message);
      }

      const firstRow = parsed.data[0];
      if (!firstRow) {
        throw new Error("CSV appears to be empty.");
      }

      const merchant: MerchantData = {
        monthly_revenue: Number(firstRow.monthly_revenue),
        transactions: Number(firstRow.transactions),
        chargebacks: Number(firstRow.chargebacks),
        avg_ticket: Number(firstRow.avg_ticket)
      };

      const result = await analyzeMerchant(merchant);
      onResult(result, merchant);
    } catch (err) {
      console.error(err);
      onErrorChange?.(
        err instanceof Error
          ? err.message
          : "Unexpected error while processing CSV."
      );
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/40 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold text-slate-100">
            CSV upload (batch KPIs)
          </h3>
          <p className="text-xs text-slate-500">
            Upload a CSV with merchant KPIs. The first row will be analyzed.
          </p>
          <input
            id="csv"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="block w-full text-xs text-slate-200 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-50 hover:file:bg-indigo-500"
          />
          <p className="text-[11px] text-slate-500">
            Expected header:{" "}
            <span className="font-mono">
              monthly_revenue,transactions,chargebacks,avg_ticket
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={handleUpload}
          disabled={loading || !file}
          className="inline-flex items-center justify-center rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-50 shadow-md shadow-slate-950/40 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-900/70"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-200 border-t-transparent" />
              Uploading...
            </span>
          ) : (
            "Upload & Analyze"
          )}
        </button>
      </div>
    </div>
  );
}

