import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentUserOrGuest } from "@/lib/actions/league-actions";
import { Trophy, PlusCircle, Users, ArrowRight, ShieldCheck, Flame, Play, LayoutGrid } from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUserOrGuest();

  // Find user's leagues (either created by user or user has a team in)
  const leagues = await prisma.league.findMany({
    where: {
      OR: [
        { createdById: user.id },
        { teams: { some: { userId: user.id } } },
      ],
    },
    include: {
      teams: {
        include: {
          players: true,
        },
      },
      creator: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-arena-neonGreen animate-ping" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-arena-neonGreen">
              Manager Control Center
            </span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight mt-1">
            Welcome back, <span className="text-arena-neonGreen">{user.name || "Gaffer"}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Oversee your active franchises, jump into live auctions, and review your tactical standings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/leagues/create"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-arena-neonGreen text-slate-950 font-bold uppercase text-xs tracking-wider hover:opacity-90 transition shadow-neon"
          >
            <PlusCircle className="w-4 h-4" />
            Create League
          </Link>
          <Link
            href="/leagues/join"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold uppercase text-xs tracking-wider hover:bg-white/10 transition"
          >
            <Users className="w-4 h-4" />
            Join with Code
          </Link>
        </div>
      </div>

      {/* Leagues List */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-extrabold uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4 text-arena-gold" />
            My Leagues ({leagues.length})
          </h2>
        </div>

        {leagues.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center border border-white/5">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold uppercase text-slate-200">No Active Leagues Found</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto mt-2 mb-6">
              Create a custom 16-team league with your friends or enter a 6-character entry code to join an existing auction lobby.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/leagues/create"
                className="px-6 py-3 rounded-xl bg-arena-neonGreen text-slate-950 font-bold text-xs uppercase tracking-wider shadow-neon"
              >
                Create Your First League
              </Link>
              <Link
                href="/leagues/join"
                className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/15"
              >
                Join with Code
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagues.map((league) => {
              const myTeam = league.teams.find((t) => t.userId === user.id) || league.teams[0];
              const isHost = league.createdById === user.id;

              const statusColors: Record<string, string> = {
                DRAFT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                AUCTION: "bg-emerald-500/10 text-arena-neonGreen border-emerald-500/30 animate-pulse",
                IN_SEASON: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
                COMPLETED: "bg-slate-500/10 text-slate-400 border-slate-500/20",
              };

              return (
                <div
                  key={league.id}
                  className="glass-panel rounded-2xl p-6 border border-white/5 hover:border-emerald-500/30 transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border mb-2 ${
                            statusColors[league.status] || "bg-white/10 text-white"
                          }`}
                        >
                          {league.status.replace("_", " ")}
                        </span>
                        <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-arena-neonGreen transition">
                          {league.name}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono uppercase text-slate-400">Code</span>
                        <div className="text-xs font-mono font-black text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                          {league.code}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mt-4 text-xs text-slate-300">
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-slate-400">My Club</span>
                        <span className="font-bold text-white">{myTeam?.teamName || "Unassigned"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-slate-400">Club Budget</span>
                        <span className="font-mono font-bold text-arena-neonGreen">
                          ${((myTeam?.budget || league.startingBudget) / 1000000).toFixed(1)}M
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-slate-400">Registered Teams</span>
                        <span className="font-bold text-white">
                          {league.teams.length} / {league.maxTeams}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-slate-400">Squad Size</span>
                        <span className="font-bold text-cyan-400">
                          {myTeam?.players.length || 0} players (min 16)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions based on League Status */}
                  <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                    {league.status === "DRAFT" && (
                      <Link
                        href={`/leagues/${league.id}/lobby`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-bold text-xs uppercase tracking-wider transition border border-amber-500/30"
                      >
                        <Users className="w-3.5 h-3.5" />
                        Enter Lobby
                      </Link>
                    )}

                    {league.status === "AUCTION" && (
                      <Link
                        href={`/leagues/${league.id}/auction`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-arena-neonGreen text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-neon"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        Live Auction Room
                      </Link>
                    )}

                    {(league.status === "IN_SEASON" || league.status === "AUCTION" || league.status === "COMPLETED") && (
                      <>
                        <Link
                          href={`/leagues/${league.id}/team`}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition border border-white/10"
                        >
                          <LayoutGrid className="w-3.5 h-3.5" />
                          Tactics
                        </Link>
                        <Link
                          href={`/leagues/${league.id}/matches`}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 font-bold text-xs uppercase tracking-wider transition border border-white/10"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Fixtures
                        </Link>
                        <Link
                          href={`/leagues/${league.id}/standings`}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-amber-400 font-bold text-xs uppercase tracking-wider transition border border-white/10"
                        >
                          <Trophy className="w-3.5 h-3.5" />
                          Table
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
