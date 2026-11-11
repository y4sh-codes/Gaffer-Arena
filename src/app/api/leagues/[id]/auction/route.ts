import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUserOrGuest } from "@/lib/actions/league-actions";
import {
  getOrInitializeAuction,
  formatAuctionState,
  placeBid,
  skipPlayer,
  resolveAuctionTimerExpiry,
  endAuctionByCreator,
  markAuctionCompletedIfActive,
} from "@/lib/auction/auction-manager";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: leagueId } = await params;

  try {
    const state = await getOrInitializeAuction(leagueId);

    // Fetch refreshed teams for the scoreboard/squad roster
    const teams = await prisma.team.findMany({
      where: { leagueId },
      include: {
        players: {
          include: { player: true },
        },
      },
      orderBy: { points: "desc" },
    });

    const [league, currentUser] = await Promise.all([
      prisma.league.findUnique({
        where: { id: leagueId },
        select: { createdById: true, status: true },
      }),
      getCurrentUserOrGuest(),
    ]);

    const formatted = formatAuctionState(state);

    return NextResponse.json({
      success: true,
      auction: formatted,
      teams,
      leagueStatus: league?.status ?? null,
      isCreator: Boolean(league && currentUser?.id && league.createdById === currentUser.id),
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Auction error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: leagueId } = await params;
  const body = await req.json();
  const { action, teamId, increment } = body;

  try {
    if (action === "bid") {
      const res = await placeBid(leagueId, teamId, Number(increment) || 1000000);
      return NextResponse.json(res);
    }

    if (action === "skip") {
      const res = await skipPlayer(leagueId, teamId);
      return NextResponse.json(res);
    }

    if (action === "tick") {
      const state = await getOrInitializeAuction(leagueId);
      if (state.status === "ACTIVE") {
        state.timeLeftSeconds = Math.max(0, state.timeLeftSeconds - 1);

        // If clock hit 0, resolve auction.
        // Only real managers place bids; there is no AI bidding.
        if (state.timeLeftSeconds <= 0) {
          await resolveAuctionTimerExpiry(leagueId);
        }
      }
      return NextResponse.json({ success: true, auction: formatAuctionState(state) });
    }

    if (action === "resolve") {
      const state = await resolveAuctionTimerExpiry(leagueId);
      return NextResponse.json({ success: true, auction: formatAuctionState(state) });
    }

    if (action === "endAuction") {
      const user = await getCurrentUserOrGuest();
      if (!user?.id) {
        return NextResponse.json(
          { success: false, error: "You must be logged in to end the auction" },
          { status: 401 }
        );
      }

      const res = await endAuctionByCreator(leagueId, user.id);
      return NextResponse.json(res);
    }

    if (action === "endLeague") {
      const user = await getCurrentUserOrGuest();
      if (!user?.id) {
        return NextResponse.json(
          { success: false, error: "You must be logged in to end the league" },
          { status: 401 }
        );
      }

      const league = await prisma.league.findUnique({
        where: { id: leagueId },
        select: { createdById: true },
      });

      if (!league) {
        return NextResponse.json({ success: false, error: "League not found" }, { status: 404 });
      }

      if (league.createdById !== user.id) {
        return NextResponse.json(
          { success: false, error: "Only the league creator can end this league" },
          { status: 403 }
        );
      }

      await prisma.league.update({
        where: { id: leagueId },
        data: { status: "COMPLETED" },
      });
      markAuctionCompletedIfActive(leagueId);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Auction action error" },
      { status: 500 }
    );
  }
}
