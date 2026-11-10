import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateDoubleRoundRobinSchedule } from "@/lib/simulator/fixture-generator";
import { simulateMatch } from "@/lib/simulator/match-engine";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: leagueId } = await params;
  const body = await req.json().catch(() => ({}));
  const { action, matchday, matchId } = body;

  try {
    if (action === "generate-schedule") {
      const res = await generateDoubleRoundRobinSchedule(leagueId);
      return NextResponse.json(res);
    }

    if (action === "simulate-matchday") {
      const targetMatchday = Number(matchday) || 1;
      const pendingMatches = await prisma.match.findMany({
        where: {
          leagueId,
          matchday: targetMatchday,
          status: "PENDING",
        },
      });

      const simulatedResults = [];
      for (const m of pendingMatches) {
        const payload = await simulateMatch(m.id);
        simulatedResults.push({ matchId: m.id, payload });
      }

      return NextResponse.json({
        success: true,
        matchday: targetMatchday,
        simulatedCount: simulatedResults.length,
      });
    }

    if (action === "simulate-single" && matchId) {
      const payload = await simulateMatch(matchId);
      return NextResponse.json({ success: true, payload });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Simulation failure" },
      { status: 500 }
    );
  }
}
