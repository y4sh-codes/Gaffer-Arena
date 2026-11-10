"use client";

import { Clock, Flame, ShieldAlert, Award } from "lucide-react";

interface AuctionClockProps {
  timeLeftSeconds: number;
  currentBid: number;
  highestBidderTeamName: string | null;
  status: string;
}

export default function AuctionClock({
  timeLeftSeconds,
  currentBid,
  highestBidderTeamName,
  status,
}: AuctionClockProps) {
  const isUrgent = timeLeftSeconds <= 5;
  const isWarning = timeLeftSeconds > 5 && timeLeftSeconds <= 10;

  let timerColor = "text-arena-neonGreen border-emerald-500/40 bg-emerald-950/20";
  let pulseClass = "";

  if (isUrgent) {
    timerColor = "text-red-400 border-red-500/60 bg-red-950/40";
    pulseClass = "animate-ping";
  } else if (isWarning) {
    timerColor = "text-amber-400 border-amber-500/50 bg-amber-950/30";
  }

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden">
      {/* Dynamic 20s Active Clock */}
      <div className="relative mb-4">
        <div
          className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 flex flex-col items-center justify-center transition-all ${timerColor} shadow-glass`}
        >
          <span className="text-[11px] font-mono uppercase font-bold tracking-wider opacity-80">
            Clock
          </span>
          <span className="text-4xl sm:text-5xl font-mono font-black tracking-tight leading-none">
            {timeLeftSeconds}s
          </span>
        </div>
        {isUrgent && (
          <span
            className={`absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 ${pulseClass}`}
          />
        )}
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase text-slate-400 mb-4">
        <Clock className="w-3 h-3 text-arena-neonGreen" />
        Bids reset clock to 20s
      </div>

      {/* Highest Bid Showcase */}
      <div className="w-full pt-4 border-t border-white/10">
        <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Current Top Bid</div>
        <div className="text-3xl sm:text-4xl font-mono font-black text-arena-neonGreen tracking-tight mt-0.5">
          ${(currentBid / 1000000).toFixed(1)}M
        </div>

        <div className="mt-2 text-xs">
          {highestBidderTeamName ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-arena-neonGreen font-bold">
              <Award className="w-3.5 h-3.5" />
              Leader: {highestBidderTeamName}
            </div>
          ) : (
            <span className="text-slate-500 italic">No bids yet • Opening price</span>
          )}
        </div>
      </div>
    </div>
  );
}
