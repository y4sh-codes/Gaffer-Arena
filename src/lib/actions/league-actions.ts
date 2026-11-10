"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function generateUniqueCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function getCurrentUserOrGuest() {
  const session = await auth();
  if (session?.user?.id) {
    return session.user;
  }

  // Fallback to demo default manager if not signed in
  let demoUser = await prisma.user.findFirst({
    where: { email: "gaffer@arena.fc" },
  });

  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        email: "gaffer@arena.fc",
        name: "Pep Gaffer",
        image: "https://api.dicebear.com/7.x/bottts/svg?seed=PepGaffer",
      },
    });
  }

  return demoUser;
}

export async function createLeagueAction(formData: {
  name: string;
  startingBudget: number;
  teamName: string;
  managerName: string;
}) {
  const user = await getCurrentUserOrGuest();
  if (!user?.id) {
    throw new Error("You must be logged in to create a league");
  }

  const leagueName = formData.name?.trim() || "Champions Super League";
  const budget = Number(formData.startingBudget) || 250000000;
  const teamName = formData.teamName?.trim() || "Apex Galacticos";
  const managerName = formData.managerName?.trim() || user.name || "Gaffer Boss";

  let code = generateUniqueCode();
  let existing = await prisma.league.findUnique({ where: { code } });
  while (existing) {
    code = generateUniqueCode();
    existing = await prisma.league.findUnique({ where: { code } });
  }

  const league = await prisma.league.create({
    data: {
      name: leagueName,
      code,
      startingBudget: budget,
      maxTeams: 16,
      currentSeason: 1,
      status: "DRAFT",
      createdById: user.id,
      teams: {
        create: {
          userId: user.id,
          teamName,
          managerName,
          budget,
          formation: "4-3-3",
        },
      },
    },
    include: {
      teams: true,
    },
  });

  revalidatePath("/dashboard");
  return { success: true, leagueId: league.id, code: league.code };
}

export async function joinLeagueAction(formData: {
  code: string;
  teamName: string;
  managerName: string;
}) {
  const user = await getCurrentUserOrGuest();
  if (!user?.id) {
    throw new Error("You must be logged in to join a league");
  }

  const cleanCode = formData.code.trim().toUpperCase();
  const teamName = formData.teamName?.trim() || "Royal Dynamos";
  const managerName = formData.managerName?.trim() || user.name || "Manager Pro";

  const league = await prisma.league.findUnique({
    where: { code: cleanCode },
    include: { teams: true },
  });

  if (!league) {
    return { success: false, error: "League code not found" };
  }

  if (league.status !== "DRAFT") {
    return { success: false, error: "League is already underway or completed" };
  }

  if (league.teams.length >= league.maxTeams) {
    return { success: false, error: `League is already full (maximum ${league.maxTeams} teams allowed)` };
  }

  // Check if user already has a team in this league
  const existingTeam = league.teams.find((t) => t.userId === user.id);
  if (existingTeam) {
    return { success: true, leagueId: league.id, alreadyJoined: true };
  }

  await prisma.team.create({
    data: {
      leagueId: league.id,
      userId: user.id,
      teamName,
      managerName,
      budget: league.startingBudget,
      formation: "4-3-3",
    },
  });

  revalidatePath(`/leagues/${league.id}/lobby`);
  revalidatePath("/dashboard");
  return { success: true, leagueId: league.id };
}

export async function startAuctionAction(leagueId: string) {
  const user = await getCurrentUserOrGuest();
  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: { teams: true },
  });

  if (!league) throw new Error("League not found");
  if (league.createdById !== user?.id) {
    throw new Error("Only the league host can launch the auction");
  }

  if (league.teams.length < 2) {
    throw new Error("Need at least 2 teams to begin the auction draft");
  }

  await prisma.league.update({
    where: { id: leagueId },
    data: { status: "AUCTION" },
  });

  revalidatePath(`/leagues/${leagueId}/lobby`);
  return { success: true };
}

export async function fillLobbyWithAITeamsAction(leagueId: string, count = 15) {
  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: { teams: true },
  });

  if (!league) throw new Error("League not found");

  const aiClubs = [
    { team: "Red Star Athletic", manager: "Jürgen K." },
    { team: "Titan Football Club", manager: "Carlo A." },
    { team: "Vanguard United", manager: "Mikel A." },
    { team: "Metropolis FC", manager: "Simone I." },
    { team: "Catalan Kings", manager: "Hansi F." },
    { team: "Merseyside Phoenix", manager: "Arne S." },
    { team: "Bavarian Titans", manager: "Vincent K." },
    { team: "Olympique Prestige", manager: "Luis E." },
    { team: "Madrid Royal", manager: "Zinedine Z." },
    { team: "Lisbon Lions", manager: "Rúben A." },
    { team: "Amsterdam Velocity", manager: "Erik T." },
    { team: "Milan Rossoneri", manager: "Stefano P." },
    { team: "Turin Zebras", manager: "Thiago M." },
    { team: "London Gunners", manager: "Arsène W." },
    { team: "Porto Dragons", manager: "José M." },
  ];

  // Create a shared or mock bot user if needed
  let botUser = await prisma.user.findFirst({
    where: { email: "ai-managers@arena.fc" },
  });

  if (!botUser) {
    botUser = await prisma.user.create({
      data: {
        email: "ai-managers@arena.fc",
        name: "AI Rival Manager Syndicate",
        image: "https://api.dicebear.com/7.x/bottts/svg?seed=AIGaffer",
      },
    });
  }

  const slotsAvailable = league.maxTeams - league.teams.length;
  const toAdd = Math.min(count, slotsAvailable);

  for (let i = 0; i < toAdd; i++) {
    const aiData = aiClubs[i % aiClubs.length];
    await prisma.team.create({
      data: {
        leagueId: league.id,
        userId: botUser.id,
        teamName: `${aiData.team}`,
        managerName: `${aiData.manager}`,
        budget: league.startingBudget,
        formation: "4-3-3",
      },
    });
  }

  revalidatePath(`/leagues/${leagueId}/lobby`);
  return { success: true, added: toAdd };
}
