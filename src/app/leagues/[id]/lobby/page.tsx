import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUserOrGuest } from "@/lib/actions/league-actions";
import LeagueLobby from "@/components/league/LeagueLobby";

export const dynamic = "force-dynamic";

interface LobbyPageProps {
  params: Promise<{ id: string }>;
}

export default async function LobbyPage({ params }: LobbyPageProps) {
  const { id } = await params;
  const user = await getCurrentUserOrGuest();

  const league = await prisma.league.findUnique({
    where: { id },
    include: {
      teams: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!league) {
    notFound();
  }

  // If league is already in AUCTION or IN_SEASON, redirect directly
  if (league.status === "AUCTION") {
    redirect(`/leagues/${league.id}/auction`);
  } else if (league.status === "IN_SEASON") {
    redirect(`/leagues/${league.id}/team`);
  }

  const cleanLeague = {
    id: league.id,
    name: league.name,
    code: league.code,
    maxTeams: league.maxTeams,
    startingBudget: league.startingBudget,
    currentSeason: league.currentSeason,
    status: league.status,
    createdById: league.createdById,
    teams: league.teams.map((t) => ({
      id: t.id,
      userId: t.userId,
      teamName: t.teamName,
      managerName: t.managerName,
      budget: t.budget,
    })),
  };

  return <LeagueLobby league={cleanLeague} currentUserId={user.id || ""} />;
}
