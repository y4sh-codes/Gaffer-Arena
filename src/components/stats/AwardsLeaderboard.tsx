"use client";

import { GoldenBootEntry, GoldenGloveEntry, MVPEntry } from "@/lib/simulator/stats-calculator";
import { Flame, Shield, Award, Sparkles } from "lucide-react";

interface AwardsLeaderboardProps {
  goldenBoot: GoldenBootEntry[];
  goldenGlove: GoldenGloveEntry[];
  mvpLeaderboard: MVPEntry[];
}

export default function AwardsLeaderboard({
  goldenBoot,
  goldenGlove,
  mvpLeaderboard,
}: AwardsLeaderboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Golden Boot */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10 text-xs font-black uppercase tracking-wider text-amber-400">
          <Flame className="w-4 h-4 text-amber-400" />
          Golden Boot (Top Scorers)
        </div>

        {goldenBoot.length === 0 ? (
          <div className="text-xs text-slate-500 py-6 text-center italic">
            Awaiting goals from simulated fixtures...
          </div>
        ) : (
          <div className="space-y-3">
            {goldenBoot.map((entry, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 text-xs"
              >
                <div className="flex items-center gap-3 truncate">
                  <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-mono font-bold text-[10px] ${idx === 0 ? "bg-amber-500 text-slate-950 font-black shadow-goldGlow" : "bg-white/10 text-slate-400"}`}>
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <div className="font-extrabold text-white truncate">{entry.playerName}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{entry.teamName}</div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="font-mono font-black text-sm text-arena-neonGreen">
                    {entry.goals}
                  </span>
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Goals</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Golden Glove */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10 text-xs font-black uppercase tracking-wider text-cyan-400">
          <Shield className="w-4 h-4 text-cyan-400" />
          Golden Glove (Clean Sheets)
        </div>

        {goldenGlove.length === 0 ? (
          <div className="text-xs text-slate-500 py-6 text-center italic">
            Awaiting clean sheets from goalkeepers...
          </div>
        ) : (
          <div className="space-y-3">
            {goldenGlove.map((entry, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 text-xs"
              >
                <div className="flex items-center gap-3 truncate">
                  <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-mono font-bold text-[10px] ${idx === 0 ? "bg-cyan-400 text-slate-950 font-black shadow-cyanGlow" : "bg-white/10 text-slate-400"}`}>
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <div className="font-extrabold text-white truncate">{entry.playerName}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{entry.teamName}</div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="font-mono font-black text-sm text-cyan-400">
                    {entry.cleanSheets}
                  </span>
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Shutouts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MVP Leaderboard */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10 text-xs font-black uppercase tracking-wider text-arena-neonGreen">
          <Award className="w-4 h-4 text-arena-neonGreen" />
          MVP Award (Match Rating)
        </div>

        {mvpLeaderboard.length === 0 ? (
          <div className="text-xs text-slate-500 py-6 text-center italic">
            Awaiting match day MOTM ratings...
          </div>
        ) : (
          <div className="space-y-3">
            {mvpLeaderboard.map((entry, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 text-xs"
              >
                <div className="flex items-center gap-3 truncate">
                  <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-mono font-bold text-[10px] ${idx === 0 ? "bg-arena-neonGreen text-slate-950 font-black shadow-neon" : "bg-white/10 text-slate-400"}`}>
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <div className="font-extrabold text-white truncate">{entry.playerName}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{entry.teamName}</div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="font-mono font-black text-sm text-arena-neonGreen">
                    {entry.averageRating}
                  </span>
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">
                    {entry.motmCount} MOTM
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
