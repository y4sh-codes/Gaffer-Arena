import prisma from "@/lib/prisma";
import { AuctionPlayerState } from "@/types";

interface AuctionMemoryState {
  leagueId: string;
  playerBag: any[];
  currentIndex: number;
  currentBid: number;
  highestBidderTeamId: string | null;
  highestBidderTeamName: string | null;
  highestBidderUserId: string | null;
  timeLeftSeconds: number;
  status: "ACTIVE" | "SOLD" | "UNSOLD" | "COMPLETED";
  skippedTeamIds: string[];
  lastBidTimestamp: number;
  bidHistory: Array<{
    teamId: string;
    teamName: string;
    amount: number;
    timestamp: number;
  }>;
}

// Global in-memory auction registry for real-time state synchronization
const auctionRegistry = new Map<string, AuctionMemoryState>();

const MIN_PLAYER_SLOT_RESERVE = 1000000; // $1M minimum reserved per mandatory empty squad slot (up to 16)
const SQUAD_MIN_PLAYERS = 16;
const SQUAD_MAX_PLAYERS = 21;

export async function getOrInitializeAuction(leagueId: string): Promise<AuctionMemoryState> {
  let state = auctionRegistry.get(leagueId);

  if (!state) {
    // 1. Fetch league and its teams
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        teams: {
          include: {
            players: true,
          },
        },
      },
    });

    if (!league) throw new Error("League not found");

    // 2. Fetch all 85+ players from database
    const allPlayers = await prisma.player.findMany({
      where: { ovr: { gte: 85 } },
      orderBy: { ovr: "desc" },
    });

    // 3. Balance players across FW, WINGER, MID, DEF, GK
    const fw = allPlayers.filter((p) => p.pos === "ST" || p.pos === "CF");
    const wingers = allPlayers.filter((p) => p.pos === "RW" || p.pos === "LW" || p.pos === "RM" || p.pos === "LM");
    const mids = allPlayers.filter((p) => p.pos === "CM" || p.pos === "CAM" || p.pos === "CDM");
    const defs = allPlayers.filter((p) => p.pos === "CB" || p.pos === "LB" || p.pos === "RB" || p.pos === "LWB" || p.pos === "RWB");
    const gks = allPlayers.filter((p) => p.pos === "GK");

    // Interleave positions to ensure balanced draft order
    const balancedBag: any[] = [];
    const maxLen = Math.max(fw.length, wingers.length, mids.length, defs.length, gks.length);

    for (let i = 0; i < maxLen; i++) {
      if (fw[i]) balancedBag.push(fw[i]);
      if (defs[i]) balancedBag.push(defs[i]);
      if (mids[i]) balancedBag.push(mids[i]);
      if (wingers[i]) balancedBag.push(wingers[i]);
      if (gks[i % gks.length]) balancedBag.push(gks[i % gks.length]);
      if (balancedBag.length >= 400) break;
    }

    // Fill up to 400 if needed from remaining
    for (const p of allPlayers) {
      if (balancedBag.length >= 400) break;
      if (!balancedBag.some((b) => b.id === p.id)) {
        balancedBag.push(p);
      }
    }

    // Determine initial starting bid for first player
    const firstPlayer = balancedBag[0];
    const initialBid = firstPlayer ? calculateStartingBid(firstPlayer.ovr) : 10000000;

    // A league that already left the auction phase should never re-open bidding
    // just because the in-memory registry was cleared (e.g. server restart).
    const initialStatus =
      league.status === "IN_SEASON" || league.status === "COMPLETED" ? "COMPLETED" : "ACTIVE";

    state = {
      leagueId,
      playerBag: balancedBag,
      currentIndex: 0,
      currentBid: initialBid,
      highestBidderTeamId: null,
      highestBidderTeamName: null,
      highestBidderUserId: null,
      timeLeftSeconds: initialStatus === "COMPLETED" ? 0 : 20,
      status: initialStatus,
      skippedTeamIds: [],
      lastBidTimestamp: Date.now(),
      bidHistory: [],
    };

    auctionRegistry.set(leagueId, state);
  }

  return state;
}

export function calculateStartingBid(ovr: number): number {
  if (ovr >= 93) return 25000000; // $25M for all-time icons/superstars
  if (ovr >= 90) return 18000000; // $18M for elite top tier
  if (ovr >= 88) return 12000000; // $12M
  if (ovr >= 86) return 8000000;  // $8M
  return 5000000;                 // $5M for 85 OVR
}

export async function placeBid(
  leagueId: string,
  teamId: string,
  increment: number
): Promise<{ success: boolean; error?: string; state?: any }> {
  const state = await getOrInitializeAuction(leagueId);

  if (state.status !== "ACTIVE") {
    return { success: false, error: "Auction is not currently active for bidding" };
  }

  // Fetch team
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { players: true },
  });

  if (!team) return { success: false, error: "Team not found" };

  // Rule 1: Squad maximum 21 players
  if (team.players.length >= SQUAD_MAX_PLAYERS) {
    return {
      success: false,
      error: `Maximum squad limit reached (${SQUAD_MAX_PLAYERS} players). Cannot acquire more players.`,
    };
  }

  const newBid = state.highestBidderTeamId ? state.currentBid + increment : state.currentBid;

  // Rule 2: Minimum squad reserve constraint (16 players minimum)
  // Team must preserve at least $1M for every empty mandatory squad slot
  const currentSquadCount = team.players.length;
  const remainingMandatorySlots = Math.max(0, SQUAD_MIN_PLAYERS - (currentSquadCount + 1));
  const requiredReserve = remainingMandatorySlots * MIN_PLAYER_SLOT_RESERVE;

  if (team.budget - newBid < requiredReserve) {
    return {
      success: false,
      error: `Insufficient budget! You must reserve at least $${(requiredReserve / 1000000).toFixed(1)}M to fill your remaining mandatory ${remainingMandatorySlots} squad slots.`,
    };
  }

  // Update auction state
  state.currentBid = newBid;
  state.highestBidderTeamId = team.id;
  state.highestBidderTeamName = team.teamName;
  state.highestBidderUserId = team.userId;
  // Dynamic 20s clock reset on valid bid
  state.timeLeftSeconds = 20;
  state.lastBidTimestamp = Date.now();
  // Clear skips since a new high bid was made
  state.skippedTeamIds = [];

  state.bidHistory.unshift({
    teamId: team.id,
    teamName: team.teamName,
    amount: newBid,
    timestamp: Date.now(),
  });

  return { success: true, state: formatAuctionState(state) };
}

export async function skipPlayer(
  leagueId: string,
  teamId: string
): Promise<{ success: boolean; state?: any; resolved?: boolean }> {
  const state = await getOrInitializeAuction(leagueId);

  if (!state.skippedTeamIds.includes(teamId)) {
    state.skippedTeamIds.push(teamId);
  }

  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: { teams: true },
  });

  const totalTeams = league?.teams.length || 16;

  // If all teams skipped, resolve immediately
  if (state.skippedTeamIds.length >= totalTeams) {
    await resolveAuctionTimerExpiry(leagueId);
    return { success: true, state: formatAuctionState(state), resolved: true };
  }

  return { success: true, state: formatAuctionState(state), resolved: false };
}

async function allTeamsReachedMaxSquad(leagueId: string): Promise<boolean> {
  const teams = await prisma.team.findMany({
    where: { leagueId },
    select: { _count: { select: { players: true } } },
  });

  return (
    teams.length > 0 &&
    teams.every((team) => team._count.players >= SQUAD_MAX_PLAYERS)
  );
}

export async function resolveAuctionTimerExpiry(leagueId: string): Promise<AuctionMemoryState> {
  const state = await getOrInitializeAuction(leagueId);
  if (state.status === "COMPLETED") return state;

  const currentPlayer = state.playerBag[state.currentIndex];

  if (state.highestBidderTeamId && currentPlayer) {
    // Player Sold
    state.status = "SOLD";

    // Deduct budget & assign player to team
    await prisma.$transaction(async (tx) => {
      await tx.team.update({
        where: { id: state.highestBidderTeamId! },
        data: {
          budget: { decrement: state.currentBid },
        },
      });

      const teamPlayersCount = await tx.teamPlayer.count({
        where: { teamId: state.highestBidderTeamId! },
      });

      await tx.teamPlayer.create({
        data: {
          teamId: state.highestBidderTeamId!,
          playerId: currentPlayer.id,
          purchasePrice: state.currentBid,
          isStarter: teamPlayersCount < 11,
          positionOnField: currentPlayer.pos,
          playerRole: "Standard",
        },
      });
    });
  } else {
    // Player Unsold
    state.status = "UNSOLD";
  }

  // Advance to next player
  state.currentIndex++;

  // The auction also ends as soon as every franchise has filled its 21-player squad
  const squadsFull = await allTeamsReachedMaxSquad(leagueId);

  if (squadsFull || state.currentIndex >= state.playerBag.length) {
    state.status = "COMPLETED";
    state.timeLeftSeconds = 0;
    await prisma.league.update({
      where: { id: leagueId },
      data: { status: "IN_SEASON" },
    });
    return state;
  }

  const nextPlayer = state.playerBag[state.currentIndex];
  state.currentBid = calculateStartingBid(nextPlayer.ovr);
  state.highestBidderTeamId = null;
  state.highestBidderTeamName = null;
  state.highestBidderUserId = null;
  state.timeLeftSeconds = 20;
  state.status = "ACTIVE";
  state.skippedTeamIds = [];
  state.bidHistory = [];
  state.lastBidTimestamp = Date.now();

  return state;
}

export async function endAuctionByCreator(
  leagueId: string,
  userId: string
): Promise<{ success: boolean; error?: string; state?: any }> {
  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    select: { createdById: true },
  });

  if (!league) return { success: false, error: "League not found" };
  if (league.createdById !== userId) {
    return { success: false, error: "Only the league creator can end the auction" };
  }

  const state = await getOrInitializeAuction(leagueId);
  state.status = "COMPLETED";
  state.timeLeftSeconds = 0;

  await prisma.league.update({
    where: { id: leagueId },
    data: { status: "IN_SEASON" },
  });

  return { success: true, state: formatAuctionState(state) };
}

export function markAuctionCompletedIfActive(leagueId: string) {
  const state = auctionRegistry.get(leagueId);
  if (state) {
    state.status = "COMPLETED";
    state.timeLeftSeconds = 0;
  }
}

export function formatAuctionState(state: AuctionMemoryState) {
  const currentPlayer = state.playerBag[state.currentIndex] || null;

  return {
    leagueId: state.leagueId,
    currentIndex: state.currentIndex,
    totalPlayersInBag: state.playerBag.length,
    currentPlayer: currentPlayer
      ? {
          id: currentPlayer.id,
          externalFifaId: currentPlayer.externalFifaId,
          name: currentPlayer.name,
          ovr: currentPlayer.ovr,
          pos: currentPlayer.pos,
          cardYear: currentPlayer.cardYear,
          nationality: currentPlayer.nationality,
          league: currentPlayer.league,
          team: currentPlayer.team,
          att: currentPlayer.att,
          def: currentPlayer.def,
          pas: currentPlayer.pas,
          phy: currentPlayer.phy,
          dri: currentPlayer.dri,
          spe: currentPlayer.spe,
          traits: typeof currentPlayer.traits === "string" ? JSON.parse(currentPlayer.traits) : currentPlayer.traits,
          playstyle: currentPlayer.playstyle,
          bio20Words: currentPlayer.bio20Words,
          image: currentPlayer.image,
        }
      : null,
    currentBid: state.currentBid,
    highestBidderTeamId: state.highestBidderTeamId,
    highestBidderTeamName: state.highestBidderTeamName,
    highestBidderUserId: state.highestBidderUserId,
    timeLeftSeconds: state.timeLeftSeconds,
    status: state.status,
    skippedCount: state.skippedTeamIds.length,
    skippedTeamIds: state.skippedTeamIds,
    bidHistory: state.bidHistory,
  };
}

