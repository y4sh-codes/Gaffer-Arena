import { MatchLogPayload } from "@/types";

export interface GoldenBootEntry {
  playerId: string;
  playerName: string;
  teamName: string;
  goals: number;
}

export interface GoldenGloveEntry {
  playerId: string;
  playerName: string;
  teamName: string;
  cleanSheets: number;
}

export interface MVPEntry {
  playerId: string;
  playerName: string;
  teamName: string;
  averageRating: number;
  motmCount: number;
}

export interface TOTWPlayer {
  playerId: string;
  name: string;
  ovr: number;
  pos: string;
  team: string;
  rating: number;
}

export function computeLeagueStats(
  matches: Array<{
    homeGoals: number;
    awayGoals: number;
    status: string;
    logData: string;
    homeTeam: { id: string; teamName: string };
    awayTeam: { id: string; teamName: string };
  }>
) {
  const goalMap = new Map<string, { playerName: string; teamName: string; goals: number }>();
  const cleanSheetMap = new Map<string, { playerName: string; teamName: string; cleanSheets: number }>();
  const motmMap = new Map<string, { playerName: string; teamName: string; motmCount: number; ratings: number[] }>();

  for (const m of matches) {
    if (m.status !== "FINISHED" || !m.logData || m.logData === "[]") continue;

    try {
      const payload: MatchLogPayload = JSON.parse(m.logData);

      // 1. Goal Scorers
      for (const ev of payload.events) {
        if (ev.type === "GOAL" && ev.playerId && ev.playerName) {
          const curr = goalMap.get(ev.playerId) || {
            playerName: ev.playerName,
            teamName: ev.teamName,
            goals: 0,
          };
          curr.goals++;
          goalMap.set(ev.playerId, curr);
        }
      }

      // 2. Clean Sheets
      if (m.awayGoals === 0) {
        const homeGKId = `gk-${m.homeTeam.id}`;
        const curr = cleanSheetMap.get(homeGKId) || {
          playerName: `${m.homeTeam.teamName} Keeper`,
          teamName: m.homeTeam.teamName,
          cleanSheets: 0,
        };
        curr.cleanSheets++;
        cleanSheetMap.set(homeGKId, curr);
      }
      if (m.homeGoals === 0) {
        const awayGKId = `gk-${m.awayTeam.id}`;
        const curr = cleanSheetMap.get(awayGKId) || {
          playerName: `${m.awayTeam.teamName} Keeper`,
          teamName: m.awayTeam.teamName,
          cleanSheets: 0,
        };
        curr.cleanSheets++;
        cleanSheetMap.set(awayGKId, curr);
      }

      // 3. MOTM & Ratings
      if (payload.manOfTheMatch?.playerId) {
        const motm = payload.manOfTheMatch;
        const curr = motmMap.get(motm.playerId) || {
          playerName: motm.playerName,
          teamName: motm.teamName,
          motmCount: 0,
          ratings: [],
        };
        curr.motmCount++;
        curr.ratings.push(motm.rating);
        motmMap.set(motm.playerId, curr);
      }
    } catch (e) {
      // Ignore JSON parse error
    }
  }

  // Golden Boot Top 5
  const goldenBoot: GoldenBootEntry[] = Array.from(goalMap.entries())
    .map(([playerId, val]) => ({
      playerId,
      playerName: val.playerName,
      teamName: val.teamName,
      goals: val.goals,
    }))
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 5);

  // Golden Glove Top 5
  const goldenGlove: GoldenGloveEntry[] = Array.from(cleanSheetMap.entries())
    .map(([playerId, val]) => ({
      playerId,
      playerName: val.playerName,
      teamName: val.teamName,
      cleanSheets: val.cleanSheets,
    }))
    .sort((a, b) => b.cleanSheets - a.cleanSheets)
    .slice(0, 5);

  // MVP Leaderboard Top 5
  const mvpLeaderboard: MVPEntry[] = Array.from(motmMap.entries())
    .map(([playerId, val]) => {
      const avg = val.ratings.reduce((a, b) => a + b, 0) / val.ratings.length;
      return {
        playerId,
        playerName: val.playerName,
        teamName: val.teamName,
        averageRating: Number(avg.toFixed(1)),
        motmCount: val.motmCount,
      };
    })
    .sort((a, b) => b.motmCount - a.motmCount || b.averageRating - a.averageRating)
    .slice(0, 5);

  return {
    goldenBoot,
    goldenGlove,
    mvpLeaderboard,
  };
}
