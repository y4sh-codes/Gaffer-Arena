import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { generateDoubleRoundRobinSchedule } from "@/lib/simulator/fixture-generator";
import FixturesListClient from "./FixturesListClient";

export const dynamic = "force-dynamic";

interface MatchesPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ matchday?: string }>;
}

export default async function MatchesPage({ params, searchParams }: MatchesPageProps) {
  const { id: leagueId } = await params;
  const { matchday: matchdayQuery } = await searchParams;

  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: { teams: true },
  });

  if (!league) notFound();

  // If fixtures don't exist yet and there are teams, generate schedule automatically
  const matchCount = await prisma.match.count({ where: { leagueId } });
  if (matchCount === 0 && league.teams.length >= 2) {
    await generateDoubleRoundRobinSchedule(leagueId);
  }

  // Fetch all matches for this league
  const matches = await prisma.match.findMany({
    where: { leagueId },
    include: {
      homeTeam: true,
      awayTeam: true,
    },
    orderBy: [{ matchday: "asc" }, { createdAt: "asc" }],
  });

  return (
    <FixturesListClient
      league={league}
      matches={matches}
      selectedMatchdayProp={matchdayQuery ? Number(matchdayQuery) : 1}
    />
  );
}
