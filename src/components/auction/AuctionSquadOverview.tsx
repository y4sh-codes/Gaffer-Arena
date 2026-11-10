"use client";

import { Trophy, History, Users, Shield } from "lucide-react";

interface AuctionSquadOverviewProps {
  teams: Array<{
    id: string;
    teamName: string;
    managerName: string;
    budget: number;
    players: Array<{
      id: string;
      purchasePrice: number;
      player: {
        name: string;
        ovr: number;
        pos: string;
      };
    }>;
  }>;
  bidHistory: Array<{
    teamId: string;
    teamName: string;
    amount: number;
    timestamp: number;
  }>;
  myTeamId?: string;
}

export default function AuctionSquadOverview({
  teams,
  bidHistory,
  myTeamId,
}: AuctionSquadOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Live Bidding History Log */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-slate-300">
          <History className="w-4 h-4 text-cyan-400" />
          Live Bidding Log
        </div>

        {bidHistory.length === 0 ? (
          <div className="text-xs text-slate-500 italic py-4 text-center">
            Awaiting first bid from league managers...
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {bidHistory.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs font-mono"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-arena-neonGreen" />
                  <span className="font-bold text-white truncate">{item.teamName}</span>
                </div>
                <span className="font-black text-arena-neonGreen flex-shrink-0">
                  ${(item.amount / 1000000).toFixed(1)}M
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 16 Team Draft Tracker */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Users className="w-4 h-4 text-arena-gold" />
            League Draft Tracker ({teams.length})
          </div>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {teams.map((team) => {
            const isMe = team.id === myTeamId;
            return (
              <div
                key={team.id}
                className={`p-3 rounded-xl border transition text-xs ${
                  isMe
                    ? "bg-emerald-950/20 border-arena-neonGreen/40 shadow-neon"
                    : "bg-white/5 border-white/5"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-white truncate">{team.teamName}</span>
                  <span className="font-mono font-bold text-arena-neonGreen">
                    ${(team.budget / 1000000).toFixed(1)}M
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Manager: {team.managerName}</span>
                  <span className={team.players.length >= 16 ? "text-cyan-400" : "text-amber-400"}>
                    {team.players.length} / 21 Signed
                  </span>
                </div>

                {/* Acquired stars tags */}
                {team.players.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/5 flex flex-wrap gap-1">
                    {team.players.slice(-3).map((tp) => (
                      <span
                        key={tp.id}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-200"
                      >
                        {tp.player.name} ({tp.player.ovr})
                      </span>
                    ))}
                    {team.players.length > 3 && (
                      <span className="text-[9px] text-slate-500 font-mono self-center">
                        +{team.players.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
