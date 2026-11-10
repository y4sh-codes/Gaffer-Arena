import { FormationType, TacticalSlot, PlayerRoleType } from "@/types";

export interface FormationDefinition {
  id: FormationType;
  name: string;
  description: string;
  slots: TacticalSlot[];
}

export const FORMATIONS: Record<FormationType, FormationDefinition> = {
  "4-3-3": {
    id: "4-3-3",
    name: "4-3-3 (Attack)",
    description: "High-paced attacking width with a central striker and inverted wingers.",
    slots: [
      { slotId: "GK", position: "GK", defaultRole: "Sweeper Keeper", x: 50, y: 88 },
      { slotId: "LB", position: "LB", defaultRole: "Attacking Fullback", x: 15, y: 70 },
      { slotId: "LCB", position: "CB", defaultRole: "Ball-Playing CB", x: 38, y: 74 },
      { slotId: "RCB", position: "CB", defaultRole: "No-Nonsense CB", x: 62, y: 74 },
      { slotId: "RB", position: "RB", defaultRole: "Attacking Fullback", x: 85, y: 70 },
      { slotId: "CDM", position: "CDM", defaultRole: "Ball-Winning Midfielder", x: 50, y: 55 },
      { slotId: "LCM", position: "CM", defaultRole: "Box-to-Box", x: 30, y: 44 },
      { slotId: "RCM", position: "CM", defaultRole: "Deep Lying Playmaker", x: 70, y: 44 },
      { slotId: "LW", position: "LW", defaultRole: "Inverted Winger", x: 18, y: 22 },
      { slotId: "ST", position: "ST", defaultRole: "Target Man", x: 50, y: 16 },
      { slotId: "RW", position: "RW", defaultRole: "Inverted Winger", x: 82, y: 22 },
    ],
  },
  "4-2-3-1": {
    id: "4-2-3-1",
    name: "4-2-3-1 (Wide)",
    description: "Double pivot solidity supporting a creative attacking midfield triumvirate.",
    slots: [
      { slotId: "GK", position: "GK", defaultRole: "Sweeper Keeper", x: 50, y: 88 },
      { slotId: "LB", position: "LB", defaultRole: "Attacking Fullback", x: 15, y: 72 },
      { slotId: "LCB", position: "CB", defaultRole: "No-Nonsense CB", x: 38, y: 75 },
      { slotId: "RCB", position: "CB", defaultRole: "Ball-Playing CB", x: 62, y: 75 },
      { slotId: "RB", position: "RB", defaultRole: "Attacking Fullback", x: 85, y: 72 },
      { slotId: "LDM", position: "CDM", defaultRole: "Ball-Winning Midfielder", x: 35, y: 58 },
      { slotId: "RDM", position: "CDM", defaultRole: "Deep Lying Playmaker", x: 65, y: 58 },
      { slotId: "LAM", position: "LW", defaultRole: "Inverted Winger", x: 20, y: 35 },
      { slotId: "CAM", position: "CAM", defaultRole: "Deep Lying Playmaker", x: 50, y: 34 },
      { slotId: "RAM", position: "RW", defaultRole: "Inverted Winger", x: 80, y: 35 },
      { slotId: "ST", position: "ST", defaultRole: "Poacher", x: 50, y: 16 },
    ],
  },
  "3-5-2": {
    id: "3-5-2",
    name: "3-5-2 (Dominant Midfield)",
    description: "Overwhelming midfield presence with wingbacks flanking a lethal strike partnership.",
    slots: [
      { slotId: "GK", position: "GK", defaultRole: "Traditional Keeper", x: 50, y: 88 },
      { slotId: "LCB", position: "CB", defaultRole: "Ball-Playing CB", x: 25, y: 74 },
      { slotId: "CCB", position: "CB", defaultRole: "No-Nonsense CB", x: 50, y: 76 },
      { slotId: "RCB", position: "CB", defaultRole: "Ball-Playing CB", x: 75, y: 74 },
      { slotId: "LWB", position: "LB", defaultRole: "Attacking Fullback", x: 12, y: 48 },
      { slotId: "LDM", position: "CDM", defaultRole: "Ball-Winning Midfielder", x: 36, y: 55 },
      { slotId: "RDM", position: "CDM", defaultRole: "Deep Lying Playmaker", x: 64, y: 55 },
      { slotId: "RWB", position: "RB", defaultRole: "Attacking Fullback", x: 88, y: 48 },
      { slotId: "CAM", position: "CAM", defaultRole: "Deep Lying Playmaker", x: 50, y: 35 },
      { slotId: "LST", position: "ST", defaultRole: "Target Man", x: 36, y: 18 },
      { slotId: "RST", position: "ST", defaultRole: "Poacher", x: 64, y: 18 },
    ],
  },
  "4-4-2": {
    id: "4-4-2",
    name: "4-4-2 (Flat Classic)",
    description: "Traditional English structure with robust banks of four and dual forwards.",
    slots: [
      { slotId: "GK", position: "GK", defaultRole: "Traditional Keeper", x: 50, y: 88 },
      { slotId: "LB", position: "LB", defaultRole: "Attacking Fullback", x: 15, y: 72 },
      { slotId: "LCB", position: "CB", defaultRole: "No-Nonsense CB", x: 38, y: 74 },
      { slotId: "RCB", position: "CB", defaultRole: "Ball-Playing CB", x: 62, y: 74 },
      { slotId: "RB", position: "RB", defaultRole: "Attacking Fullback", x: 85, y: 72 },
      { slotId: "LM", position: "LW", defaultRole: "Inverted Winger", x: 16, y: 45 },
      { slotId: "LCM", position: "CM", defaultRole: "Box-to-Box", x: 38, y: 48 },
      { slotId: "RCM", position: "CM", defaultRole: "Ball-Winning Midfielder", x: 62, y: 48 },
      { slotId: "RM", position: "RW", defaultRole: "Inverted Winger", x: 84, y: 45 },
      { slotId: "LST", position: "ST", defaultRole: "Target Man", x: 38, y: 18 },
      { slotId: "RST", position: "ST", defaultRole: "Poacher", x: 62, y: 18 },
    ],
  },
  "5-3-2": {
    id: "5-3-2",
    name: "5-3-2 (Fortress)",
    description: "Defensive wall with five defenders, structured counter-attacks, and lethal transition speed.",
    slots: [
      { slotId: "GK", position: "GK", defaultRole: "Sweeper Keeper", x: 50, y: 88 },
      { slotId: "LWB", position: "LB", defaultRole: "Attacking Fullback", x: 12, y: 66 },
      { slotId: "LCB", position: "CB", defaultRole: "Ball-Playing CB", x: 30, y: 75 },
      { slotId: "CCB", position: "CB", defaultRole: "No-Nonsense CB", x: 50, y: 78 },
      { slotId: "RCB", position: "CB", defaultRole: "Ball-Playing CB", x: 70, y: 75 },
      { slotId: "RWB", position: "RB", defaultRole: "Attacking Fullback", x: 88, y: 66 },
      { slotId: "LCM", position: "CM", defaultRole: "Box-to-Box", x: 32, y: 46 },
      { slotId: "CM", position: "CM", defaultRole: "Deep Lying Playmaker", x: 50, y: 48 },
      { slotId: "RCM", position: "CM", defaultRole: "Ball-Winning Midfielder", x: 68, y: 46 },
      { slotId: "LST", position: "ST", defaultRole: "Target Man", x: 38, y: 18 },
      { slotId: "RST", position: "ST", defaultRole: "Poacher", x: 62, y: 18 },
    ],
  },
};

export const AVAILABLE_ROLES: Record<string, PlayerRoleType[]> = {
  GK: ["Sweeper Keeper", "Traditional Keeper"],
  CB: ["No-Nonsense CB", "Ball-Playing CB"],
  LB: ["Attacking Fullback", "No-Nonsense CB"],
  RB: ["Attacking Fullback", "No-Nonsense CB"],
  CDM: ["Ball-Winning Midfielder", "Deep Lying Playmaker"],
  CM: ["Box-to-Box", "Deep Lying Playmaker", "Ball-Winning Midfielder"],
  CAM: ["Deep Lying Playmaker", "Inverted Winger"],
  LW: ["Inverted Winger", "Poacher"],
  RW: ["Inverted Winger", "Poacher"],
  ST: ["Target Man", "Poacher"],
  CF: ["Target Man", "Poacher", "Inverted Winger"],
};

export function calculateAggregatedRatings(starters: any[], bench: any[]) {
  if (!starters || starters.length === 0) {
    return { att: 70, mid: 70, def: 70, depth: 70, ovr: 70 };
  }

  // Split starters by position
  const forwards = starters.filter(
    (s) => s.player && ["ST", "CF", "LW", "RW"].includes(s.player.pos)
  );
  const mids = starters.filter(
    (s) => s.player && ["CM", "CAM", "CDM", "LM", "RM"].includes(s.player.pos)
  );
  const defs = starters.filter(
    (s) => s.player && ["CB", "LB", "RB", "LWB", "RWB", "GK"].includes(s.player.pos)
  );

  const avg = (arr: any[], fn: (p: any) => number, fallback = 80) => {
    if (arr.length === 0) return fallback;
    const sum = arr.reduce((acc, item) => acc + fn(item.player), 0);
    return Math.round(sum / arr.length);
  };

  const attRating = avg(
    forwards.length > 0 ? forwards : starters,
    (p) => Math.round(p.att * 0.45 + p.dri * 0.35 + p.spe * 0.2)
  );

  const midRating = avg(
    mids.length > 0 ? mids : starters,
    (p) => Math.round(p.pas * 0.4 + p.dri * 0.3 + p.phy * 0.15 + p.def * 0.15)
  );

  const defRating = avg(
    defs.length > 0 ? defs : starters,
    (p) => Math.round(p.def * 0.5 + p.phy * 0.3 + p.spe * 0.2)
  );

  const benchAvg = avg(bench, (p) => p.ovr, 78);
  const depthRating = Math.round((benchAvg * 0.4) + ((attRating + midRating + defRating) / 3) * 0.6);
  const teamOvr = Math.round((attRating + midRating + defRating) / 3);

  return {
    att: Math.min(99, Math.max(50, attRating)),
    mid: Math.min(99, Math.max(50, midRating)),
    def: Math.min(99, Math.max(50, defRating)),
    depth: Math.min(99, Math.max(50, depthRating)),
    ovr: Math.min(99, Math.max(50, teamOvr)),
  };
}
