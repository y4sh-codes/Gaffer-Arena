import fs from "fs";
import path from "path";

// Curated list of legendary Icons, Heroes, and modern stars across eras with authentic attributes
interface PlayerTemplate {
  name: string;
  cardYear: number;
  nationality: string;
  league: string;
  team: string;
  pos: "ST" | "CF" | "LW" | "RW" | "CAM" | "CM" | "CDM" | "CB" | "LB" | "RB" | "GK";
  ovr: number;
  spe: number;
  att: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
  traits: string[];
  playstyle: string;
}

const ICONS_AND_LEGENDS: PlayerTemplate[] = [
  // ST / CF
  { name: "Pelé (Icon)", cardYear: 1970, nationality: "Brazil", league: "Icons", team: "Santos / Brazil", pos: "CF", ovr: 95, spe: 95, att: 96, pas: 93, dri: 96, def: 60, phy: 76, traits: ["Finesse Shot +", "Flair", "Trickster"], playstyle: "First Touch+" },
  { name: "Ronaldo R9 (Icon)", cardYear: 2002, nationality: "Brazil", league: "Icons", team: "Real Madrid / Inter", pos: "ST", ovr: 94, spe: 97, att: 95, pas: 81, dri: 95, def: 45, phy: 80, traits: ["Quick Step +", "Rapid", "Power Shot"], playstyle: "Quick Step+" },
  { name: "Johan Cruyff (Icon)", cardYear: 1974, nationality: "Netherlands", league: "Icons", team: "Ajax / Barcelona", pos: "CF", ovr: 93, spe: 91, att: 92, pas: 91, dri: 94, def: 42, phy: 73, traits: ["Technical +", "Cruyff Turn", "Trickster"], playstyle: "Tiki Taka+" },
  { name: "Ferenc Puskás (Icon)", cardYear: 1954, nationality: "Hungary", league: "Icons", team: "Real Madrid", pos: "CF", ovr: 92, spe: 89, att: 96, pas: 91, dri: 92, def: 46, phy: 86, traits: ["Power Shot +", "Finesse Shot", "Dead Ball"], playstyle: "Power Shot+" },
  { name: "Thierry Henry (Icon)", cardYear: 2004, nationality: "France", league: "Icons", team: "Arsenal", pos: "ST", ovr: 93, spe: 94, att: 91, pas: 83, dri: 90, def: 53, phy: 80, traits: ["Finesse Shot +", "Rapid", "Flair"], playstyle: "Finesse Shot+" },
  { name: "Gerd Müller (Icon)", cardYear: 1974, nationality: "Germany", league: "Icons", team: "Bayern München", pos: "ST", ovr: 92, spe: 85, att: 94, pas: 77, dri: 84, def: 48, phy: 82, traits: ["Poacher +", "Clinical Finisher"], playstyle: "First Touch+" },
  { name: "Wayne Rooney (Icon)", cardYear: 2008, nationality: "England", league: "Icons", team: "Manchester United", pos: "ST", ovr: 91, spe: 89, att: 92, pas: 84, dri: 88, def: 58, phy: 89, traits: ["Power Shot +", "Relentless", "Aggression"], playstyle: "Power Shot+" },
  { name: "Marco van Basten (Icon)", cardYear: 1988, nationality: "Netherlands", league: "Icons", team: "Milan", pos: "ST", ovr: 91, spe: 83, att: 94, pas: 76, dri: 89, def: 40, phy: 75, traits: ["Acrobatic +", "Clinical Finisher"], playstyle: "Aerial Fortress+" },
  { name: "Samuel Eto'o (Icon)", cardYear: 2006, nationality: "Cameroon", league: "Icons", team: "Barcelona / Inter", pos: "ST", ovr: 90, spe: 95, att: 91, pas: 79, dri: 88, def: 48, phy: 81, traits: ["Rapid +", "Finesse Shot"], playstyle: "Quick Step+" },
  { name: "Didier Drogba (Icon)", cardYear: 2010, nationality: "Ivory Coast", league: "Icons", team: "Chelsea", pos: "ST", ovr: 89, spe: 88, att: 90, pas: 75, dri: 80, def: 50, phy: 91, traits: ["Aerial Fortress +", "Power Header", "Bruiser"], playstyle: "Aerial Fortress+" },

  // WINGERS (LW / RW)
  { name: "Ronaldinho (Icon)", cardYear: 2005, nationality: "Brazil", league: "Icons", team: "FC Barcelona", pos: "LW", ovr: 94, spe: 92, att: 90, pas: 91, dri: 95, def: 37, phy: 81, traits: ["Trickster +", "Flair", "Elastic Specialist"], playstyle: "First Touch+" },
  { name: "George Best (Icon)", cardYear: 1968, nationality: "Northern Ireland", league: "Icons", team: "Manchester United", pos: "RW", ovr: 93, spe: 93, att: 91, pas: 84, dri: 94, def: 58, phy: 71, traits: ["Technical +", "Flair", "Rapid"], playstyle: "First Touch+" },
  { name: "Garrincha (Icon)", cardYear: 1962, nationality: "Brazil", league: "Icons", team: "Botafogo", pos: "RW", ovr: 92, spe: 90, att: 85, pas: 91, dri: 95, def: 41, phy: 68, traits: ["Trickster +", "Whipped Cross"], playstyle: "First Touch+" },
  { name: "Franck Ribéry (Icon)", cardYear: 2013, nationality: "France", league: "Icons", team: "Bayern München", pos: "LW", ovr: 90, spe: 91, att: 85, pas: 86, dri: 91, def: 45, phy: 70, traits: ["Technical +", "Flair"], playstyle: "Quick Step+" },
  { name: "Arjen Robben (Hero)", cardYear: 2014, nationality: "Netherlands", league: "Heroes", team: "Bayern München", pos: "RW", ovr: 90, spe: 93, att: 86, pas: 82, dri: 92, def: 38, phy: 67, traits: ["Cut Inside +", "Finesse Shot"], playstyle: "Finesse Shot+" },
  { name: "David Beckham (Icon)", cardYear: 1999, nationality: "England", league: "Icons", team: "Manchester United / Real Madrid", pos: "RW", ovr: 89, spe: 80, att: 84, pas: 95, dri: 84, def: 72, phy: 82, traits: ["Dead Ball +", "Whipped Pass", "Long Ball"], playstyle: "Tiki Taka+" },
  { name: "Ryan Giggs (Icon)", cardYear: 1999, nationality: "Wales", league: "Icons", team: "Manchester United", pos: "LW", ovr: 89, spe: 90, att: 82, pas: 87, dri: 89, def: 60, phy: 73, traits: ["Whipped Cross +", "Rapid"], playstyle: "Quick Step+" },
  { name: "Luis Figo (Icon)", cardYear: 2000, nationality: "Portugal", league: "Icons", team: "Real Madrid / Barcelona", pos: "RW", ovr: 90, spe: 92, att: 86, pas: 88, dri: 90, def: 42, phy: 78, traits: ["Technical +", "Whipped Cross"], playstyle: "First Touch+" },
  { name: "Eden Hazard (Hero)", cardYear: 2018, nationality: "Belgium", league: "Heroes", team: "Chelsea", pos: "LW", ovr: 91, spe: 91, att: 83, pas: 86, dri: 94, def: 35, phy: 68, traits: ["Technical +", "Flair", "Low Center Gravity"], playstyle: "First Touch+" },
  { name: "Gareth Bale (Hero)", cardYear: 2016, nationality: "Wales", league: "Heroes", team: "Real Madrid", pos: "RW", ovr: 90, spe: 95, att: 88, pas: 84, dri: 86, def: 67, phy: 82, traits: ["Power Shot +", "Rapid", "Aerial"], playstyle: "Power Shot+" },

  // MIDFIELDERS (CAM / CM / CDM)
  { name: "Zinedine Zidane (Icon)", cardYear: 2002, nationality: "France", league: "Icons", team: "Real Madrid / Juventus", pos: "CAM", ovr: 94, spe: 85, att: 92, pas: 96, dri: 95, def: 75, phy: 86, traits: ["Tiki Taka +", "First Touch", "Volley Master"], playstyle: "Tiki Taka+" },
  { name: "Ruud Gullit (Icon)", cardYear: 1988, nationality: "Netherlands", league: "Icons", team: "Milan / Chelsea", pos: "CM", ovr: 93, spe: 86, att: 88, pas: 88, dri: 89, def: 82, phy: 88, traits: ["Complete Engine +", "Power Header", "Aerial"], playstyle: "First Touch+" },
  { name: "Xavi (Icon)", cardYear: 2010, nationality: "Spain", league: "Icons", team: "FC Barcelona", pos: "CM", ovr: 93, spe: 77, att: 75, pas: 95, dri: 92, def: 72, phy: 72, traits: ["Incisive Pass +", "Tiki Taka", "Maestro"], playstyle: "Tiki Taka+" },
  { name: "Andrés Iniesta (Icon)", cardYear: 2010, nationality: "Spain", league: "Icons", team: "FC Barcelona", pos: "CM", ovr: 92, spe: 83, att: 74, pas: 93, dri: 93, def: 65, phy: 64, traits: ["First Touch +", "Tiki Taka", "La Croqueta"], playstyle: "Tiki Taka+" },
  { name: "Patrick Vieira (Icon)", cardYear: 2004, nationality: "France", league: "Icons", team: "Arsenal", pos: "CDM", ovr: 91, spe: 83, att: 77, pas: 82, dri: 83, def: 90, phy: 91, traits: ["Intercept +", "Bruiser", "Commanding Anchor"], playstyle: "Intercept+" },
  { name: "Lothar Matthäus (Icon)", cardYear: 1990, nationality: "Germany", league: "Icons", team: "Bayern München / Inter", pos: "CM", ovr: 93, spe: 89, att: 89, pas: 90, dri: 85, def: 90, phy: 85, traits: ["Power Shot +", "Relentless", "Leader"], playstyle: "Power Shot+" },
  { name: "Andrea Pirlo (Icon)", cardYear: 2006, nationality: "Italy", league: "Icons", team: "Juventus / Milan", pos: "CM", ovr: 90, spe: 73, att: 79, pas: 95, dri: 89, def: 66, phy: 67, traits: ["Dead Ball +", "Long Ball Pass", "Vision"], playstyle: "Tiki Taka+" },
  { name: "Kaká (Icon)", cardYear: 2007, nationality: "Brazil", league: "Icons", team: "Milan / Real Madrid", pos: "CAM", ovr: 91, spe: 91, att: 86, pas: 88, dri: 92, def: 44, phy: 75, traits: ["Rapid +", "Technical", "Long Shot Taker"], playstyle: "Quick Step+" },
  { name: "Claude Makélélé (Icon)", cardYear: 2003, nationality: "France", league: "Icons", team: "Real Madrid / Chelsea", pos: "CDM", ovr: 89, spe: 83, att: 50, pas: 78, dri: 81, def: 90, phy: 88, traits: ["Intercept +", "Relentless Destroyer"], playstyle: "Intercept+" },
  { name: "Yaya Touré (Hero)", cardYear: 2012, nationality: "Ivory Coast", league: "Heroes", team: "Manchester City", pos: "CM", ovr: 89, spe: 83, att: 83, pas: 86, dri: 84, def: 83, phy: 90, traits: ["Power Shot +", "Bruiser", "Colossus"], playstyle: "Power Shot+" },

  // DEFENDERS (CB / LB / RB)
  { name: "Paolo Maldini (Icon)", cardYear: 1994, nationality: "Italy", league: "Icons", team: "Milan", pos: "CB", ovr: 94, spe: 86, att: 56, pas: 75, dri: 70, def: 96, phy: 83, traits: ["Anticipate +", "Slide Tackle Specialist", "Leader"], playstyle: "Bruiser+" },
  { name: "Franco Baresi (Icon)", cardYear: 1990, nationality: "Italy", league: "Icons", team: "Milan", pos: "CB", ovr: 93, spe: 79, att: 48, pas: 76, dri: 72, def: 95, phy: 82, traits: ["Intercept +", "Tactical Brain"], playstyle: "Intercept+" },
  { name: "Roberto Carlos (Icon)", cardYear: 2002, nationality: "Brazil", league: "Icons", team: "Real Madrid", pos: "LB", ovr: 91, spe: 94, att: 83, pas: 83, dri: 84, def: 84, phy: 86, traits: ["Power Shot +", "Dead Ball", "Rapid"], playstyle: "Power Shot+" },
  { name: "Cafu (Icon)", cardYear: 2002, nationality: "Brazil", league: "Icons", team: "Roma / Milan", pos: "RB", ovr: 91, spe: 92, att: 72, pas: 84, dri: 86, def: 88, phy: 88, traits: ["Relentless +", "Whipped Cross", "Express Train"], playstyle: "Bruiser+" },
  { name: "Carles Puyol (Icon)", cardYear: 2009, nationality: "Spain", league: "Icons", team: "FC Barcelona", pos: "CB", ovr: 90, spe: 70, att: 45, pas: 68, dri: 60, def: 93, phy: 91, traits: ["Bruiser +", "Leader of Men", "Block"], playstyle: "Bruiser+" },
  { name: "Alessandro Nesta (Icon)", cardYear: 2006, nationality: "Italy", league: "Icons", team: "Milan / Lazio", pos: "CB", ovr: 90, spe: 72, att: 42, pas: 65, dri: 65, def: 93, phy: 84, traits: ["Block +", "Slide Tackle"], playstyle: "Bruiser+" },
  { name: "Rio Ferdinand (Icon)", cardYear: 2008, nationality: "England", league: "Icons", team: "Manchester United", pos: "CB", ovr: 90, spe: 84, att: 48, pas: 68, dri: 68, def: 91, phy: 86, traits: ["Anticipate +", "Pace Anchor"], playstyle: "Bruiser+" },
  { name: "Javier Zanetti (Icon)", cardYear: 2010, nationality: "Argentina", league: "Icons", team: "Inter", pos: "RB", ovr: 90, spe: 86, att: 62, pas: 84, dri: 84, def: 89, phy: 84, traits: ["Relentless +", "Iron Captain"], playstyle: "Bruiser+" },
  { name: "Ashley Cole (Icon)", cardYear: 2006, nationality: "England", league: "Icons", team: "Arsenal / Chelsea", pos: "LB", ovr: 89, spe: 89, att: 66, pas: 80, dri: 81, def: 88, phy: 80, traits: ["Rapid +", "Slide Tackle"], playstyle: "Bruiser+" },
  { name: "Nemanja Vidić (Icon)", cardYear: 2008, nationality: "Serbia", league: "Icons", team: "Manchester United", pos: "CB", ovr: 89, spe: 78, att: 54, pas: 61, dri: 62, def: 91, phy: 92, traits: ["Bruiser +", "Aerial Threat", "Warrior"], playstyle: "Bruiser+" },

  // GOALKEEPERS (GK)
  { name: "Lev Yashin (Icon)", cardYear: 1963, nationality: "Russia", league: "Icons", team: "Dynamo Moscow", pos: "GK", ovr: 94, spe: 93, att: 80, pas: 75, dri: 95, def: 93, phy: 85, traits: ["Black Spider Reflexes +", "Rush Out", "Legend"], playstyle: "Footwork+" },
  { name: "Gianluigi Buffon (Icon)", cardYear: 2006, nationality: "Italy", league: "Icons", team: "Juventus / Parma", pos: "GK", ovr: 92, spe: 89, att: 76, pas: 76, dri: 92, def: 92, phy: 83, traits: ["Footwork +", "Composed Handling", "Leader"], playstyle: "Footwork+" },
  { name: "Iker Casillas (Icon)", cardYear: 2010, nationality: "Spain", league: "Icons", team: "Real Madrid", pos: "GK", ovr: 92, spe: 92, att: 84, pas: 86, dri: 92, def: 90, phy: 74, traits: ["San Iker Reflexes +", "1-on-1 Specialist"], playstyle: "Footwork+" },
  { name: "Petr Čech (Icon)", cardYear: 2005, nationality: "Czech Republic", league: "Icons", team: "Chelsea", pos: "GK", ovr: 91, spe: 88, att: 83, pas: 80, dri: 90, def: 90, phy: 85, traits: ["Helmet Shield +", "Cross Claimer"], playstyle: "Footwork+" },
  { name: "Peter Schmeichel (Icon)", cardYear: 1999, nationality: "Denmark", league: "Icons", team: "Manchester United", pos: "GK", ovr: 91, spe: 90, att: 82, pas: 80, dri: 92, def: 88, phy: 88, traits: ["Star-Jump Save +", "Commanding Presence"], playstyle: "Footwork+" },
  { name: "Edwin van der Sar (Icon)", cardYear: 2008, nationality: "Netherlands", league: "Icons", team: "Manchester United / Ajax", pos: "GK", ovr: 89, spe: 86, att: 87, pas: 85, dri: 88, def: 88, phy: 80, traits: ["Far Reach +", "Sweeper Keeper"], playstyle: "Footwork+" },
];

// Function to generate variants/totw/flashbacks to reach 400 total balanced cards
export function generateFullBagOf400(): any[] {
  const result: any[] = [];
  const baseCuratedPath = path.join(__dirname, "data", "curated-top-players.json");
  const baseCurated = JSON.parse(fs.readFileSync(baseCuratedPath, "utf-8"));

  let idCounter = 300000;

  // 1. Add modern curated superstars
  for (const p of baseCurated) {
    result.push({
      player_id: p.player_id,
      short_name: p.short_name,
      long_name: p.long_name || p.short_name,
      player_positions: p.player_positions,
      overall: p.overall,
      nationality_name: p.nationality_name,
      club_name: p.club_name,
      league_name: p.league_name,
      fifa_version: p.fifa_version || 2024,
      pace: p.pace || p.goalkeeping_speed || 80,
      shooting: p.shooting || p.goalkeeping_kicking || 75,
      passing: p.passing || p.goalkeeping_handling || 80,
      dribbling: p.dribbling || p.goalkeeping_reflexes || 80,
      defending: p.defending || p.goalkeeping_positioning || 75,
      physic: p.physic || 80,
      player_traits: p.player_traits,
    });
  }

  // 2. Add Icons and Legends
  for (const icon of ICONS_AND_LEGENDS) {
    idCounter++;
    result.push({
      player_id: idCounter,
      short_name: icon.name,
      long_name: icon.name,
      player_positions: icon.pos,
      overall: icon.ovr,
      nationality_name: icon.nationality,
      club_name: icon.team,
      league_name: icon.league,
      fifa_version: icon.cardYear,
      pace: icon.spe,
      shooting: icon.att,
      passing: icon.pas,
      dribbling: icon.dri,
      defending: icon.def,
      physic: icon.phy,
      player_traits: icon.traits.join(", "),
    });
  }

  // 3. Generate balanced cards (Flashbacks, TOTW, Champions Edition) for top 85+ cards across positions until we have 400
  const positionalPool: Record<string, string[]> = {
    FW: ["ST", "CF"],
    WINGER: ["RW", "LW"],
    MIDFIELD: ["CAM", "CM", "CDM"],
    DEFENSE: ["CB", "LB", "RB"],
    GK: ["GK"],
  };

  const countries = ["Brazil", "France", "England", "Spain", "Germany", "Argentina", "Portugal", "Netherlands", "Italy", "Uruguay", "Croatia", "Belgium"];
  const clubs = ["Real Madrid", "Manchester City", "FC Barcelona", "Bayern München", "Liverpool", "Arsenal", "Paris Saint Germain", "Inter", "Milan", "Juventus", "Atlético Madrid", "Chelsea", "Manchester United", "Bayer Leverkusen", "Borussia Dortmund"];
  const leagues = ["Premier League", "La Liga", "Bundesliga", "Serie A", "Ligue 1", "Icons"];

  const prefixes = ["TOTW", "Flashback", "UCL Hero", "Centurions", "Rulebreaker", "Prime"];

  while (result.length < 400) {
    idCounter++;
    const seedIdx = (idCounter * 17) % result.length;
    const base = result[seedIdx];
    const prefix = prefixes[idCounter % prefixes.length];
    const yearVariation = 2018 + (idCounter % 7);
    const ovrBonus = (idCounter % 5) - 2; // -2 to +2
    const newOvr = Math.min(96, Math.max(85, base.overall + ovrBonus));

    const newName = `${prefix} ${base.short_name.replace(/(Icon|Hero)/g, "").trim()}`;

    result.push({
      player_id: idCounter,
      short_name: newName,
      long_name: `${newName} (${yearVariation})`,
      player_positions: base.player_positions,
      overall: newOvr,
      nationality_name: base.nationality_name || countries[idCounter % countries.length],
      club_name: base.club_name || clubs[idCounter % clubs.length],
      league_name: base.league_name || leagues[idCounter % leagues.length],
      fifa_version: yearVariation,
      pace: Math.min(99, Math.max(45, (base.pace || 75) + (idCounter % 5) - 2)),
      shooting: Math.min(99, Math.max(40, (base.shooting || 75) + ((idCounter * 3) % 5) - 2)),
      passing: Math.min(99, Math.max(40, (base.passing || 75) + ((idCounter * 7) % 5) - 2)),
      dribbling: Math.min(99, Math.max(45, (base.dribbling || 75) + ((idCounter * 2) % 5) - 2)),
      defending: Math.min(99, Math.max(30, (base.defending || 60) + ((idCounter * 5) % 5) - 2)),
      physic: Math.min(99, Math.max(50, (base.physic || 75) + ((idCounter * 11) % 5) - 2)),
      player_traits: base.player_traits || "Elite Performer, Match Winner",
    });
  }

  return result;
}

const all400 = generateFullBagOf400();
fs.writeFileSync(
  path.join(__dirname, "data", "curated-top-players.json"),
  JSON.stringify(all400, null, 2),
  "utf-8"
);
console.log(`✨ Generated ${all400.length} balanced 85+ OVR players across all eras and saved to curated cache.`);
