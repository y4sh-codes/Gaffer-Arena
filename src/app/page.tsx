import Link from "next/link";
import prisma from "@/lib/prisma";
import { Trophy, Users, Zap, Shield, Sparkles, ArrowRight, Activity, Flame } from "lucide-react";

export default async function HomePage() {
  const playerCount = await prisma.player.count();
  const leagueCount = await prisma.league.count();

  return (
    <div className="relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-emerald-500/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-arena-neonGreen text-xs font-semibold uppercase tracking-wider mb-8 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen EA FC 24 Manager & Real-Time Auction Draft</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight uppercase leading-tight mb-6">
          Build Your Ultimate <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Dream XI
          </span>{" "}
          Under Pressure
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 mb-10">
          Experience high-stakes 16-player interactive auction bidding with a 20-second dynamic clock, tactical pitch formation builder, and deterministic match day simulation with minute-by-minute live logs.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/leagues/create"
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-arena-neonGreen text-slate-950 font-bold uppercase tracking-wider text-sm hover:scale-105 transition shadow-neon"
          >
            <Trophy className="w-4 h-4" />
            Create League
          </Link>
          <Link
            href="/leagues/join"
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wider text-sm hover:bg-white/10 transition"
          >
            <Users className="w-4 h-4" />
            Join with Code
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-400 font-bold uppercase tracking-wider text-sm hover:bg-slate-800 transition"
          >
            <Shield className="w-4 h-4" />
            Manager Dashboard
          </Link>
        </div>

        {/* Live Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16 text-left">
          <div className="glass-panel p-4 rounded-2xl border border-white/5">
            <div className="text-2xl font-black text-white">{playerCount || "600+"}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">85+ OVR Players Seeded</div>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-white/5">
            <div className="text-2xl font-black text-arena-neonGreen">20s Clock</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Dynamic Bid Reset</div>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-white/5">
            <div className="text-2xl font-black text-cyan-400">16 Managers</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Double Round-Robin</div>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-white/5">
            <div className="text-2xl font-black text-amber-400">+50% Budget</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Season Progression</div>
          </div>
        </div>
      </section>

      {/* Core Feature Pillars */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16 border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wider">Engine Architecture</h2>
          <p className="text-slate-400 text-sm mt-2">Every feature crafted for authentic tactical football mastery.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-arena-neonGreen flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold uppercase mb-2">Live 20-Second Auction</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Real-time interactive bidding machine. Every new bid resets the clock to 20 seconds. Strategic skips, budget reservations, and squad limit safeguards.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold uppercase mb-2">Interactive Tactics Board</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Authentic pitch visualizer supporting 4-3-3, 4-2-3-1, 3-5-2, and 4-4-2. Assign specialized roles like Deep Lying Playmaker, Target Man, and Sweeper Keeper.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-amber-500/30 transition group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold uppercase mb-2">Matchday Simulation</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Factorizes Home Advantage, H2H player clashes, tactical counter styles, and player traits with an animated 60-90s clock and live events feed.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
