"use client";

import Image from "next/image";
import { Sparkles, Shield, Zap, Flame, Award, Globe } from "lucide-react";

interface PlayerAuctionCardProps {
  player: {
    id: string;
    externalFifaId: number;
    name: string;
    ovr: number;
    pos: string;
    cardYear: number;
    nationality: string;
    league: string;
    team: string;
    att: number;
    def: number;
    pas: number;
    phy: number;
    dri: number;
    spe: number;
    traits: string[];
    playstyle: string;
    bio20Words: string;
    image: string;
  };
}

export default function PlayerAuctionCard({ player }: PlayerAuctionCardProps) {
  const statColor = (val: number) => {
    if (val >= 90) return "text-emerald-400 font-black";
    if (val >= 85) return "text-cyan-400 font-bold";
    if (val >= 75) return "text-amber-300 font-semibold";
    return "text-slate-400";
  };

  const statPillars = [
    { label: "PAC", full: "Pace", val: player.spe },
    { label: "SHO", full: "Shooting", val: player.att },
    { label: "PAS", full: "Passing", val: player.pas },
    { label: "DRI", full: "Dribbling", val: player.dri },
    { label: "DEF", full: "Defending", val: player.def },
    { label: "PHY", full: "Physical", val: player.phy },
  ];

  return (
    <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-slate-900/90 via-slate-900/95 to-slate-950 border border-emerald-500/30 shadow-glass overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner: OVR, Position, Club, Era */}
      <div className="flex items-start justify-between relative z-10 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center justify-center w-16 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-[2px] shadow-goldGlow">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-amber-400 leading-none">{player.ovr}</span>
              <span className="text-xs font-black tracking-widest text-slate-300 uppercase mt-0.5">{player.pos}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-arena-neonGreen px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                EA FC {player.cardYear}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Globe className="w-3 h-3 text-cyan-400" />
                {player.nationality}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1">
              {player.name}
            </h2>
            <div className="text-xs text-slate-400 font-medium">
              {player.team} • <span className="text-slate-300">{player.league}</span>
            </div>
          </div>
        </div>

        {/* Playstyle Badge */}
        <div className="hidden sm:flex flex-col items-end">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            {player.playstyle}
          </div>
        </div>
      </div>

      {/* 20-Word Synthesized Bio Box */}
      <div className="relative z-10 mb-6 p-3.5 rounded-2xl bg-white/5 border border-white/5">
        <div className="text-[10px] uppercase font-mono font-bold text-slate-400 mb-1 flex items-center gap-1.5">
          <Award className="w-3 h-3 text-arena-neonGreen" />
          Scouting Report (20-Word Bio)
        </div>
        <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed">
          &ldquo;{player.bio20Words}&rdquo;
        </p>
      </div>

      {/* 6 Core Pillar Stats Grid */}
      <div className="relative z-10 grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mb-6">
        {statPillars.map((stat) => (
          <div
            key={stat.label}
            className="p-3 rounded-xl bg-white/5 border border-white/5 text-center flex flex-col justify-between"
          >
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">{stat.label}</div>
            <div className={`text-xl font-mono ${statColor(stat.val)} mt-1`}>{stat.val}</div>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                style={{ width: `${Math.min(100, Math.max(10, stat.val))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Traits Strip */}
      <div className="relative z-10 flex flex-wrap items-center gap-1.5 pt-4 border-t border-white/10">
        <span className="text-[10px] font-mono uppercase text-slate-500 font-bold mr-1">Player Traits:</span>
        {player.traits.map((trait, idx) => (
          <span
            key={idx}
            className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-semibold"
          >
            {trait}
          </span>
        ))}
      </div>
    </div>
  );
}
