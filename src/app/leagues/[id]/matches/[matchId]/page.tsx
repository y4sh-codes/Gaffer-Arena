import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { simulateMatch } from "@/lib/simulator/match-engine";
import LiveMatchView from "@/components/simulator/LiveMatchView";
import { MatchLogPayload } from "@/types";

interface MatchDetailPageProps {
  params: Promise<{ id: string; matchId: string }>;
}

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { id: leagueId, matchId } = await params;

  let match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      homeTeam: true,
      awayTeam: true,
    },
  });

  if (!match || match.leagueId !== leagueId) {
    notFound();
  }

  let payload: MatchLogPayload;

  if (match.status === "PENDING" || !match.logData || match.logData === "[]") {
    // Run simulation
    payload = await simulateMatch(matchId);
    match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });
  } else {
    payload = JSON.parse(match.logData) as MatchLogPayload;
  }

  return <LiveMatchView match={match!} initialPayload={payload} />;
}
