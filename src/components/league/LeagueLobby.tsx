"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startAuctionAction, fillLobbyWithAITeamsAction } from "@/lib/actions/league-actions";
import { Trophy, Users, Shield, Copy, Check, Flame, Bot, Loader2, Sparkles, AlertCircle, Clock } from "lucide-react";

interface LeagueLobbyProps {
  league: {
    id: string;
    name: string;
    code: string;
    maxTeams: number;
    startingBudget: number;
    currentSeason: number;
    status: string;
    createdById: string;
    teams: Array<{
      id: string;
      userId: string;
      teamName: string;
      managerName: string;
      budget: number;
    }>;
  };
  currentUserId: string;
}

export default function LeagueLobby({ league, currentUserId }: LeagueLobbyProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [fillingAI, setFillingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isHost = league.createdById === currentUserId;
  const slotsRemaining = league.maxTeams - league.teams.length;

  const copyCode = () => {
    navigator.clipboard.writeText(league.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartAuction = async () => {
    if (league.teams.length < 2) {
      setError("At least 2 teams are required to begin the auction draft.");
      return;
    }
    setStarting(true);
    setError(null);
    try {
      const res = await startAuctionAction(league.id);
      if (res.success) {
        router.push(`/leagues/${league.id}/auction`);
      } else {
        setError(res.error || "Failed to start auction");
        setStarting(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to start auction");
      setStarting(false);
    }
  };

  const handleFillAI = async (count?: number) => {
    setFillingAI(true);
    setError(null);
    try {
      const toAdd = count ?? slotsRemaining;
      const res = await fillLobbyWithAITeamsAction(league.id, toAdd);
      if (res.success) {
        router.refresh();
      } else {
        setError(res.error || "Failed to add AI teams");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add AI teams");
    } finally {
      setFillingAI(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Lobby Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
                Pre-Auction Lobby
              </span>
              <span className="text-xs text-slate-500 font-mono">Season {league.currentSeason}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">{league.name}</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Assemble at least 2 manager franchises (up to {league.maxTeams}) to begin the live 20-second bidding draft.
            </p>
          </div>

          {/* Secret Code Card */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 self-start md:self-auto">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Invite Code</div>
              <div className="text-2xl font-mono font-black text-arena-neonGreen tracking-wider">
                {league.code}
              </div>
            </div>
            <button
              onClick={copyCode}
              aria-label="Copy Code"
              className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white transition flex items-center justify-center"
            >
              {copied ? <Check className="w-5 h-5 text-arena-neonGreen" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* League Parameters Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10 text-xs">
          <div>
            <span className="text-slate-400 uppercase tracking-wider font-semibold">Starting Budget</span>
            <div className="font-mono font-bold text-base text-arena-neonGreen mt-0.5">
              ${(league.startingBudget / 1000000).toFixed(0)}M
            </div>
          </div>
          <div>
            <span className="text-slate-400 uppercase tracking-wider font-semibold">Franchises</span>
            <div className="font-mono font-bold text-base text-white mt-0.5">
              {league.teams.length} / {league.maxTeams}
              <span className="text-[10px] text-arena-neonGreen font-mono font-bold ml-1.5">(Min 2 to start)</span>
            </div>
          </div>
          <div>
            <span className="text-slate-400 uppercase tracking-wider font-semibold">Squad Requirements</span>
            <div className="font-mono font-bold text-base text-cyan-400 mt-0.5">
              16 Min — 21 Max
            </div>
          </div>
          <div>
            <span className="text-slate-400 uppercase tracking-wider font-semibold">Auction Clock</span>
            <div className="font-mono font-bold text-base text-amber-400 mt-0.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              20s Dynamic
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Host Controls Panel */}
      {isHost && (
        <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 bg-emerald-950/20 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-arena-neonGreen font-bold uppercase text-xs tracking-wider">
              <Shield className="w-4 h-4" />
              Commissioner Controls
            </div>
            <div className="text-sm text-slate-300 mt-1 font-medium">
              {league.teams.length >= 2 ? (
                <span className="text-emerald-300 flex items-center gap-1.5 font-semibold">
                  <Check className="w-4 h-4 text-arena-neonGreen" />
                  Ready to draft! {league.teams.length} franchises registered (minimum 2 met). You can launch now or wait for more managers.
                </span>
              ) : (
                <span className="text-amber-300 flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  Need at least 2 managers to start. Invite a friend with code &quot;{league.code}&quot; or add an AI manager below.
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {slotsRemaining > 0 && (
              <>
                <button
                  onClick={() => handleFillAI(1)}
                  disabled={fillingAI || starting}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 text-xs font-bold uppercase tracking-wider transition border border-cyan-500/30 disabled:opacity-50"
                >
                  {fillingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4 text-cyan-400" />}
                  +1 AI Manager
                </button>
                {slotsRemaining > 1 && (
                  <button
                    onClick={() => handleFillAI()}
                    disabled={fillingAI || starting}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase tracking-wider transition border border-white/10 disabled:opacity-50"
                  >
                    {fillingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4 text-slate-400" />}
                    Fill All ({slotsRemaining})
                  </button>
                )}
              </>
            )}

            <button
              onClick={handleStartAuction}
              disabled={starting || league.teams.length < 2}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-neon ${
                league.teams.length >= 2
                  ? "bg-arena-neonGreen text-slate-950 hover:scale-105"
                  : "bg-white/10 text-slate-500 cursor-not-allowed border border-white/10"
              }`}
            >
              {starting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Starting Auction...
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4" />
                  Launch Auction ({league.teams.length} Teams Ready)
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Franchises Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            Registered Franchises ({league.teams.length} / {league.maxTeams})
          </h2>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            {league.teams.length >= 2 ? "✓ Ready to Start" : "Waiting for 2nd Manager"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {league.teams.map((team, index) => {
            const isMe = team.userId === currentUserId;
            const isCreator = team.userId === league.createdById;

            return (
              <div
                key={team.id}
                className={`glass-panel p-4 rounded-2xl border transition relative overflow-hidden ${
                  isMe
                    ? "border-arena-neonGreen/50 bg-emerald-950/20 shadow-neon"
                    : "border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-500 font-bold">SLOT #{index + 1}</span>
                  {isCreator && (
                    <span className="text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                      Host
                    </span>
                  )}
                  {isMe && !isCreator && (
                    <span className="text-[9px] font-mono uppercase bg-emerald-500/20 text-arena-neonGreen px-2 py-0.5 rounded font-bold">
                      You
                    </span>
                  )}
                </div>

                <div className="font-extrabold text-sm text-white truncate">{team.teamName}</div>
                <div className="text-xs text-slate-400 truncate mt-0.5">Manager: {team.managerName}</div>

                <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center text-[11px] font-mono">
                  <span className="text-slate-500">Budget</span>
                  <span className="font-bold text-arena-neonGreen">
                    ${(team.budget / 1000000).toFixed(0)}M
                  </span>
                </div>
              </div>
            );
          })}

          {/* Quick Invite Slot */}
          {slotsRemaining > 0 && (
            <div className="p-4 rounded-2xl border border-dashed border-cyan-500/30 bg-cyan-950/10 flex flex-col items-center justify-center text-center min-h-[110px]">
              <span className="text-[10px] font-mono text-cyan-400 font-bold mb-1">
                SLOT #{league.teams.length + 1} (OPEN)
              </span>
              <div className="text-xs text-slate-300 font-semibold mb-2">Invite Friend</div>
              <button
                onClick={copyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-[11px] font-bold uppercase transition border border-cyan-500/30"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-arena-neonGreen" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Code ({league.code})
              </button>
            </div>
          )}

          {/* Quick AI Slot if only 1 manager */}
          {league.teams.length < 2 && isHost && (
            <div className="p-4 rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-950/10 flex flex-col items-center justify-center text-center min-h-[110px]">
              <span className="text-[10px] font-mono text-arena-neonGreen font-bold mb-1">
                MINIMUM 2 TEAMS
              </span>
              <div className="text-xs text-slate-300 font-semibold mb-2">Need a 2nd Manager?</div>
              <button
                onClick={() => handleFillAI(1)}
                disabled={fillingAI}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-arena-neonGreen text-slate-950 hover:opacity-90 text-[11px] font-black uppercase tracking-wider transition shadow-neon"
              >
                {fillingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                Add 1 AI Rival
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
