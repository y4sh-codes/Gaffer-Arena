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
  try {
    const session = await auth();
    if (session?.user) {
      const email = session.user.email?.trim().toLowerCase();
      const sessionUserId = session.user.id;

      let dbUser = null;

      // 1. Try to find user by session user ID
      if (sessionUserId) {
        dbUser = await prisma.user.findUnique({
          where: { id: sessionUserId },
        });
      }

      // 2. Try to find user by email
      if (!dbUser && email) {
        dbUser = await prisma.user.findUnique({
          where: { email },
        });
      }

      // 3. If found, ensure profile info is updated
      if (dbUser) {
        if (
          (session.user.name && dbUser.name !== session.user.name) ||
          (session.user.image && dbUser.image !== session.user.image)
        ) {
          dbUser = await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              name: session.user.name || dbUser.name,
              image: session.user.image || dbUser.image,
            },
          });
        }
        return dbUser;
      }

      // 4. If user not in DB yet (e.g. Google OAuth user), create them now
      const name = session.user.name || (email ? email.split("@")[0] : "Gaffer Boss");
      const image =
        session.user.image ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

      dbUser = await prisma.user.create({
        data: {
          ...(sessionUserId ? { id: sessionUserId } : {}),
          email: email || `user_${Date.now()}@arena.fc`,
          name,
          image,
        },
      });

      return dbUser;
    }
  } catch (e: unknown) {
    // If Next.js bails out for dynamic server usage (headers/cookies in RSC), re-throw so Next.js handles it properly
    if (
      e &&
      typeof e === "object" &&
      ("digest" in e && (e as { digest: unknown }).digest === "DYNAMIC_SERVER_USAGE")
    ) {
      throw e;
    }
    // Graceful fallback when invoked outside HTTP request scope (e.g. scripts/tests)
    if (e instanceof Error && !e.message.includes("outside a request scope")) {
      console.error("Error resolving session in getCurrentUserOrGuest:", e);
    }
  }

  // Fallback to demo default manager if not signed in or in standalone script
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
  try {
    const user = await getCurrentUserOrGuest();
    if (!user?.id) {
      return { success: false, error: "You must be logged in to create a league" };
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

    try {
      revalidatePath("/dashboard");
    } catch {}

    return { success: true, leagueId: league.id, code: league.code };
  } catch (err: unknown) {
    console.error("createLeagueAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create league. Please verify inputs.",
    };
  }
}

export async function joinLeagueAction(formData: {
  code: string;
  teamName: string;
  managerName: string;
}) {
  try {
    const user = await getCurrentUserOrGuest();
    if (!user?.id) {
      return { success: false, error: "You must be logged in to join a league" };
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

    try {
      revalidatePath(`/leagues/${league.id}/lobby`);
      revalidatePath("/dashboard");
    } catch {}

    return { success: true, leagueId: league.id };
  } catch (err: unknown) {
    console.error("joinLeagueAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to join league. Please verify code.",
    };
  }
}

export async function startAuctionAction(leagueId: string) {
  try {
    const user = await getCurrentUserOrGuest();
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: { teams: true },
    });

    if (!league) return { success: false, error: "League not found" };
    if (league.createdById !== user?.id) {
      return { success: false, error: "Only the league host can launch the auction" };
    }

    if (league.teams.length < 2) {
      return { success: false, error: "Need at least 2 teams to begin the auction draft" };
    }

    await prisma.league.update({
      where: { id: leagueId },
      data: { status: "AUCTION" },
    });

    try {
      revalidatePath(`/leagues/${leagueId}/lobby`);
    } catch {}
    return { success: true };
  } catch (err: unknown) {
    console.error("startAuctionAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to start auction",
    };
  }
}

export async function fillLobbyWithAITeamsAction(leagueId: string, count = 15) {
  try {
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: { teams: true },
    });

    if (!league) return { success: false, error: "League not found" };

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

    // Create a shared bot user if needed
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

    try {
      revalidatePath(`/leagues/${leagueId}/lobby`);
    } catch {}
    return { success: true, added: toAdd };
  } catch (err: unknown) {
    console.error("fillLobbyWithAITeamsAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to add AI teams",
    };
  }
}
