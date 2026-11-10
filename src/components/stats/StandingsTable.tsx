"use client";

import { Trophy, TrendingUp, Award, ArrowUpRight } from "lucide-react";

interface TeamRow {
  id: string;
  teamName: string;
  managerName: string;
  budget: number;
  points: number;
  matchesPlayed: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

interface StandingsTableProps {
  teams: TeamRow[];
}

export default function StandingsTable({ teams }: StandingsTableProps) {
  // Sort teams by Points -> GD -> GF -> Least GA
  const sorted = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.goalsAgainst - b.goalsAgainst;
  });

  return (
    <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Official League Standings
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked by Points (PTS) → Goal Difference (GD) → Goals Scored (GF)
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-goldGlow" />
            <span className="text-slate-300">Champion (+50% Budget)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-slate-300">UCL Zone</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3.5 px-4 text-center w-12">POS</th>
              <th className="py-3.5 px-4 font-sans">Club</th>
              <th className="py-3.5 px-3 text-center">P</th>
              <th className="py-3.5 px-3 text-center">W</th>
              <th className="py-3.5 px-3 text-center">D</th>
              <th className="py-3.5 px-3 text-center">L</th>
              <th className="py-3.5 px-3 text-center hidden sm:table-cell">GF</th>
              <th className="py-3.5 px-3 text-center hidden sm:table-cell">GA</th>
              <th className="py-3.5 px-3 text-center">GD</th>
              <th className="py-3.5 px-4 text-center font-black text-arena-neonGreen">PTS</th>
              <th className="py-3.5 px-4 text-right">Prize Bonus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sorted.map((team, index) => {
              const rank = index + 1;
              const isFirst = rank === 1;
              const isTop4 = rank <= 4;

              let rankBadge = "text-slate-400";
              let rowHighlight = "hover:bg-white/5";
              let bonus = "+10% Budget";

              if (isFirst) {
                rankBadge = "text-amber-400 font-black";
                rowHighlight = "bg-amber-500/10 hover:bg-amber-500/15";
                bonus = "+50% Budget ($" + ((team.budget * 0.5) / 1000000).toFixed(0) + "M)";
              } else if (rank === 2) {
                rankBadge = "text-slate-200 font-bold";
                bonus = "+30% Budget";
              } else if (rank === 3) {
                rankBadge = "text-amber-600 font-bold";
                bonus = "+20% Budget";
              }

              return (
                <tr key={team.id} className={`transition ${rowHighlight}`}>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold ${rankBadge}`}>
                      {isFirst ? "👑 1" : rank}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-extrabold text-sm text-white font-sans truncate">
                      {team.teamName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Gaffer: {team.managerName}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center text-slate-300">{team.matchesPlayed}</td>
                  <td className="py-3 px-3 text-center text-emerald-400 font-bold">{team.won}</td>
                  <td className="py-3 px-3 text-center text-slate-400">{team.drawn}</td>
                  <td className="py-3 px-3 text-center text-red-400 font-bold">{team.lost}</td>
                  <td className="py-3 px-3 text-center text-slate-400 hidden sm:table-cell">{team.goalsFor}</td>
                  <td className="py-3 px-3 text-center text-slate-400 hidden sm:table-cell">{team.goalsAgainst}</td>
                  <td className={`py-3 px-3 text-center font-bold ${team.goalDifference > 0 ? "text-emerald-400" : team.goalDifference < 0 ? "text-red-400" : "text-slate-400"}`}>
                    {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                  </td>
                  <td className="py-3 px-4 text-center font-black text-base text-arena-neonGreen">
                    {team.points}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isFirst ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-white/5 text-slate-400"}`}>
                      {bonus}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
