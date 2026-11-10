"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveTeamTacticsAction(payload: {
  teamId: string;
  formation: string;
  starters: Array<{
    teamPlayerId: string;
    positionOnField: string;
    playerRole: string;
  }>;
  reserves: Array<{
    teamPlayerId: string;
  }>;
  mentality?: string;
  defensiveDepth?: number;
}) {
  const { teamId, formation, starters, reserves } = payload;

  await prisma.$transaction(async (tx) => {
    // 1. Update team formation
    await tx.team.update({
      where: { id: teamId },
      data: { formation },
    });

    // 2. Mark starters
    for (const starter of starters) {
      await tx.teamPlayer.update({
        where: { id: starter.teamPlayerId },
        data: {
          isStarter: true,
          positionOnField: starter.positionOnField,
          playerRole: starter.playerRole,
        },
      });
    }

    // 3. Mark reserves
    for (const res of reserves) {
      await tx.teamPlayer.update({
        where: { id: res.teamPlayerId },
        data: {
          isStarter: false,
          positionOnField: null,
          playerRole: null,
        },
      });
    }
  });

  try {
    revalidatePath(`/leagues/[id]/team`);
  } catch {}
  return { success: true };
}
