"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trophy, Play, CheckCircle2, Clock, FastForward, Loader2, Calendar, Shield } from "lucide-react";

interface FixturesListClientProps {
  league: {
    id: string;
    name: string;
    status: string;
  };
  matches: Array<{
    id: string;
    leagueId: string;
    matchday: number;
    homeTeamId: string;
    awayTeamId: string;
    homeGoals: number;
    awayGoals: number;
    status: string;
    homeTeam: {
      id: string;
      teamName: string;
      managerName: string;
    };
    awayTeam: {
      id: string;
      teamName: string;
      managerName: string;
    };
  }>;
  selectedMatchdayProp: number;
}

export default function FixturesListClient({
  league,
  matches,
  selectedMatchdayProp,
}: FixturesListClientProps) {
  const router = useRouter();
  const [selectedMatchday, setSelectedMatchday] = useState<number>(selectedMatchdayProp || 1);
  const [simulating, setSimulating] = useState(false);

  // Group matchdays
  const totalMatchdays = Math.max(1, ...matches.map((m) => m.matchday));
  const currentRoundMatches = matches.filter((m) => m.matchday === selectedMatchday);

  const pendingInRound = currentRoundMatches.filter((m) => m.status === "PENDING").length;

  const handleSimulateRound = async () => {
    setSimulating(true);
    try {
      const res = await fetch(`/api/leagues/${league.id}/matches/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "simulate-matchday",
          matchday: selectedMatchday,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
              Double Round-Robin Schedule
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-0.5">
            {league.name} Fixtures
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/leagues/${league.id}/team`}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider border border-white/10 transition"
          >
            Tactics Board
          </Link>
          <Link
            href={`/leagues/${league.id}/standings`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold uppercase tracking-wider border border-amber-500/30 transition"
          >
            <Trophy className="w-3.5 h-3.5" />
            Standings Table
          </Link>
        </div>
      </div>

      {/* Matchday Selector Ribbon */}
      <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none flex-1">
          {Array.from({ length: totalMatchdays }).map((_, i) => {
            const md = i + 1;
            const active = selectedMatchday === md;
            return (
              <button
                key={md}
                onClick={() => setSelectedMatchday(md)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition flex-shrink-0 border ${
                  active
                    ? "bg-arena-neonGreen text-slate-950 border-arena-neonGreen shadow-neon font-black"
                    : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                Matchday {md}
              </button>
            );
          })}
        </div>

        {pendingInRound > 0 && (
          <button
            onClick={handleSimulateRound}
            disabled={simulating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-cyanGlow hover:bg-cyan-300 transition flex-shrink-0 disabled:opacity-50"
          >
            {simulating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Simulating Round...
              </>
            ) : (
              <>
                <FastForward className="w-3.5 h-3.5" />
                Simulate Matchday {selectedMatchday} ({pendingInRound})
              </>
            )}
          </button>
        )}
      </div>

      {/* Current Round Fixtures Grid */}
      <div className="space-y-4">
        {currentRoundMatches.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
            <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold uppercase text-white">No Fixtures Available</h3>
            <p className="text-xs text-slate-400 mt-1">
              Assemble teams and start league to initialize the fixture schedule.
            </p>
          </div>
        ) : (
          currentRoundMatches.map((m) => {
            const isFinished = m.status === "FINISHED";
            return (
              <div
                key={m.id}
                className="glass-panel rounded-2xl p-5 border border-white/10 hover:border-emerald-500/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Home Team */}
                <div className="flex-1 text-left sm:text-right">
                  <div className="font-black text-base uppercase text-white truncate">
                    {m.homeTeam.teamName}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Gaffer: {m.homeTeam.managerName}
                  </div>
                </div>

                {/* Score / VS Center */}
                <div className="flex flex-col items-center justify-center px-4 py-2 rounded-xl bg-black/40 border border-white/5 min-w-[120px]">
                  {isFinished ? (
                    <div className="font-mono text-2xl font-black text-white flex items-center gap-2">
                      <span className="text-arena-neonGreen">{m.homeGoals}</span>
                      <span className="text-slate-600">-</span>
                      <span className="text-cyan-400">{m.awayGoals}</span>
                    </div>
                  ) : (
                    <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                      PENDING
                    </div>
                  )}
                  <span className="text-[9px] font-mono text-slate-500 uppercase mt-0.5">
                    {isFinished ? "FT Result" : "Kickoff Ready"}
                  </span>
                </div>

                {/* Away Team */}
                <div className="flex-1 text-left">
                  <div className="font-black text-base uppercase text-white truncate">
                    {m.awayTeam.teamName}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Gaffer: {m.awayTeam.managerName}
                  </div>
                </div>

                {/* Action Button */}
                <div className="sm:pl-4 sm:border-l border-white/10 flex-shrink-0">
                  <Link
                    href={`/leagues/${league.id}/matches/${m.id}`}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                      isFinished
                        ? "bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10"
                        : "bg-arena-neonGreen text-slate-950 shadow-neon hover:scale-105"
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    {isFinished ? "View Match Log" : "Watch Live Simulation"}
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
