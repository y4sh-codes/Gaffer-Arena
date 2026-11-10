export type FormationType = "4-3-3" | "4-2-3-1" | "3-5-2" | "4-4-2" | "5-3-2";

export type MentalityType = "Attacking" | "Balanced" | "Park the Bus" | "High Press" | "Counter Attack";

export type PlayerRoleType =
  | "Target Man"
  | "Poacher"
  | "Inverted Winger"
  | "Deep Lying Playmaker"
  | "Box-to-Box"
  | "Ball-Winning Midfielder"
  | "Sweeper Keeper"
  | "Traditional Keeper"
  | "No-Nonsense CB"
  | "Ball-Playing CB"
  | "Attacking Fullback";

export interface TacticalSlot {
  slotId: string;
  position: string; // e.g. "GK", "LB", "CB1", "CB2", "RB", "CM1", "CAM", "CM2", "LW", "ST", "RW"
  defaultRole: PlayerRoleType;
  x: number; // percentage 0-100 across pitch
  y: number; // percentage 0-100 down pitch
}

export interface MatchEvent {
  minute: number;
  type: "GOAL" | "YELLOW_CARD" | "RED_CARD" | "GREAT_SAVE" | "TACTICAL_CHANGE" | "WOODWORK";
  teamId: string;
  teamName: string;
  playerId?: string;
  playerName?: string;
  description: string;
  homeScore: number;
  awayScore: number;
}

export interface MatchSimulationStats {
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homePossession: number;
  awayPossession: number;
  homeFouls: number;
  awayFouls: number;
  homeCorners: number;
  awayCorners: number;
}

export interface MatchLogPayload {
  events: MatchEvent[];
  stats: MatchSimulationStats;
  homeRating: number;
  awayRating: number;
  manOfTheMatch: {
    playerId: string;
    playerName: string;
    rating: number;
    teamName: string;
  };
}

export interface AuctionPlayerState {
  player: {
    id: string;
    externalFifaId: number;
    name: string;
    ovr: number;
    pos: string;
    nationality: string;
    league: string;
    team: string;
    att: number;
    def: number;
    pas: number;
    phy: number;
    dri: number;
    spe: number;
    playstyle: string;
    traits: string[];
    bio20Words: string;
    image: string;
  };
  currentBid: number;
  highestBidderTeamId: string | null;
  highestBidderTeamName: string | null;
  highestBidderUserId: string | null;
  timeLeftSeconds: number;
  status: "ACTIVE" | "SOLD" | "UNSOLD";
  skippedTeamIds: string[];
}
