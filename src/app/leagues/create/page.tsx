"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createLeagueAction } from "@/lib/actions/league-actions";
import { Trophy, DollarSign, Shield, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

export default function CreateLeaguePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [leagueName, setLeagueName] = useState("Apex Champions League");
  const [startingBudget, setStartingBudget] = useState(250000000);
  const [teamName, setTeamName] = useState("Galacticos FC");
  const [managerName, setManagerName] = useState("Pep Gaffer");

  const budgetPresets = [
    { label: "$150M (Challenger)", value: 150000000 },
    { label: "$250M (Standard FC)", value: 250000000 },
    { label: "$350M (Galactico)", value: 350000000 },
    { label: "$1000M (Super Club)", value: 1000000000 },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await createLeagueAction({
        name: leagueName,
        startingBudget,
        teamName,
        managerName,
      });

      if (res.success && res.leagueId) {
        router.push(`/leagues/${res.leagueId}/lobby`);
      } else {
        setError(res.error || "Failed to create league. Please verify inputs.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong creating the league.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-glass relative overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-arena-neonGreen flex items-center justify-center shadow-neon">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Create New League</h1>
            <p className="text-xs text-slate-400">Configure parameters, set budgets, and generate your 6-char secret entry code.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* League Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              League Name
            </label>
            <input
              type="text"
              required
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
              placeholder="e.g. EA Champions Draft"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-arena-neonGreen transition"
            />
          </div>

          {/* Starting Budget */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Starting Budget Per Team
              </label>
              <span className="font-mono text-sm font-bold text-arena-neonGreen">
                ${(startingBudget / 1000000).toFixed(0)}M USD
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {budgetPresets.map((preset) => (
                <button
                  type="button"
                  key={preset.value}
                  onClick={() => setStartingBudget(preset.value)}
                  className={`py-2 px-3 rounded-xl text-[11px] font-bold tracking-wider uppercase transition border ${
                    startingBudget === preset.value
                      ? "bg-arena-neonGreen text-slate-950 border-arena-neonGreen shadow-neon"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <input
              type="range"
              min={100000000}
              max={1000000000}
              step={10000000}
              value={startingBudget}
              onChange={(e) => setStartingBudget(Number(e.target.value))}
              className="w-full accent-arena-neonGreen cursor-pointer"
            />
          </div>

          <div className="border-t border-white/10 pt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Your Club Registration
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  My Team Name
                </label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Galacticos FC"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-arena-neonGreen transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  My Manager Name
                </label>
                <input
                  type="text"
                  required
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="e.g. Pep Gaffer"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-arena-neonGreen transition"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-arena-neonGreen text-slate-950 font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 hover:opacity-90 transition shadow-neon disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Initializing League & Draft Code...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Launch League Lobby
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
