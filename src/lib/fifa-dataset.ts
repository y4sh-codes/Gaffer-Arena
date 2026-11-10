export interface RawFifaPlayerRecord {
  player_id?: string | number;
  short_name?: string;
  long_name?: string;
  player_positions?: string;
  overall?: string | number;
  nationality_name?: string;
  club_name?: string;
  league_name?: string;
  fifa_version?: string | number;
  player_traits?: string;
  player_tags?: string;
  pace?: string | number;
  shooting?: string | number;
  passing?: string | number;
  dribbling?: string | number;
  defending?: string | number;
  physic?: string | number;
  goalkeeping_diving?: string | number;
  goalkeeping_handling?: string | number;
  goalkeeping_kicking?: string | number;
  goalkeeping_reflexes?: string | number;
  goalkeeping_positioning?: string | number;
  goalkeeping_speed?: string | number;
  [key: string]: unknown;
}

export interface ProcessedPlayer {
  externalFifaId: number;
  name: string;
  cardYear: number;
  nationality: string;
  league: string;
  team: string;
  ovr: number;
  pos: string;
  att: number;
  def: number;
  pas: number;
  phy: number;
  dri: number;
  spe: number;
  traits: string[];
  playstyle: string;
  rating: number;
  bio20Words: string;
  image: string;
}

const STAT_LABELS: Record<string, string> = {
  spe: "blistering pace",
  att: "clinical finishing",
  pas: "pinpoint passing",
  dri: "fluid dribbling",
  def: "tenacious defending",
  phy: "commanding physical strength",
};

export function generate20WordBio(
  name: string,
  pos: string,
  stats: { spe: number; att: number; pas: number; dri: number; def: number; phy: number },
  club: string,
  nationality: string
): string {
  // Identify top 3 attributes
  const sorted = Object.entries(stats).sort(([, a], [, b]) => b - a);
  const top1 = STAT_LABELS[sorted[0][0]] || "masterful technique";
  const top2 = STAT_LABELS[sorted[1][0]] || "vision";
  const top3 = STAT_LABELS[sorted[2][0]] || "athleticism";

  let bio = "";
  if (pos.includes("GK")) {
    bio = `Elite ${nationality} goalkeeper commanding the box for ${club} with exceptional reflexes, shot-stopping brilliance, and calm leadership under intense matchday pressure.`;
  } else if (pos.includes("CB") || pos.includes("LB") || pos.includes("RB")) {
    bio = `Dominant ${nationality} defender at ${club} renowned for ${top1}, rock-solid structure, and ${top2} shutting down opposing counter-attacks with elite discipline.`;
  } else if (pos.includes("CM") || pos.includes("CAM") || pos.includes("CDM")) {
    bio = `Masterful ${nationality} midfield orchestrator conducting play for ${club} through ${top1}, tactical awareness, and ${top2} dictating every crucial match tempo.`;
  } else {
    bio = `Lethal ${nationality} attacker leading ${club} with ${top1}, explosive dynamism, and ${top2} to consistently dismantle modern defensive lines.`;
  }

  // Ensure approximately 20 words (between 18 and 22 words)
  const words = bio.trim().split(/\s+/);
  if (words.length > 20) {
    return words.slice(0, 20).join(" ") + ".";
  }
  return words.join(" ");
}

export function parsePlayerTraits(rawTraits: string | undefined): string[] {
  if (!rawTraits || rawTraits.trim() === "") return ["Flair", "Technical Master"];
  return rawTraits
    .split(/[,;#]+/)
    .map((t) => t.trim().replace(/^#/, ""))
    .filter((t) => t.length > 0)
    .slice(0, 6);
}

export function determinePlaystyle(pos: string, traits: string[]): string {
  if (traits.some((t) => t.toLowerCase().includes("finesse"))) return "Finesse Shot+";
  if (traits.some((t) => t.toLowerCase().includes("power"))) return "Power Shot+";
  if (traits.some((t) => t.toLowerCase().includes("quick"))) return "Quick Step+";
  if (traits.some((t) => t.toLowerCase().includes("intercept"))) return "Intercept+";
  if (traits.some((t) => t.toLowerCase().includes("aerial"))) return "Aerial Fortress+";
  if (pos.includes("GK")) return "Footwork+";
  if (pos.includes("CB")) return "Bruiser+";
  if (pos.includes("CM") || pos.includes("CAM")) return "Tiki Taka+";
  return "First Touch+";
}

export function processRawRecord(raw: RawFifaPlayerRecord): ProcessedPlayer | null {
  const ovr = parseInt(String(raw.overall || "0"), 10);
  if (isNaN(ovr) || ovr < 85) return null;

  const externalFifaId = parseInt(String(raw.player_id || "0"), 10) || Math.floor(Math.random() * 900000 + 100000);
  const name = String(raw.short_name || raw.long_name || "Unknown Star").trim();
  const rawPos = String(raw.player_positions || "ST").split(",")[0].trim().toUpperCase();
  const nationality = String(raw.nationality_name || "International").trim();
  const team = String(raw.club_name || "Free Agent").trim();
  const league = String(raw.league_name || "World League").trim();
  const cardYear = Math.round(parseFloat(String(raw.fifa_version || "24"))) || 2024;

  const isGK = rawPos === "GK";

  // Attributes
  const spe = isGK
    ? Math.round(parseFloat(String(raw.goalkeeping_diving || raw.goalkeeping_speed || "84")))
    : Math.round(parseFloat(String(raw.pace || "75")));

  const att = isGK
    ? Math.round(parseFloat(String(raw.goalkeeping_kicking || "78")))
    : Math.round(parseFloat(String(raw.shooting || "75")));

  const pas = isGK
    ? Math.round(parseFloat(String(raw.goalkeeping_handling || "82")))
    : Math.round(parseFloat(String(raw.passing || "75")));

  const dri = isGK
    ? Math.round(parseFloat(String(raw.goalkeeping_reflexes || "88")))
    : Math.round(parseFloat(String(raw.dribbling || "75")));

  const def = isGK
    ? Math.round(parseFloat(String(raw.goalkeeping_positioning || "86")))
    : Math.round(parseFloat(String(raw.defending || "50")));

  const phy = Math.round(parseFloat(String(raw.physic || "75")));

  const stats = { spe, att, pas, dri, def, phy };
  const traits = parsePlayerTraits(raw.player_traits as string);
  const playstyle = determinePlaystyle(rawPos, traits);
  const bio20Words = generate20WordBio(name, rawPos, stats, team, nationality);

  // High-res EA FC face or avatar fallback
  const image = `https://cdn.sofifa.net/players/${String(externalFifaId).padStart(6, "0").slice(0, 3)}/${String(externalFifaId).padStart(6, "0").slice(3)}/24_120.png`;

  return {
    externalFifaId,
    name,
    cardYear,
    nationality,
    league,
    team,
    ovr,
    pos: rawPos,
    spe: Math.min(99, Math.max(40, spe)),
    att: Math.min(99, Math.max(40, att)),
    pas: Math.min(99, Math.max(40, pas)),
    dri: Math.min(99, Math.max(40, dri)),
    def: Math.min(99, Math.max(30, def)),
    phy: Math.min(99, Math.max(40, phy)),
    traits,
    playstyle,
    rating: ovr,
    bio20Words,
    image,
  };
}
