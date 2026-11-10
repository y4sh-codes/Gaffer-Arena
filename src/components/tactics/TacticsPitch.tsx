"use client";

import { TacticalSlot, PlayerRoleType } from "@/types";
import { AVAILABLE_ROLES } from "@/lib/tactics/formation-templates";
import { Sparkles, ArrowRightLeft, Shield, Sliders } from "lucide-react";
import { useState } from "react";

interface StarterAssignment {
  slotId: string;
  position: string;
  teamPlayerId: string;
  role: PlayerRoleType;
  player: {
    name: string;
    ovr: number;
    pos: string;
    image: string;
    att: number;
    def: number;
    pas: number;
  };
}

interface TacticsPitchProps {
  slots: TacticalSlot[];
  lineup: Record<string, StarterAssignment | null>;
  onSlotClick: (slot: TacticalSlot) => void;
  selectedSlotId: string | null;
  onRoleChange: (slotId: string, newRole: PlayerRoleType) => void;
}

export default function TacticsPitch({
  slots,
  lineup,
  onSlotClick,
  selectedSlotId,
  onRoleChange,
}: TacticsPitchProps) {
  const [roleModalSlot, setRoleModalSlot] = useState<string | null>(null);

  return (
    <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] max-h-[700px] rounded-3xl overflow-hidden border-2 border-emerald-500/30 shadow-glass bg-gradient-to-b from-[#0f341b] via-[#143f23] to-[#0d2e18]">
      {/* Pitch Grass Stripes (Authentic Turf Pattern) */}
      <div className="absolute inset-0 flex flex-col pointer-events-none opacity-20">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 w-full ${i % 2 === 0 ? "bg-black/20" : "bg-transparent"}`}
          />
        ))}
      </div>

      {/* Chalk Pitch Markings */}
      <div className="absolute inset-4 sm:inset-6 border border-white/25 rounded-2xl pointer-events-none">
        {/* Halfway line */}
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/25" />
        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-white/25 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white/40" />
        </div>

        {/* Top Penalty Box (Opponent) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-24 border-b border-l border-r border-white/25 rounded-b-xl" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-10 border-b border-l border-r border-white/25" />

        {/* Bottom Penalty Box (Our Goal) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-24 border-t border-l border-r border-white/25 rounded-t-xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-10 border-t border-l border-r border-white/25" />
        {/* Penalty Spot */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/40" />
      </div>

      {/* 11 Tactical Player Tokens */}
      {slots.map((slot) => {
        const assignment = lineup[slot.slotId];
        const isSelected = selectedSlotId === slot.slotId;

        return (
          <div
            key={slot.slotId}
            onClick={() => onSlotClick(slot)}
            style={{
              left: `${slot.x}%`,
              top: `${slot.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            className="absolute z-20 cursor-pointer group"
          >
            {assignment ? (
              <div
                className={`flex flex-col items-center transition-transform hover:scale-110 ${
                  isSelected ? "scale-110" : ""
                }`}
              >
                {/* OVR + Token Disc */}
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl p-[1.5px] transition shadow-glass ${
                    isSelected
                      ? "bg-arena-neonGreen shadow-neon scale-105"
                      : "bg-gradient-to-tr from-amber-400 to-amber-600 hover:border-arena-neonGreen"
                  }`}
                >
                  <div className="w-full h-full bg-slate-950/90 backdrop-blur-md rounded-[13px] flex flex-col items-center justify-center">
                    <span className="text-xs sm:text-sm font-black text-amber-400 leading-none">
                      {assignment.player.ovr}
                    </span>
                    <span className="text-[9px] font-mono font-black text-slate-300 uppercase leading-none mt-0.5">
                      {slot.position}
                    </span>
                  </div>
                </div>

                {/* Player Name Pill */}
                <div className="mt-1 px-2 py-0.5 rounded-full bg-slate-950/90 border border-white/20 text-[10px] font-bold text-white max-w-[85px] sm:max-w-[100px] truncate text-center shadow-lg">
                  {assignment.player.name}
                </div>

                {/* Role Tag */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRoleModalSlot(slot.slotId);
                  }}
                  className="mt-0.5 px-1.5 py-0.2 rounded bg-emerald-500/20 border border-emerald-500/30 text-[8px] font-mono text-arena-neonGreen uppercase font-bold hover:bg-emerald-500/30 transition truncate max-w-[85px]"
                >
                  {assignment.role}
                </button>
              </div>
            ) : (
              /* Empty Slot */
              <div
                className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition ${
                  isSelected
                    ? "border-arena-neonGreen bg-emerald-500/20 scale-105"
                    : "border-white/30 bg-slate-900/60 hover:border-white/60"
                }`}
              >
                <span className="text-[10px] font-mono font-bold text-white/70">{slot.position}</span>
                <span className="text-[8px] text-slate-400">Empty</span>
              </div>
            )}
          </div>
        );
      })}

      {/* Role Picker Popup Modal */}
      {roleModalSlot && lineup[roleModalSlot] && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl p-6 border border-emerald-500/40 max-w-sm w-full">
            <h4 className="text-sm font-black uppercase text-white mb-1">
              Select Player Role
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Configure tactical instructions for {lineup[roleModalSlot]?.player.name} ({lineup[roleModalSlot]?.position}):
            </p>

            <div className="space-y-2 mb-6">
              {(
                AVAILABLE_ROLES[lineup[roleModalSlot]!.position] || [
                  "Target Man",
                  "Inverted Winger",
                  "Deep Lying Playmaker",
                  "Box-to-Box",
                  "Sweeper Keeper",
                  "Ball-Playing CB",
                ]
              ).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    onRoleChange(roleModalSlot, role as PlayerRoleType);
                    setRoleModalSlot(null);
                  }}
                  className={`w-full p-2.5 rounded-xl text-xs font-bold text-left transition flex items-center justify-between border ${
                    lineup[roleModalSlot]?.role === role
                      ? "bg-arena-neonGreen text-slate-950 border-arena-neonGreen font-black"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <span>{role}</span>
                  {lineup[roleModalSlot]?.role === role && <span className="text-[10px]">ACTIVE</span>}
                </button>
              ))}
            </div>

            <button
              onClick={() => setRoleModalSlot(null)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
