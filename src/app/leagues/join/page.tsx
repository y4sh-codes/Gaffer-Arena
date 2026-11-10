"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinLeagueAction } from "@/lib/actions/league-actions";
import { Users, KeyRound, Shield, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function JoinLeaguePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [teamName, setTeamName] = useState("Vanguard FC");
  const [managerName, setManagerName] = useState("Manager Boss");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await joinLeagueAction({
        code,
        teamName,
        managerName,
      });

      if (res.success && res.leagueId) {
        router.push(`/leagues/${res.leagueId}/lobby`);
      } else {
        setError(res.error || "Failed to join league. Please check code.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong joining league.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-glass">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-cyanGlow">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Join League</h1>
            <p className="text-xs text-slate-400">Enter unique 6-character secret entry code.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              6-Character Entry Code
            </label>
            <input
              type="text"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. 7X9K2M"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-center font-mono text-2xl font-black tracking-widest text-arena-neonGreen focus:outline-none focus:border-arena-neonGreen transition uppercase placeholder-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Your Team Name
            </label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. London Strikers"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Your Manager Name
            </label>
            <input
              type="text"
              required
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              placeholder="e.g. Carlo Gaffer"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.trim().length < 6}
            className="w-full py-4 rounded-xl bg-cyan-400 text-slate-950 font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 hover:bg-cyan-300 transition shadow-cyanGlow disabled:opacity-50 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting to Lobby...
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                Enter Auction Lobby
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
