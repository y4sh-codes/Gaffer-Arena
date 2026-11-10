"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormationType, MentalityType, PlayerRoleType, TacticalSlot } from "@/types";
import { FORMATIONS, calculateAggregatedRatings } from "@/lib/tactics/formation-templates";
import { saveTeamTacticsAction } from "@/lib/actions/tactics-actions";
import TacticsPitch from "@/components/tactics/TacticsPitch";
import TacticsControls from "@/components/tactics/TacticsControls";
import TeamRatingsBadge from "@/components/tactics/TeamRatingsBadge";
import SquadBenchList from "@/components/tactics/SquadBenchList";
import { ArrowLeft, Play, Trophy, Users, Wand2, Shield } from "lucide-react";

interface TeamHubClientProps {
  league: {
    id: string;
    name: string;
    code: string;
    status: string;
  };
  team: {
    id: string;
    teamName: string;
    managerName: string;
    formation: string;
    budget: number;
    players: Array<{
      id: string;
      playerId: string;
      isStarter: boolean;
      positionOnField: string | null;
      playerRole: string | null;
      player: {
        id: string;
        name: string;
        ovr: number;
        pos: string;
        att: number;
        def: number;
        pas: number;
        phy: number;
        dri: number;
        spe: number;
        image: string;
        nationality: string;
      };
    }>;
  };
}

export default function TeamHubClient({ league, team }: TeamHubClientProps) {
  const router = useRouter();

  // Active Formation
  const [formation, setFormation] = useState<FormationType>(
    (team.formation as FormationType) || "4-3-3"
  );

  // Mentality & Depth
  const [mentality, setMentality] = useState<MentalityType>("Balanced");
  const [defensiveDepth, setDefensiveDepth] = useState<number>(55);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TacticalSlot | null>(null);

  const formationDef = FORMATIONS[formation] || FORMATIONS["4-3-3"];

  // Lineup state: map of slotId -> assigned player
  const [lineup, setLineup] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    const starters = team.players.filter((p) => p.isStarter);

    formationDef.slots.forEach((slot, idx) => {
      const existing = starters[idx];
      if (existing) {
        initial[slot.slotId] = {
          slotId: slot.slotId,
          position: slot.position,
          teamPlayerId: existing.id,
          role: (existing.playerRole as PlayerRoleType) || slot.defaultRole,
          player: existing.player,
        };
      } else {
        initial[slot.slotId] = null;
      }
    });

    return initial;
  });

  // Calculate bench players (any player not currently assigned to a starter slot)
  const benchPlayers = useMemo(() => {
    const assignedTeamPlayerIds = new Set(
      Object.values(lineup)
        .filter(Boolean)
        .map((a: any) => a.teamPlayerId)
    );

    return team.players.filter((p) => !assignedTeamPlayerIds.has(p.id));
  }, [team.players, lineup]);

  // Dynamic Ratings Calculation
  const activeStarters = useMemo(() => {
    return Object.values(lineup).filter(Boolean);
  }, [lineup]);

  const ratings = useMemo(() => {
    return calculateAggregatedRatings(
      activeStarters,
      benchPlayers.map((b) => b.player)
    );
  }, [activeStarters, benchPlayers]);

  const handleFormationChange = (newF: FormationType) => {
    setFormation(newF);
    const newDef = FORMATIONS[newF];
    const newLineup: Record<string, any> = {};

    // Re-map existing starters into new formation slots
    newDef.slots.forEach((slot, idx) => {
      const existing = activeStarters[idx];
      if (existing) {
        newLineup[slot.slotId] = {
          slotId: slot.slotId,
          position: slot.position,
          teamPlayerId: existing.teamPlayerId,
          role: slot.defaultRole,
          player: existing.player,
        };
      } else {
        newLineup[slot.slotId] = null;
      }
    });

    setLineup(newLineup);
    setSelectedSlot(null);
  };

  const handleSlotClick = (slot: TacticalSlot) => {
    if (selectedSlot?.slotId === slot.slotId) {
      setSelectedSlot(null);
    } else {
      setSelectedSlot(slot);
    }
  };

  const handleAssignToSlot = (benchPlayer: any) => {
    if (!selectedSlot) return;

    setLineup((prev) => {
      const updated = { ...prev };
      // Check if slot currently had a player
      const previousInSlot = updated[selectedSlot.slotId];

      updated[selectedSlot.slotId] = {
        slotId: selectedSlot.slotId,
        position: selectedSlot.position,
        teamPlayerId: benchPlayer.id,
        role: selectedSlot.defaultRole,
        player: benchPlayer.player,
      };

      return updated;
    });

    setSelectedSlot(null);
  };

  const handleRoleChange = (slotId: string, newRole: PlayerRoleType) => {
    setLineup((prev) => {
      const updated = { ...prev };
      if (updated[slotId]) {
        updated[slotId] = {
          ...updated[slotId],
          role: newRole,
        };
      }
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      const startersList = Object.values(lineup)
        .filter(Boolean)
        .map((a: any) => ({
          teamPlayerId: a.teamPlayerId,
          positionOnField: a.position,
          playerRole: a.role,
        }));

      const reservesList = benchPlayers.map((b) => ({
        teamPlayerId: b.id,
      }));

      await saveTeamTacticsAction({
        teamId: team.id,
        formation,
        starters: startersList,
        reserves: reservesList,
        mentality,
        defensiveDepth,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Save tactics error:", err);
      alert("Failed to save tactics");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
                Squad & Tactics Hub
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-0.5">
              {team.teamName} <span className="text-slate-400 text-sm font-normal">({league.name})</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/leagues/${league.id}/auction`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider border border-white/10 transition"
          >
            Auction
          </Link>
          <Link
            href={`/leagues/${league.id}/matches`}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-arena-neonGreen text-slate-950 text-xs font-black uppercase tracking-wider shadow-neon hover:scale-105 transition"
          >
            <Play className="w-3.5 h-3.5" />
            Matchday Fixtures
          </Link>
        </div>
      </div>

      {/* Aggregated Ratings Strip */}
      <TeamRatingsBadge ratings={ratings} />

      {/* Main Grid: Pitch + Controls & Bench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Tactical Pitch */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <TacticsPitch
            slots={formationDef.slots}
            lineup={lineup}
            onSlotClick={handleSlotClick}
            selectedSlotId={selectedSlot?.slotId || null}
            onRoleChange={handleRoleChange}
          />
          <div className="text-[11px] text-slate-400 font-mono mt-3 text-center">
            Click any position disc to select slot, then swap with bench below or change tactical role.
          </div>
        </div>

        {/* Right: Tactics Controls & Reserves */}
        <div className="lg:col-span-5 space-y-6">
          <TacticsControls
            currentFormation={formation}
            onFormationChange={handleFormationChange}
            mentality={mentality}
            onMentalityChange={setMentality}
            defensiveDepth={defensiveDepth}
            onDefensiveDepthChange={setDefensiveDepth}
            onSave={handleSave}
            saving={saving}
            saved={saved}
          />

          <SquadBenchList
            benchPlayers={benchPlayers}
            onAssignToSelectedSlot={handleAssignToSlot}
            selectedSlotLabel={
              selectedSlot ? `${selectedSlot.position} (${selectedSlot.slotId})` : null
            }
          />
        </div>
      </div>
    </div>
  );
}
