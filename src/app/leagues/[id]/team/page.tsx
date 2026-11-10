import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUserOrGuest } from "@/lib/actions/league-actions";
import TeamHubClient from "./TeamHubClient";

export const dynamic = "force-dynamic";

interface TeamHubPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamHubPage({ params }: TeamHubPageProps) {
  const { id: leagueId } = await params;
  const user = await getCurrentUserOrGuest();

  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: {
      teams: {
        include: {
          players: {
            include: { player: true },
          },
        },
      },
    },
  });

  if (!league) notFound();

  // Find user's team or fallback to first team
  const team = league.teams.find((t) => t.userId === user.id) || league.teams[0];

  if (!team) notFound();

  return <TeamHubClient league={league} team={team} />;
}
