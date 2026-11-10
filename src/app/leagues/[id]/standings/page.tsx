import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import StandingsTable from "@/components/stats/StandingsTable";
import AwardsLeaderboard from "@/components/stats/AwardsLeaderboard";
import TeamOfTheWeek from "@/components/stats/TeamOfTheWeek";
import SeasonTransitionModal from "@/components/season/SeasonTransitionModal";
import { computeLeagueStats } from "@/lib/simulator/stats-calculator";
import { ArrowLeft, Play, LayoutGrid, Flame } from "lucide-react";

export const dynamic = "force-dynamic";

interface StandingsPageProps {
  params: Promise<{ id: string }>;
}

export default async function StandingsPage({ params }: StandingsPageProps) {
  const { id: leagueId } = await params;

  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: {
      teams: {
        orderBy: [
          { points: "desc" },
          { goalDifference: "desc" },
          { goalsFor: "desc" },
        ],
      },
      matches: {
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      },
    },
  });

  if (!league) notFound();

  // Compute individual awards and stats from matchday logs
  const stats = computeLeagueStats(league.matches);

  // Generate TOTW sample from top performers
  const topPlayers = await prisma.player.findMany({
    take: 6,
    orderBy: { ovr: "desc" },
  });

  const totwData = topPlayers.map((p, idx) => ({
    id: p.id,
    name: p.name,
    ovr: p.ovr + 1, // TOTW +1 boost
    pos: p.pos,
    club: p.team,
    rating: Number((9.0 + (idx % 3) * 0.3).toFixed(1)),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
                Season {league.currentSeason} Standings & Honors
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-0.5">
              {league.name} League Table
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/leagues/${league.id}/team`}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider border border-white/10 transition flex items-center gap-1.5"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Tactics
          </Link>
          <Link
            href={`/leagues/${league.id}/matches`}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-bold uppercase tracking-wider border border-cyan-500/30 transition flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            Fixtures
          </Link>
          <SeasonTransitionModal
            leagueId={league.id}
            currentSeason={league.currentSeason}
            teams={league.teams}
          />
        </div>
      </div>

      {/* Standings Table */}
      <StandingsTable teams={league.teams} />

      {/* Individual Awards Leaderboard (Golden Boot, Glove, MVP) */}
      <AwardsLeaderboard
        goldenBoot={stats.goldenBoot}
        goldenGlove={stats.goldenGlove}
        mvpLeaderboard={stats.mvpLeaderboard}
      />

      {/* Team of the Week (TOTW) */}
      <TeamOfTheWeek totwPlayers={totwData} />
    </div>
  );
}
