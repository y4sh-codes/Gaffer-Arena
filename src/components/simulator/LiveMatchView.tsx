"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MatchEvent, MatchSimulationStats, MatchLogPayload } from "@/types";
import { Trophy, Clock, Shield, FastForward, Play, Award, Flame, AlertCircle } from "lucide-react";

interface LiveMatchViewProps {
  match: {
    id: string;
    leagueId: string;
    matchday: number;
    homeGoals: number;
    awayGoals: number;
    status: string;
    homeTeam: {
      id: string;
      teamName: string;
      managerName: string;
      formation: string;
    };
    awayTeam: {
      id: string;
      teamName: string;
      managerName: string;
      formation: string;
    };
  };
  initialPayload: MatchLogPayload;
}

export default function LiveMatchView({ match, initialPayload }: LiveMatchViewProps) {
  // If match was already finished, show full 90'; otherwise start simulated live clock 1'
  const isPreSimulated = match.status === "FINISHED";
  const [currentMinute, setCurrentMinute] = useState<number>(isPreSimulated ? 90 : 1);
  const [isLiveRunning, setIsLiveRunning] = useState<boolean>(!isPreSimulated);
  const [goalAlert, setGoalAlert] = useState<string | null>(null);

  // Filter events up to current simulated minute
  const visibleEvents = initialPayload.events.filter((e) => e.minute <= currentMinute);

  // Current score based on visible events
  const currentHomeScore = visibleEvents.filter(
    (e) => e.type === "GOAL" && e.teamId === match.homeTeam.id
  ).length;
  const currentAwayScore = visibleEvents.filter(
    (e) => e.type === "GOAL" && e.teamId === match.awayTeam.id
  ).length;

  useEffect(() => {
    if (!isLiveRunning || currentMinute >= 90) return;

    // 60-90 seconds simulation: roughly 800ms per simulated minute
    const timer = setInterval(() => {
      setCurrentMinute((prev) => {
        const nextMin = prev + 1;

        // Check if a goal occurred on this exact minute for alert
        const goal = initialPayload.events.find(
          (e) => e.minute === nextMin && e.type === "GOAL"
        );
        if (goal) {
          setGoalAlert(`⚽ GOAL! ${goal.playerName} (${goal.minute}')`);
          setTimeout(() => setGoalAlert(null), 3000);
        }

        if (nextMin >= 90) {
          setIsLiveRunning(false);
          return 90;
        }
        return nextMin;
      });
    }, 750);

    return () => clearInterval(timer);
  }, [isLiveRunning, currentMinute, initialPayload.events]);

  const handleSkipToWhistle = () => {
    setCurrentMinute(90);
    setIsLiveRunning(false);
  };

  const isFullTime = currentMinute >= 90;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/leagues/${match.leagueId}/matches`}
          className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-white transition flex items-center gap-1.5"
        >
          ← Matchday {match.matchday} Fixtures
        </Link>

        <div className="flex items-center gap-3">
          {!isFullTime && (
            <button
              onClick={handleSkipToWhistle}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold uppercase tracking-wider transition border border-white/10"
            >
              <FastForward className="w-3.5 h-3.5 text-arena-neonGreen" />
              Skip to Final Whistle
            </button>
          )}

          <Link
            href={`/leagues/${match.leagueId}/standings`}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-arena-neonGreen text-slate-950 text-xs font-black uppercase tracking-wider shadow-neon transition"
          >
            <Trophy className="w-3.5 h-3.5" />
            Standings Table
          </Link>
        </div>
      </div>

      {/* Stadium Scoreboard Display */}
      <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-b from-slate-900/90 via-slate-950 to-[#080d16] border border-white/15 shadow-glass text-center overflow-hidden">
        {/* Ambient Stadium Lighting */}
        <div className="absolute top-0 left-1/4 w-72 h-40 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-72 h-40 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Live Clock Ticker */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 font-mono">
          <span className={`w-2 h-2 rounded-full ${isFullTime ? "bg-slate-400" : "bg-red-500 animate-ping"}`} />
          <span className="text-xs font-black uppercase tracking-widest text-white">
            {isFullTime ? "FULL TIME (90')" : `LIVE SIMULATION • ${currentMinute}'`}
          </span>
        </div>

        {/* Teams & Scoreboard */}
        <div className="grid grid-cols-12 items-center gap-4 relative z-10">
          {/* Home Team */}
          <div className="col-span-5 flex flex-col items-center sm:items-end text-center sm:text-right">
            <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-white">
              {match.homeTeam.teamName}
            </h2>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              Manager: {match.homeTeam.managerName}
            </div>
            <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-arena-neonGreen px-2 py-0.5 rounded font-bold border border-emerald-500/30 mt-2">
              HOME ({match.homeTeam.formation})
            </span>
          </div>

          {/* Center Digital Score */}
          <div className="col-span-2 flex flex-col items-center justify-center">
            <div className="px-5 py-3 rounded-2xl bg-black/70 border border-white/20 font-mono text-4xl sm:text-6xl font-black text-white tracking-tighter flex items-center gap-3 shadow-glass">
              <span className="text-arena-neonGreen">{currentHomeScore}</span>
              <span className="text-slate-600">:</span>
              <span className="text-cyan-400">{currentAwayScore}</span>
            </div>
          </div>

          {/* Away Team */}
          <div className="col-span-5 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-white">
              {match.awayTeam.teamName}
            </h2>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              Manager: {match.awayTeam.managerName}
            </div>
            <span className="text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded font-bold border border-cyan-500/30 mt-2">
              AWAY ({match.awayTeam.formation})
            </span>
          </div>
        </div>

        {/* Live Goal Flash Alert */}
        {goalAlert && (
          <div className="mt-6 inline-block py-2 px-6 rounded-xl bg-arena-neonGreen text-slate-950 font-black text-sm uppercase tracking-wider animate-bounce shadow-neon">
            {goalAlert}
          </div>
        )}
      </div>

      {/* Two Column Grid: Match Timeline & Real-Time Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Minute-by-Minute Live Events Feed */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-white/10">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-arena-neonGreen" />
              Minute-by-Minute Match Log ({visibleEvents.length})
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Ticker: {currentMinute}&apos; / 90&apos;
            </span>
          </div>

          {visibleEvents.length === 0 ? (
            <div className="text-xs text-slate-500 py-8 text-center italic">
              Kickoff! Teams probing each other with measured buildup in the opening minutes...
            </div>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
              {visibleEvents.slice().reverse().map((ev, idx) => {
                const isGoal = ev.type === "GOAL";
                const isSave = ev.type === "GREAT_SAVE";
                const isRed = ev.type === "RED_CARD";
                const isYellow = ev.type === "YELLOW_CARD";
                const isWoodwork = ev.type === "WOODWORK";

                let borderStyle = "border-white/5 bg-white/5";
                let icon = "⚡";

                if (isGoal) {
                  borderStyle = "border-arena-neonGreen/40 bg-emerald-950/20 shadow-neon";
                  icon = "⚽";
                } else if (isSave) {
                  borderStyle = "border-cyan-500/30 bg-cyan-950/20";
                  icon = "🧤";
                } else if (isRed) {
                  borderStyle = "border-red-500/40 bg-red-950/20";
                  icon = "🟥";
                } else if (isYellow) {
                  borderStyle = "border-amber-500/30 bg-amber-950/20";
                  icon = "🟨";
                } else if (isWoodwork) {
                  borderStyle = "border-orange-500/30 bg-orange-950/20";
                  icon = "💥";
                }

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition text-xs ${borderStyle}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-amber-400 bg-black/40 px-2 py-0.5 rounded text-[10px]">
                          {ev.minute}&apos;
                        </span>
                        <span className="font-extrabold text-white">{icon} {ev.type.replace("_", " ")}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 font-semibold">{ev.teamName}</span>
                    </div>
                    <p className="text-slate-300 mt-1 leading-relaxed">{ev.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Match Stats & MOTM */}
        <div className="lg:col-span-5 space-y-6">
          {/* Man of the Match Card */}
          {isFullTime && (
            <div className="glass-panel rounded-3xl p-6 border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-950 shadow-goldGlow">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400 mb-2">
                <Award className="w-4 h-4" />
                Man of the Match (MOTM)
              </div>
              <div className="text-xl font-black uppercase text-white">
                {initialPayload.manOfTheMatch.playerName}
              </div>
              <div className="text-xs text-slate-400 font-medium">
                {initialPayload.manOfTheMatch.teamName} • Match Rating: <span className="font-mono font-bold text-amber-400">{initialPayload.manOfTheMatch.rating}</span>
              </div>
            </div>
          )}

          {/* Statistical Comparison Bars */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-6">
              Match Statistics
            </h3>

            <div className="space-y-4 text-xs font-mono">
              {/* Possession */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>{initialPayload.stats.homePossession}%</span>
                  <span className="text-slate-400 uppercase text-[10px] font-sans font-bold">Possession</span>
                  <span>{initialPayload.stats.awayPossession}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-arena-neonGreen h-full"
                    style={{ width: `${initialPayload.stats.homePossession}%` }}
                  />
                  <div
                    className="bg-cyan-400 h-full"
                    style={{ width: `${initialPayload.stats.awayPossession}%` }}
                  />
                </div>
              </div>

              {/* Total Shots */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>{initialPayload.stats.homeShots}</span>
                  <span className="text-slate-400 uppercase text-[10px] font-sans font-bold">Total Shots</span>
                  <span>{initialPayload.stats.awayShots}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-arena-neonGreen h-full"
                    style={{
                      width: `${(initialPayload.stats.homeShots / Math.max(1, initialPayload.stats.homeShots + initialPayload.stats.awayShots)) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-cyan-400 h-full"
                    style={{
                      width: `${(initialPayload.stats.awayShots / Math.max(1, initialPayload.stats.homeShots + initialPayload.stats.awayShots)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Shots on Target */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>{initialPayload.stats.homeShotsOnTarget}</span>
                  <span className="text-slate-400 uppercase text-[10px] font-sans font-bold">Shots on Target</span>
                  <span>{initialPayload.stats.awayShotsOnTarget}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-arena-neonGreen h-full"
                    style={{
                      width: `${(initialPayload.stats.homeShotsOnTarget / Math.max(1, initialPayload.stats.homeShotsOnTarget + initialPayload.stats.awayShotsOnTarget)) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-cyan-400 h-full"
                    style={{
                      width: `${(initialPayload.stats.awayShotsOnTarget / Math.max(1, initialPayload.stats.homeShotsOnTarget + initialPayload.stats.awayShotsOnTarget)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Corners */}
              <div className="flex justify-between py-2 border-t border-white/5">
                <span className="font-bold text-white">{initialPayload.stats.homeCorners}</span>
                <span className="text-slate-400 uppercase text-[10px] font-sans font-bold">Corner Kicks</span>
                <span className="font-bold text-white">{initialPayload.stats.awayCorners}</span>
              </div>

              {/* Fouls */}
              <div className="flex justify-between py-2 border-t border-white/5">
                <span className="font-bold text-white">{initialPayload.stats.homeFouls}</span>
                <span className="text-slate-400 uppercase text-[10px] font-sans font-bold">Fouls</span>
                <span className="font-bold text-white">{initialPayload.stats.awayFouls}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
