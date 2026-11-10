import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  getOrInitializeAuction,
  formatAuctionState,
  placeBid,
  skipPlayer,
  resolveAuctionTimerExpiry,
  triggerAIBidCheck,
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

    const formatted = formatAuctionState(state);

    return NextResponse.json({
      success: true,
      auction: formatted,
      teams,
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

        // Periodically allow AI managers to bid
        if (state.timeLeftSeconds > 2 && state.timeLeftSeconds < 18) {
          await triggerAIBidCheck(leagueId);
        }

        // If clock hit 0, resolve auction
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

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Auction action error" },
      { status: 500 }
    );
  }
}
