"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function advanceSeasonAction(leagueId: string) {
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
    },
  });

  if (!league) throw new Error("League not found");

  const prizeMultipliers: Record<number, number> = {
    0: 1.50, // 1st Place: +50% budget
    1: 1.30, // 2nd Place: +30% budget
    2: 1.20, // 3rd Place: +20% budget
  };

  const updatedTeams: any[] = [];

  await prisma.$transaction(async (tx) => {
    // 1. Apply prize multipliers and reset match records
    for (let rank = 0; rank < league.teams.length; rank++) {
      const team = league.teams[rank];
      const multiplier = prizeMultipliers[rank] ?? 1.10; // 4th-16th: +10% budget
      const newBudget = Math.round(team.budget * multiplier);

      const updated = await tx.team.update({
        where: { id: team.id },
        data: {
          budget: newBudget,
          points: 0,
          matchesPlayed: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
        },
      });

      updatedTeams.push({
        teamName: team.teamName,
        rank: rank + 1,
        oldBudget: team.budget,
        newBudget,
        multiplierBonus: `${Math.round((multiplier - 1) * 100)}%`,
      });
    }

    // 2. Clear old matches to prepare for new season schedule
    await tx.match.deleteMany({
      where: { leagueId },
    });

    // 3. Increment season and transition to AUCTION for next draft
    await tx.league.update({
      where: { id: leagueId },
      data: {
        currentSeason: league.currentSeason + 1,
        status: "AUCTION",
      },
    });
  });

  try {
    revalidatePath(`/leagues/${leagueId}/standings`);
    revalidatePath(`/leagues/${leagueId}/auction`);
    revalidatePath("/dashboard");
  } catch {}

  return {
    success: true,
    newSeason: league.currentSeason + 1,
    summary: updatedTeams,
  };
}
