import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUserOrGuest } from "@/lib/actions/league-actions";
import LeagueLobby from "@/components/league/LeagueLobby";

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

  return <LeagueLobby league={league} currentUserId={user.id} />;
}
