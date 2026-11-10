"use client";

import { FormationType, MentalityType } from "@/types";
import { FORMATIONS } from "@/lib/tactics/formation-templates";
import { Shield, Sparkles, Check, Sliders, Save, Loader2 } from "lucide-react";

interface TacticsControlsProps {
  currentFormation: FormationType;
  onFormationChange: (f: FormationType) => void;
  mentality: MentalityType;
  onMentalityChange: (m: MentalityType) => void;
  defensiveDepth: number;
  onDefensiveDepthChange: (d: number) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  saved: boolean;
}

export default function TacticsControls({
  currentFormation,
  onFormationChange,
  mentality,
  onMentalityChange,
  defensiveDepth,
  onDefensiveDepthChange,
  onSave,
  saving,
  saved,
}: TacticsControlsProps) {
  const mentalities: Array<{ type: MentalityType; desc: string }> = [
    { type: "Attacking", desc: "Aggressive overloads & forward runs" },
    { type: "Balanced", desc: "Structured spacing & steady buildup" },
    { type: "Park the Bus", desc: "Ultra-compact low block & containment" },
    { type: "High Press", desc: "Relentless front-foot suffocation" },
    { type: "Counter Attack", desc: "Soak pressure & launch rapid breaks" },
  ];

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-6">
      {/* Formation Selector */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
          Tactical Shape & Formation
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.keys(FORMATIONS) as FormationType[]).map((fKey) => {
            const form = FORMATIONS[fKey];
            const active = currentFormation === fKey;
            return (
              <button
                key={fKey}
                onClick={() => onFormationChange(fKey)}
                className={`p-3 rounded-xl text-left border transition ${
                  active
                    ? "bg-arena-neonGreen text-slate-950 border-arena-neonGreen shadow-neon font-black"
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 font-bold"
                }`}
              >
                <div className="text-sm uppercase tracking-tight">{form.name.split(" ")[0]}</div>
                <div className={`text-[10px] truncate ${active ? "text-slate-900" : "text-slate-400"}`}>
                  {form.slots.map((s) => s.position).filter((p) => p !== "GK").slice(0, 3).join("-")}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Team Mentality */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
          Team Mentality & Philosophy
        </label>
        <div className="flex flex-wrap gap-2">
          {mentalities.map((m) => {
            const active = mentality === m.type;
            return (
              <button
                key={m.type}
                onClick={() => onMentalityChange(m.type)}
                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition border ${
                  active
                    ? "bg-cyan-400 text-slate-950 border-cyan-400 shadow-cyanGlow"
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                }`}
              >
                {m.type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Defensive Depth Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-arena-neonGreen" />
            Defensive Line Depth
          </label>
          <span className="font-mono text-xs font-bold text-arena-neonGreen">
            {defensiveDepth <= 35 ? "Deep Low Block" : defensiveDepth <= 65 ? "Balanced Mid Block" : "Aggressive High Line"} ({defensiveDepth}%)
          </span>
        </div>
        <input
          type="range"
          min={10}
          max={90}
          value={defensiveDepth}
          onChange={(e) => onDefensiveDepthChange(Number(e.target.value))}
          className="w-full accent-arena-neonGreen cursor-pointer"
        />
      </div>

      {/* Save Tactics Button */}
      <div className="pt-4 border-t border-white/10">
        <button
          onClick={onSave}
          disabled={saving}
          className="w-full py-3.5 rounded-xl bg-arena-neonGreen text-slate-950 font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:opacity-90 transition shadow-neon disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Locking Tactics In...
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4 text-slate-950" />
              Tactics Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Confirm & Save Tactics
            </>
          )}
        </button>
      </div>
    </div>
  );
}
