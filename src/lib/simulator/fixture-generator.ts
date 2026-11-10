import prisma from "@/lib/prisma";

export async function generateDoubleRoundRobinSchedule(leagueId: string) {
  // Check if matches already exist
  const existingMatches = await prisma.match.count({
    where: { leagueId },
  });

  if (existingMatches > 0) {
    return { success: true, count: existingMatches, message: "Fixtures already generated" };
  }

  const teams = await prisma.team.findMany({
    where: { leagueId },
    orderBy: { createdAt: "asc" },
  });

  if (teams.length < 2) {
    throw new Error("Need at least 2 teams to generate fixture schedule");
  }

  const teamIds = teams.map((t) => t.id);
  // If odd number of teams, add a dummy/bye team
  const isOdd = teamIds.length % 2 !== 0;
  const list = isOdd ? [...teamIds, "BYE"] : [...teamIds];
  const n = list.length;
  const rounds = n - 1;
  const matchesPerRound = n / 2;

  const firstHalfMatches: Array<{
    matchday: number;
    homeTeamId: string;
    awayTeamId: string;
  }> = [];

  // Round robin rotation algorithm
  const currentList = [...list];
  for (let round = 0; round < rounds; round++) {
    for (let match = 0; match < matchesPerRound; match++) {
      const home = currentList[match];
      const away = currentList[n - 1 - match];

      if (home !== "BYE" && away !== "BYE") {
        // Alternate home/away each round for balance
        if (round % 2 === 1) {
          firstHalfMatches.push({
            matchday: round + 1,
            homeTeamId: away,
            awayTeamId: home,
          });
        } else {
          firstHalfMatches.push({
            matchday: round + 1,
            homeTeamId: home,
            awayTeamId: away,
          });
        }
      }
    }

    // Rotate elements except first
    const fixed = currentList[0];
    const rest = currentList.slice(1);
    rest.unshift(rest.pop()!);
    currentList.splice(0, n, fixed, ...rest);
  }

  // Second half of the season: reverse home and away fixtures
  const secondHalfMatches = firstHalfMatches.map((m) => ({
    matchday: m.matchday + rounds,
    homeTeamId: m.awayTeamId,
    awayTeamId: m.homeTeamId,
  }));

  const allFixtures = [...firstHalfMatches, ...secondHalfMatches];

  // Bulk create in database
  for (const f of allFixtures) {
    await prisma.match.create({
      data: {
        leagueId,
        matchday: f.matchday,
        homeTeamId: f.homeTeamId,
        awayTeamId: f.awayTeamId,
        status: "PENDING",
      },
    });
  }

  return { success: true, count: allFixtures.length };
}
