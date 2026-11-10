import fs from "fs";
import path from "path";
import Papa from "papaparse";
import prisma from "../src/lib/prisma";
import {
  processRawRecord,
  ProcessedPlayer,
  RawFifaPlayerRecord,
} from "../src/lib/fifa-dataset";

const GITHUB_CSV_URLS = [
  "https://raw.githubusercontent.com/BafanaCode/Advanced-Data-Analysis-and-Visualization-fc24-analysis/main/male_players.csv",
  "https://raw.githubusercontent.com/stefanoleone992/datasets/master/ea_sports_fc24/male_players.csv",
];

async function fetchCsvWithTimeout(url: string, timeoutMs = 12000): Promise<string | null> {
  try {
    console.log(`🌐 Fetching EA FC dataset from: ${url}`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`⚠️ Remote server responded with status: ${response.status}`);
      return null;
    }
    const text = await response.text();
    console.log(`✅ Successfully downloaded ${(text.length / 1024 / 1024).toFixed(2)} MB of raw FIFA data.`);
    return text;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn(`⚠️ Network fetch failed (${errorMsg}), checking fallback...`);
    return null;
  }
}

async function getRawPlayerRecords(): Promise<RawFifaPlayerRecord[]> {
  for (const url of GITHUB_CSV_URLS) {
    const csvContent = await fetchCsvWithTimeout(url);
    if (csvContent) {
      const parsed = Papa.parse<RawFifaPlayerRecord>(csvContent, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      });
      if (parsed.data && parsed.data.length > 0) {
        console.log(`📊 Successfully parsed ${parsed.data.length} total players from GitHub.`);
        return parsed.data;
      }
    }
  }

  // Fallback to local curated top player dataset
  console.log("📁 Loading fallback curated 85+ player dataset from local cache...");
  const localCachePath = path.join(__dirname, "data", "curated-top-players.json");
  if (fs.existsSync(localCachePath)) {
    const rawCache = fs.readFileSync(localCachePath, "utf-8");
    return JSON.parse(rawCache) as RawFifaPlayerRecord[];
  }

  throw new Error("No player dataset source could be reached or read!");
}

async function main() {
  console.log("⚽ Starting FIFA EA FC Database Ingestion & Seeding...");

  const rawRecords = await getRawPlayerRecords();
  console.log(`🔍 Processing ${rawRecords.length} records. Filtering for OVR >= 85...`);

  const processedMap = new Map<number, ProcessedPlayer>();

  for (const record of rawRecords) {
    const processed = processRawRecord(record);
    if (processed && !processedMap.has(processed.externalFifaId)) {
      processedMap.set(processed.externalFifaId, processed);
    }
  }

  // Ensure curated dataset is also merged in to guarantee all superstars exist
  const localCachePath = path.join(__dirname, "data", "curated-top-players.json");
  if (fs.existsSync(localCachePath)) {
    const rawCurated = JSON.parse(fs.readFileSync(localCachePath, "utf-8")) as RawFifaPlayerRecord[];
    for (const record of rawCurated) {
      const processed = processRawRecord(record);
      if (processed && !processedMap.has(processed.externalFifaId)) {
        processedMap.set(processed.externalFifaId, processed);
      }
    }
  }

  const playersToSeed = Array.from(processedMap.values());
  console.log(`⭐ Found ${playersToSeed.length} elite players (85+ OVR) ready for database insertion.`);

  let insertedCount = 0;
  for (const p of playersToSeed) {
    await prisma.player.upsert({
      where: { externalFifaId: p.externalFifaId },
      update: {
        name: p.name,
        cardYear: p.cardYear,
        nationality: p.nationality,
        league: p.league,
        team: p.team,
        ovr: p.ovr,
        pos: p.pos,
        att: p.att,
        def: p.def,
        pas: p.pas,
        phy: p.phy,
        dri: p.dri,
        spe: p.spe,
        traits: JSON.stringify(p.traits),
        playstyle: p.playstyle,
        rating: p.rating,
        bio20Words: p.bio20Words,
        image: p.image,
      },
      create: {
        externalFifaId: p.externalFifaId,
        name: p.name,
        cardYear: p.cardYear,
        nationality: p.nationality,
        league: p.league,
        team: p.team,
        ovr: p.ovr,
        pos: p.pos,
        att: p.att,
        def: p.def,
        pas: p.pas,
        phy: p.phy,
        dri: p.dri,
        spe: p.spe,
        traits: JSON.stringify(p.traits),
        playstyle: p.playstyle,
        rating: p.rating,
        bio20Words: p.bio20Words,
        image: p.image,
      },
    });
    insertedCount++;
  }

  console.log(`🏆 Successfully seeded ${insertedCount} 85+ OVR players into the database!`);

  // Sample check
  const sample = await prisma.player.findFirst({
    orderBy: { ovr: "desc" },
  });
  if (sample) {
    console.log("🌟 Highest OVR Player Sample:", {
      name: sample.name,
      ovr: sample.ovr,
      pos: sample.pos,
      club: sample.team,
      bio20Words: sample.bio20Words,
      stats: {
        spe: sample.spe,
        att: sample.att,
        pas: sample.pas,
        dri: sample.dri,
        def: sample.def,
        phy: sample.phy,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
