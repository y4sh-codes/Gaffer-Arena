# Gaffer Arena - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build "Gaffer Arena", a full-featured FIFA/EA Sports FC-style multiplayer manager and live auction draft platform with real-world dataset ingestion, live bidding auction clock, interactive tactics pitch, deterministic match simulation, dynamic standings/awards, and off-season budget progression.

**Architecture:** Next.js 15 App Router full-stack application with TypeScript and Tailwind CSS. Neon PostgreSQL / Prisma ORM data layer with robust schema. NextAuth/Auth.js supporting Google OAuth and instant demo manager access. Live auction state machine with dynamic 20s timers, real-time sync, and squad validation. Interactive pitch visualizer for tactics and formations. Deterministic match simulator with minute-by-minute live log engine and double round-robin fixture generator.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Prisma ORM, Neon PostgreSQL / SQLite fallback, Auth.js (NextAuth v5), Zustand, Lucide React, Framer Motion, Papaparse / CSV parser.

## Global Constraints
- Target Node.js v20+ (current system: Node v26)
- Next.js App Router with Server Actions & API Routes
- Responsive EA Sports FC dark glassmorphism design with high-contrast electric accents and light mode support
- Strict budget and squad size enforcement: min 16 players, max 21 players per team
- Zero external credentials required for local development (automatic fallback mock/local demo auth and database)

## Review Focus
- Database seeding handles network failures gracefully by having a local fallback cache of top 85+ players if GitHub raw fetch encounters network issues.
- Auction timer handles rapid bidding without race conditions; resets timer to 20s accurately.
- Bidding arithmetic strictly prevents managers from spending below the minimum required to fill remaining slots (16 total squad minimum).
- Pitch builder handles swapping players across different formations without data loss or invalid line-up states.
- Match simulation generates plausible results and statistically sound events consistent with player ratings and tactical styles.

---

### Task 1: Project Scaffolding, Database Models & Authentication Setup
**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `next.config.ts`
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `.env.example`
- Create: `src/types/index.ts`
- Test: `tests/schema.test.ts` or validation script `scripts/test-db-connection.ts`

**Steps:**
- [ ] Initialize Next.js 15 project with TypeScript, Tailwind CSS, Lucide Icons, and Framer Motion.
- [ ] Configure `prisma/schema.prisma` with User, League, Team, Player, TeamPlayer, and Match models matching all prompt fields.
- [ ] Generate Prisma client and configure database connection helper.
- [ ] Configure NextAuth (Auth.js) with Google Provider and Credentials/Demo Manager Provider for instant zero-config testing.
- [ ] Create `.env.example` with standard placeholders as specified in Phase 1 prompt.
- [ ] Verify build and schema compilation.

---

### Task 2: Real EA FC FIFA Player Dataset Ingestion Pipeline
**Files:**
- Create: `scripts/seed-fifa.ts`
- Create: `src/lib/fifa-dataset.ts`
- Create: `scripts/data/curated-top-players.json` (fallback backup of top 85+ players)
- Test: Run `npx tsx scripts/seed-fifa.ts`

**Steps:**
- [ ] Implement CSV fetcher pulling from GitHub raw dataset with fallback to bundled curated 85+ player cache.
- [ ] Parse CSV columns (short_name, overall, player_positions, pace, shooting, passing, dribbling, defending, physic, player_traits, etc.).
- [ ] Filter players with Overall Rating (OVR) >= 85.
- [ ] Generate dynamic 20-word player bios based on position and top 3 pillar attributes.
- [ ] Map attributes cleanly into the Player Prisma model.
- [ ] Execute seeding script and verify database contains top-tier FIFA players across all key positions.

---

### Task 3: League Creation, Joining & Lobby Management (Phase 2)
**Files:**
- Create: `src/app/dashboard/page.tsx`
- Create: `src/app/leagues/create/page.tsx`
- Create: `src/app/leagues/join/page.tsx`
- Create: `src/app/leagues/[id]/lobby/page.tsx`
- Create: `src/lib/actions/league-actions.ts`
- Create: `src/components/league/LeagueLobby.tsx`
- Test: Verify league creation, 6-character code generation, 16-team maximum limit check, and lobby member list.

**Steps:**
- [ ] Create dashboard showing user's active leagues with "Create League" and "Join League" actions.
- [ ] Implement league creation Server Action with custom starting budget ($100M-$500M) and unique 6-char secret code.
- [ ] Implement join league Server Action prompting for Team Name and Manager Name, strictly enforcing 16 teams cap.
- [ ] Build Lobby UI displaying registered teams, host controls to launch auction, and league parameters.

---

### Task 4: Real-Time Live Player Auction Draft Engine (Phase 3)
**Files:**
- Create: `src/lib/auction/auction-manager.ts`
- Create: `src/stores/auction-store.ts`
- Create: `src/app/leagues/[id]/auction/page.tsx`
- Create: `src/components/auction/PlayerAuctionCard.tsx`
- Create: `src/components/auction/AuctionClock.tsx`
- Create: `src/components/auction/BiddingConsole.tsx`
- Create: `src/components/auction/AuctionSquadOverview.tsx`
- Create: `src/app/api/leagues/[id]/auction/route.ts`
- Test: Test auction timer reset on bid, skip counting, squad limits (16 min, 21 max), and budget reservation.

**Steps:**
- [ ] Implement 400-player bag selection balanced across FW/ST, RW/LW, CAM/CM/CDM, CB/LB/RB, and GK.
- [ ] Build auction state engine: 20s active clock per player, bid (+X) actions, skip votes.
- [ ] Implement 20-second timer reset on new highest bid; assign player immediately upon timer expiration.
- [ ] If all teams skip or timer expires with no bids, mark player as Unsold.
- [ ] Enforce team constraints (min 16 players, max 21 players, reserve $1M per remaining empty mandatory slot).
- [ ] Build live auction UI with EA Sports card styling, real-time bid logs, and team squad overview.

---

### Task 5: FIFA-Style Team Hub & Tactics Board (Phase 4)
**Files:**
- Create: `src/app/leagues/[id]/team/page.tsx`
- Create: `src/components/tactics/TacticsPitch.tsx`
- Create: `src/components/tactics/PlayerSlot.tsx`
- Create: `src/components/tactics/TacticsControls.tsx`
- Create: `src/components/tactics/TeamRatingsBadge.tsx`
- Create: `src/lib/tactics/formation-templates.ts`
- Create: `src/lib/actions/tactics-actions.ts`
- Test: Verify formation switching (4-3-3, 4-2-3-1, 3-5-2, 4-4-2), role assignments, and dynamic rating calculations.

**Steps:**
- [ ] Build interactive football pitch component with tactical grid matching authentic FIFA team management.
- [ ] Implement standard formations: 4-3-3, 4-2-3-1, 3-5-2, 4-4-2 with draggable/clickable starter & reserve swap.
- [ ] Add player role configuration (Target Man, Deep Lying Playmaker, Sweeper Keeper, Box-to-Box, Inverted Winger).
- [ ] Add team mentality settings (Attacking, Balanced, Park the Bus) and defensive depth slider.
- [ ] Compute live aggregated team ratings (Attack, Midfield, Defense, Overall Depth) reflecting active starters.

---

### Task 6: Double Round-Robin Fixtures & Live Match Simulator (Phase 5)
**Files:**
- Create: `src/lib/simulator/fixture-generator.ts`
- Create: `src/lib/simulator/match-engine.ts`
- Create: `src/app/leagues/[id]/matches/page.tsx`
- Create: `src/app/leagues/[id]/matches/[matchId]/page.tsx`
- Create: `src/components/simulator/LiveMatchView.tsx`
- Create: `src/components/simulator/MatchEventsTimeline.tsx`
- Create: `src/components/simulator/FixtureScheduleList.tsx`
- Create: `src/app/api/leagues/[id]/matches/simulate/route.ts`
- Test: Verify double round-robin generator symmetry and match simulation deterministic engine.

**Steps:**
- [ ] Build double round-robin schedule generator (each pair of teams plays 1 Home and 1 Away).
- [ ] Implement deterministic match simulation algorithm factorizing:
  - Home Ground Advantage boost (stat multiplier)
  - Head-to-Head player position clashes (attacker shooting/pace vs defender defending/physic)
  - Team form state (weighted last 3 matches)
  - Tactical counter clash (High Press vs Counter Attack, etc.)
  - Player playstyles & traits
- [ ] Build 60-90 second simulated real-time match view with live clock ticker (1' to 90') and instant simulate option.
- [ ] Build minute-by-minute timeline feed displaying goals, scorers, assists, saves, and yellow/red cards.

---

### Task 7: League Statistics Dashboard & Off-Season Progression Engine (Phase 6)
**Files:**
- Create: `src/app/leagues/[id]/standings/page.tsx`
- Create: `src/app/leagues/[id]/stats/page.tsx`
- Create: `src/components/stats/StandingsTable.tsx`
- Create: `src/components/stats/AwardsLeaderboard.tsx`
- Create: `src/components/stats/TeamOfTheWeek.tsx`
- Create: `src/lib/actions/season-actions.ts`
- Create: `src/components/season/SeasonTransitionModal.tsx`
- Test: Verify tiebreakers (Points, GD, GF, H2H) and budget multiplier application for new season.

**Steps:**
- [ ] Build dynamic Standings table with PTS, W, D, L, GF, GA, GD, and head-to-head tiebreakers.
- [ ] Implement Individual Awards Leaderboards: Golden Boot (top scorers), Golden Glove (clean sheets), MVP (match ratings), and Team of the Week (TOTW).
- [ ] Implement end-of-season budget multipliers (1st: +50%, 2nd: +30%, 3rd: +20%, 4th-16th: +10%).
- [ ] Add Season Transition screen advancing currentSeason and applying refreshed budgets for the next draft.

---

### Task 8: Design System, EA Sports FC Glassmorphism & System Polish (Phase 7)
**Files:**
- Create: `src/components/ui/Navbar.tsx`
- Create: `src/components/ui/FutCard.tsx`
- Create: `src/components/ui/ThemeToggle.tsx`
- Update: `src/app/layout.tsx`
- Update: `src/app/globals.css`
- Test: End-to-end integration test covering league creation -> auction -> tactics -> match simulation -> standings.

**Steps:**
- [ ] Implement EA Sports FC aesthetic: dark mode stadium atmosphere, glassmorphic frosted cards, neon electric green & cyan accents.
- [ ] Add light mode theme toggle with high-contrast sports analytics styling.
- [ ] Add sound effects toggle / auditory cues for auction countdown and match goals.
- [ ] Verify complete user flow across all 7 phases with zero runtime or layout errors.
