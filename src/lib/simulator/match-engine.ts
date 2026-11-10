import prisma from "@/lib/prisma";
import { MatchEvent, MatchLogPayload, MatchSimulationStats } from "@/types";

// Simple deterministic PRNG seeded by string
function seededRandom(seed: string) {
  let h = 0xdeadbeef;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h >>> 0) / 4294967296);
  };
}

export async function simulateMatch(matchId: string): Promise<MatchLogPayload> {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      league: true,
      homeTeam: {
        include: {
          players: { include: { player: true } },
        },
      },
      awayTeam: {
        include: {
          players: { include: { player: true } },
        },
      },
    },
  });

  if (!match) throw new Error("Match not found");

  const rand = seededRandom(`${match.id}-${match.leagueId}-${match.matchday}`);

  const homeStarters = match.homeTeam.players.filter((p) => p.isStarter);
  const awayStarters = match.awayTeam.players.filter((p) => p.isStarter);

  // Fallback to all squad players if starters aren't marked
  const homeXI = homeStarters.length >= 7 ? homeStarters : match.homeTeam.players.slice(0, 11);
  const awayXI = awayStarters.length >= 7 ? awayStarters : match.awayTeam.players.slice(0, 11);

  // 1. Home Ground Advantage: +7% base rating boost
  const HGA_MULTIPLIER = 1.07;

  // 2. Compute Base Sector Ratings
  const getSectorAvg = (players: typeof homeXI, posList: string[], statFn: (p: any) => number) => {
    const subset = players.filter((p) => posList.includes(p.player.pos));
    const target = subset.length > 0 ? subset : players;
    return target.reduce((acc, p) => acc + statFn(p.player), 0) / target.length;
  };

  const homeAtt = getSectorAvg(homeXI, ["ST", "CF", "LW", "RW"], (p) => (p.att * 0.5 + p.spe * 0.3 + p.dri * 0.2)) * HGA_MULTIPLIER;
  const homeMid = getSectorAvg(homeXI, ["CM", "CAM", "CDM"], (p) => (p.pas * 0.4 + p.dri * 0.3 + p.def * 0.3)) * HGA_MULTIPLIER;
  const homeDef = getSectorAvg(homeXI, ["CB", "LB", "RB", "GK"], (p) => (p.def * 0.5 + p.phy * 0.3 + p.spe * 0.2)) * HGA_MULTIPLIER;

  const awayAtt = getSectorAvg(awayXI, ["ST", "CF", "LW", "RW"], (p) => (p.att * 0.5 + p.spe * 0.3 + p.dri * 0.2));
  const awayMid = getSectorAvg(awayXI, ["CM", "CAM", "CDM"], (p) => (p.pas * 0.4 + p.dri * 0.3 + p.def * 0.3));
  const awayDef = getSectorAvg(awayXI, ["CB", "LB", "RB", "GK"], (p) => (p.def * 0.5 + p.phy * 0.3 + p.spe * 0.2));

  // 3. Form Factor: recent points momentum
  const homeFormMultiplier = 1.0 + (match.homeTeam.points / Math.max(1, match.homeTeam.matchesPlayed * 3) - 0.5) * 0.08;
  const awayFormMultiplier = 1.0 + (match.awayTeam.points / Math.max(1, match.awayTeam.matchesPlayed * 3) - 0.5) * 0.08;

  // 4. Tactical Clash Factor
  let homeTacticalBoost = 1.0;
  let awayTacticalBoost = 1.0;
  if (match.homeTeam.formation === "4-3-3" && match.awayTeam.formation === "3-5-2") {
    homeTacticalBoost += 0.05; // 4-3-3 wingers exploit space behind 3-5-2 wingbacks
  } else if (match.awayTeam.formation === "4-2-3-1" && match.homeTeam.formation === "4-4-2") {
    awayTacticalBoost += 0.04; // 4-2-3-1 CAM overloads central midfield duo
  }

  const finalHomePower = ((homeAtt * 0.4 + homeMid * 0.35 + homeDef * 0.25) * homeFormMultiplier * homeTacticalBoost);
  const finalAwayPower = ((awayAtt * 0.4 + awayMid * 0.35 + awayDef * 0.25) * awayFormMultiplier * awayTacticalBoost);

  // 5. Simulate Minute-by-Minute Timeline Events (1' to 90')
  const events: MatchEvent[] = [];
  let homeScore = 0;
  let awayScore = 0;

  let homeShots = 0;
  let awayShots = 0;
  let homeShotsOnTarget = 0;
  let awayShotsOnTarget = 0;
  let homeFouls = 0;
  let awayFouls = 0;
  let homeCorners = 0;
  let awayCorners = 0;

  const homeForwards = homeXI.filter((p) => ["ST", "CF", "LW", "RW"].includes(p.player.pos));
  const awayForwards = awayXI.filter((p) => ["ST", "CF", "LW", "RW"].includes(p.player.pos));
  const homeAttackers = homeForwards.length > 0 ? homeForwards : homeXI;
  const awayAttackers = awayForwards.length > 0 ? awayForwards : awayXI;

  const homeGK = homeXI.find((p) => p.player.pos === "GK") || homeXI[0];
  const awayGK = awayXI.find((p) => p.player.pos === "GK") || awayXI[0];

  for (let minute = 1; minute <= 90; minute++) {
    const chanceRoll = rand();

    // Key match incident check ~12-16 incidents per game
    if (chanceRoll < 0.16) {
      const isHomeAttacking = rand() < (finalHomePower / (finalHomePower + finalAwayPower));
      const attackingTeam = isHomeAttacking ? match.homeTeam : match.awayTeam;
      const defendingTeam = isHomeAttacking ? match.awayTeam : match.homeTeam;
      const attackers = isHomeAttacking ? homeAttackers : awayAttackers;
      const oppGK = isHomeAttacking ? awayGK : homeGK;

      const randomAttacker = attackers[Math.floor(rand() * attackers.length)];
      const incidentRoll = rand();

      if (isHomeAttacking) homeShots++;
      else awayShots++;

      // Goal scoring check
      // Traits influence: "Power Shot+", "Finesse Shot+" boost conversion
      const hasShootingTrait = randomAttacker.player.playstyle?.includes("Shot") || randomAttacker.player.traits?.includes("Finisher");
      const conversionThreshold = hasShootingTrait ? 0.32 : 0.24;

      if (incidentRoll < conversionThreshold) {
        if (isHomeAttacking) {
          homeScore++;
          homeShotsOnTarget++;
        } else {
          awayScore++;
          awayShotsOnTarget++;
        }

        events.push({
          minute,
          type: "GOAL",
          teamId: attackingTeam.id,
          teamName: attackingTeam.teamName,
          playerId: randomAttacker.player.id,
          playerName: randomAttacker.player.name,
          description: `GOAL! ${randomAttacker.player.name} fires clinical strike into the bottom corner! (${randomAttacker.player.playstyle})`,
          homeScore,
          awayScore,
        });
      } else if (incidentRoll < 0.58) {
        // Great Save
        if (isHomeAttacking) homeShotsOnTarget++;
        else awayShotsOnTarget++;

        events.push({
          minute,
          type: "GREAT_SAVE",
          teamId: defendingTeam.id,
          teamName: defendingTeam.teamName,
          playerId: oppGK.player.id,
          playerName: oppGK.player.name,
          description: `Tremendous diving save by ${oppGK.player.name} denying ${randomAttacker.player.name}'s point-blank effort!`,
          homeScore,
          awayScore,
        });
      } else if (incidentRoll < 0.70) {
        // Woodwork
        events.push({
          minute,
          type: "WOODWORK",
          teamId: attackingTeam.id,
          teamName: attackingTeam.teamName,
          playerId: randomAttacker.player.id,
          playerName: randomAttacker.player.name,
          description: `Rattles the crossbar! Thunderous strike from ${randomAttacker.player.name} rebounds off the woodwork!`,
          homeScore,
          awayScore,
        });
      } else if (incidentRoll < 0.85) {
        // Corner Kick
        if (isHomeAttacking) homeCorners++;
        else awayCorners++;
      } else {
        // Foul / Card
        if (isHomeAttacking) awayFouls++;
        else homeFouls++;

        if (rand() < 0.35) {
          const cardType = rand() < 0.05 ? "RED_CARD" : "YELLOW_CARD";
          const defendingXI = isHomeAttacking ? awayXI : homeXI;
          const culprit = defendingXI[Math.floor(rand() * defendingXI.length)];

          events.push({
            minute,
            type: cardType,
            teamId: defendingTeam.id,
            teamName: defendingTeam.teamName,
            playerId: culprit.player.id,
            playerName: culprit.player.name,
            description: `${cardType === "RED_CARD" ? "RED CARD!" : "Yellow card."} Cynical foul by ${culprit.player.name} stopping dangerous counter attack.`,
            homeScore,
            awayScore,
          });
        }
      }
    }
  }

  // Possession calculation
  const totalPower = finalHomePower + finalAwayPower;
  const homePossession = Math.round((finalHomePower / totalPower) * 100);
  const awayPossession = 100 - homePossession;

  // Man of the Match
  const scoringEvents = events.filter((e) => e.type === "GOAL");
  let motmPlayer = homeAttackers[0];
  let motmTeamName = match.homeTeam.teamName;

  if (scoringEvents.length > 0) {
    const topScorerEvent = scoringEvents[scoringEvents.length - 1];
    motmTeamName = topScorerEvent.teamName;
    const found = [...homeXI, ...awayXI].find((p) => p.player.id === topScorerEvent.playerId);
    if (found) motmPlayer = found;
  }

  const payload: MatchLogPayload = {
    events,
    stats: {
      homeShots,
      awayShots,
      homeShotsOnTarget,
      awayShotsOnTarget,
      homePossession,
      awayPossession,
      homeFouls,
      awayFouls,
      homeCorners,
      awayCorners,
    },
    homeRating: Math.round(finalHomePower),
    awayRating: Math.round(finalAwayPower),
    manOfTheMatch: {
      playerId: motmPlayer.player.id,
      playerName: motmPlayer.player.name,
      rating: 9.2,
      teamName: motmTeamName,
    },
  };

  // Update Database records atomically
  await prisma.$transaction(async (tx) => {
    // 1. Update Match record
    await tx.match.update({
      where: { id: matchId },
      data: {
        homeGoals: homeScore,
        awayGoals: awayScore,
        status: "FINISHED",
        logData: JSON.stringify(payload),
      },
    });

    // 2. Update Home Team league standings stats
    const homeWon = homeScore > awayScore;
    const isDraw = homeScore === awayScore;
    const homeLost = homeScore < awayScore;

    await tx.team.update({
      where: { id: match.homeTeamId },
      data: {
        matchesPlayed: { increment: 1 },
        won: { increment: homeWon ? 1 : 0 },
        drawn: { increment: isDraw ? 1 : 0 },
        lost: { increment: homeLost ? 1 : 0 },
        goalsFor: { increment: homeScore },
        goalsAgainst: { increment: awayScore },
        goalDifference: { increment: homeScore - awayScore },
        points: { increment: homeWon ? 3 : isDraw ? 1 : 0 },
      },
    });

    // 3. Update Away Team league standings stats
    await tx.team.update({
      where: { id: match.awayTeamId },
      data: {
        matchesPlayed: { increment: 1 },
        won: { increment: homeLost ? 1 : 0 },
        drawn: { increment: isDraw ? 1 : 0 },
        lost: { increment: homeWon ? 1 : 0 },
        goalsFor: { increment: awayScore },
        goalsAgainst: { increment: homeScore },
        goalDifference: { increment: awayScore - homeScore },
        points: { increment: homeLost ? 3 : isDraw ? 1 : 0 },
      },
    });
  });

  return payload;
}
