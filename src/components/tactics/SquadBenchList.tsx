"use client";

import { ArrowRightLeft, UserCheck, Shield } from "lucide-react";

interface BenchPlayer {
  id: string; // TeamPlayer id
  playerId: string;
  player: {
    id: string;
    name: string;
    ovr: number;
    pos: string;
    nationality: string;
    att: number;
    def: number;
    pas: number;
    spe: number;
  };
}

interface SquadBenchListProps {
  benchPlayers: BenchPlayer[];
  onAssignToSelectedSlot: (benchPlayer: BenchPlayer) => void;
  selectedSlotLabel: string | null;
}

export default function SquadBenchList({
  benchPlayers,
  onAssignToSelectedSlot,
  selectedSlotLabel,
}: SquadBenchListProps) {
  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-white">
            Reserves & Substitutes ({benchPlayers.length})
          </h3>
          <p className="text-[11px] text-slate-400">
            {selectedSlotLabel
              ? `Select a player below to assign into ${selectedSlotLabel}`
              : "Click a slot on the pitch, then select a player to swap"}
          </p>
        </div>
      </div>

      {benchPlayers.length === 0 ? (
        <div className="text-xs text-slate-500 py-6 text-center italic border border-dashed border-white/10 rounded-2xl">
          No reserve players available. All acquired players are currently in the starting XI.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
          {benchPlayers.map((bp) => (
            <div
              key={bp.id}
              onClick={() => onAssignToSelectedSlot(bp)}
              className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/40 hover:bg-emerald-950/20 transition cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 truncate">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-amber-500/30 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs font-black text-amber-400 leading-none">{bp.player.ovr}</span>
                  <span className="text-[8px] font-mono font-bold text-slate-400 uppercase mt-0.5">{bp.player.pos}</span>
                </div>

                <div className="truncate">
                  <div className="text-xs font-extrabold text-white group-hover:text-arena-neonGreen transition truncate">
                    {bp.player.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    PAC {bp.player.spe} • SHO {bp.player.att} • DEF {bp.player.def}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="p-1.5 rounded-lg bg-white/10 group-hover:bg-arena-neonGreen group-hover:text-slate-950 text-slate-300 transition"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
