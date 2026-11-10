"use client";

import { Sparkles, Trophy, Shield } from "lucide-react";

interface TOTWProps {
  totwPlayers: Array<{
    id: string;
    name: string;
    ovr: number;
    pos: string;
    club: string;
    rating: number;
    goals?: number;
  }>;
}

export default function TeamOfTheWeek({ totwPlayers }: TOTWProps) {
  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/30 bg-gradient-to-b from-[#161204] via-slate-950 to-slate-950 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-widest mb-2 border border-amber-500/30">
            <Sparkles className="w-3 h-3 text-amber-400" />
            EA FC Special Release
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">
            Team of the Week (TOTW)
          </h2>
          <p className="text-xs text-slate-400">
            The 11 most outstanding tactical performers from recent league matchdays.
          </p>
        </div>
      </div>

      {totwPlayers.length === 0 ? (
        <div className="text-xs text-slate-500 py-8 text-center italic border border-dashed border-white/10 rounded-2xl">
          Simulate matchdays to unlock the official Team of the Week squad.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 relative z-10">
          {totwPlayers.map((player, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-black border border-amber-500/30 hover:border-amber-400 transition flex flex-col items-center text-center shadow-goldGlow group"
            >
              <div className="w-12 h-14 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-700 p-[1.5px] flex items-center justify-center mb-2 shadow-glass">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex flex-col items-center justify-center">
                  <span className="text-sm font-black text-amber-400 leading-none">{player.ovr}</span>
                  <span className="text-[9px] font-mono font-black text-slate-300 uppercase mt-0.5">{player.pos}</span>
                </div>
              </div>

              <div className="font-extrabold text-xs text-white truncate max-w-full group-hover:text-amber-400 transition">
                {player.name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate max-w-full">
                {player.club}
              </div>

              <div className="mt-2 pt-2 border-t border-white/10 w-full flex justify-between text-[10px] font-mono">
                <span className="text-slate-500">Rating</span>
                <span className="font-bold text-amber-400">{player.rating}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
