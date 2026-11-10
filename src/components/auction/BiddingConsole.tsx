"use client";

import { useState } from "react";
import { DollarSign, SkipForward, AlertTriangle, ShieldCheck, Zap } from "lucide-react";

interface BiddingConsoleProps {
  myTeam: {
    id: string;
    teamName: string;
    budget: number;
    players: any[];
  } | null;
  currentBid: number;
  highestBidderTeamId: string | null;
  onBid: (increment: number) => Promise<void>;
  onSkip: () => Promise<void>;
  hasSkipped: boolean;
  biddingInProgress: boolean;
}

export default function BiddingConsole({
  myTeam,
  currentBid,
  highestBidderTeamId,
  onBid,
  onSkip,
  hasSkipped,
  biddingInProgress,
}: BiddingConsoleProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!myTeam) {
    return (
      <div className="glass-panel rounded-3xl p-6 text-center border border-white/10 text-slate-400 text-sm">
        Spectator Mode: You are viewing this auction without an active team.
      </div>
    );
  }

  const currentSquadCount = myTeam.players.length;
  const isFull = currentSquadCount >= 21;
  const remainingMandatorySlots = Math.max(0, 16 - (currentSquadCount + 1));
  const reserveRequired = remainingMandatorySlots * 1000000; // $1M per slot
  const spendableMax = Math.max(0, myTeam.budget - reserveRequired);

  const isLeading = highestBidderTeamId === myTeam.id;

  const canAfford = (inc: number) => {
    const nextBid = isLeading ? currentBid : currentBid + inc;
    return nextBid <= spendableMax && !isFull;
  };

  const handleBidClick = async (increment: number) => {
    setErrorMsg(null);
    if (!canAfford(increment)) {
      setErrorMsg(`Cannot bid: Must keep $${(reserveRequired / 1000000).toFixed(1)}M reserve for remaining mandatory squad slots!`);
      return;
    }
    try {
      await onBid(increment);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Bid failed");
    }
  };

  const increments = [1000000, 5000000, 10000000, 20000000];

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10">
      {/* Team Budget & Squad Constraints Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
        <div>
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Managing Team</div>
          <div className="text-base font-black text-white">{myTeam.teamName}</div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400 uppercase text-[10px] block">Club Balance</span>
            <span className="text-base font-black text-arena-neonGreen">
              ${(myTeam.budget / 1000000).toFixed(1)}M
            </span>
          </div>

          <div className="pl-4 border-l border-white/10">
            <span className="text-slate-400 uppercase text-[10px] block">Squad Size</span>
            <span className={`text-base font-black ${currentSquadCount >= 16 ? "text-cyan-400" : "text-amber-400"}`}>
              {currentSquadCount} / 21
            </span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {isLeading && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-arena-neonGreen text-xs font-bold text-center flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          You currently hold the winning bid! Clock will assign player to you upon expiration.
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {increments.map((inc) => {
          const afford = canAfford(inc);
          return (
            <button
              key={inc}
              onClick={() => handleBidClick(inc)}
              disabled={biddingInProgress || !afford || isFull}
              className={`py-3 px-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1 border ${
                afford && !isFull
                  ? "bg-arena-neonGreen text-slate-950 border-arena-neonGreen shadow-neon hover:scale-105 active:scale-95"
                  : "bg-white/5 border-white/5 text-slate-600 cursor-not-allowed"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />+ ${(inc / 1000000).toFixed(0)}M
            </button>
          );
        })}
      </div>

      {/* Skip Button */}
      <button
        onClick={onSkip}
        disabled={biddingInProgress || hasSkipped || isLeading}
        className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 border ${
          hasSkipped
            ? "bg-white/5 border-white/10 text-slate-500 cursor-not-allowed"
            : "bg-white/10 border-white/15 text-slate-300 hover:bg-white/15 hover:text-white"
        }`}
      >
        <SkipForward className="w-4 h-4" />
        {hasSkipped ? "Passed on this player (Skipped)" : "Skip Player"}
      </button>

      <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>Reserved for empty slots: ${(reserveRequired / 1000000).toFixed(1)}M</span>
        <span>Max Bid: ${(spendableMax / 1000000).toFixed(1)}M</span>
      </div>
    </div>
  );
}
