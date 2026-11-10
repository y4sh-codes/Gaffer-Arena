"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, ArrowLeft, Trophy } from "lucide-react";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Matchday Server Component Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center max-w-lg border border-red-500/30 shadow-glass relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-black uppercase tracking-tight text-white mb-2">
          Tactical Session Interrupted
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mb-4">
          An unexpected server error occurred while rendering this page.
        </p>

        {error.digest && (
          <div className="mb-6 p-3 rounded-xl bg-black/40 border border-white/10 font-mono text-[11px] text-slate-400">
            Error Digest: <span className="text-arena-neonGreen font-bold">{error.digest}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-arena-neonGreen text-slate-950 font-bold uppercase text-xs tracking-wider shadow-neon hover:opacity-90 transition"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold uppercase text-xs tracking-wider transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
