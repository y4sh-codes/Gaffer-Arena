"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { advanceSeasonAction } from "@/lib/actions/season-actions";
import { Trophy, ArrowRight, Sparkles, DollarSign, Award, Loader2 } from "lucide-react";

interface SeasonTransitionModalProps {
  leagueId: string;
  currentSeason: number;
  teams: Array<{
    id: string;
    teamName: string;
    managerName: string;
    points: number;
    budget: number;
  }>;
}

export default function SeasonTransitionModal({
  leagueId,
  currentSeason,
  teams,
}: SeasonTransitionModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [summary, setSummary] = useState<any[] | null>(null);

  const champion = teams[0];

  const handleAdvance = async () => {
    setAdvancing(true);
    try {
      const res = await advanceSeasonAction(leagueId);
      if (res.success) {
        setSummary(res.summary);
        setTimeout(() => {
          router.push(`/leagues/${leagueId}/auction`);
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to advance season");
      setAdvancing(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-goldGlow hover:scale-105 transition"
      >
        <Trophy className="w-4 h-4" />
        Season Off-Season Transition
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/40 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-goldGlow">
                <Trophy className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                Season {currentSeason} Grand Finale
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Conclude the current campaign, award prize budget multipliers, and initialize the next draft.
              </p>
            </div>

            {/* Champion Honors */}
            {champion && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center mb-6">
                <div className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                  👑 Reigning Champions
                </div>
                <div className="text-xl font-black uppercase text-white mt-0.5">
                  {champion.teamName}
                </div>
                <div className="text-xs text-slate-300 font-mono mt-0.5">
                  Manager: {champion.managerName} • {champion.points} PTS
                </div>
              </div>
            )}

            {/* Prize Multiplier Breakdown Table */}
            <div className="space-y-2 mb-6 text-xs font-mono">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2">
                Off-Season Financial Multipliers
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
                <span>1st Place Champions</span>
                <span className="font-black">+50% Budget Boost</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-slate-200">
                <span>2nd Place Runner-Up</span>
                <span className="font-bold text-cyan-400">+30% Budget Boost</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-slate-300">
                <span>3rd Place Podium</span>
                <span className="font-bold text-slate-200">+20% Budget Boost</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400">
                <span>4th – 16th Place</span>
                <span className="font-bold text-slate-400">+10% Consolidation</span>
              </div>
            </div>

            {summary ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <div className="text-sm font-black text-arena-neonGreen uppercase">
                  🎉 Season {currentSeason + 1} Unlocked!
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Budget boosts distributed. Redirecting to Season {currentSeason + 1} Auction Room...
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAdvance}
                  disabled={advancing}
                  className="flex-2 py-3 px-6 rounded-xl bg-arena-neonGreen text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {advancing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Applying Multipliers & Transitioning...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Kick Off Season {currentSeason + 1} Draft
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
