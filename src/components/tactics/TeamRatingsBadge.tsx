"use client";

import { Shield, Zap, Activity, Layers, Award } from "lucide-react";

interface TeamRatingsBadgeProps {
  ratings: {
    att: number;
    mid: number;
    def: number;
    depth: number;
    ovr: number;
  };
}

export default function TeamRatingsBadge({ ratings }: TeamRatingsBadgeProps) {
  const ratingBadge = (val: number) => {
    if (val >= 90) return "text-emerald-400 bg-emerald-950/40 border-emerald-500/40 shadow-neon";
    if (val >= 85) return "text-cyan-400 bg-cyan-950/40 border-cyan-500/40 shadow-cyanGlow";
    if (val >= 80) return "text-amber-400 bg-amber-950/40 border-amber-500/40";
    return "text-slate-300 bg-slate-900 border-white/10";
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-wrap items-center justify-between gap-4">
      {/* Overall Badge */}
      <div className="flex items-center gap-3">
        <div className="w-14 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-[2px] shadow-goldGlow flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-amber-400 leading-none">{ratings.ovr}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">OVR</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Team Strength</div>
          <div className="text-sm font-extrabold text-white uppercase tracking-tight">Active XI Rating</div>
        </div>
      </div>

      {/* Att, Mid, Def, Depth */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 max-w-xl">
        <div className={`p-2.5 rounded-xl border flex items-center justify-between ${ratingBadge(ratings.att)}`}>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase">
            <Zap className="w-3.5 h-3.5" />
            <span>ATT</span>
          </div>
          <span className="text-lg font-mono font-black">{ratings.att}</span>
        </div>

        <div className={`p-2.5 rounded-xl border flex items-center justify-between ${ratingBadge(ratings.mid)}`}>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase">
            <Activity className="w-3.5 h-3.5" />
            <span>MID</span>
          </div>
          <span className="text-lg font-mono font-black">{ratings.mid}</span>
        </div>

        <div className={`p-2.5 rounded-xl border flex items-center justify-between ${ratingBadge(ratings.def)}`}>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase">
            <Shield className="w-3.5 h-3.5" />
            <span>DEF</span>
          </div>
          <span className="text-lg font-mono font-black">{ratings.def}</span>
        </div>

        <div className={`p-2.5 rounded-xl border flex items-center justify-between ${ratingBadge(ratings.depth)}`}>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase">
            <Layers className="w-3.5 h-3.5" />
            <span>DEPTH</span>
          </div>
          <span className="text-lg font-mono font-black">{ratings.depth}</span>
        </div>
      </div>
    </div>
  );
}
