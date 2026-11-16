# Gaffer Arena ⚽

**A FIFA / EA Sports FC-style multiplayer football manager and live auction draft platform.**

Gaffer Arena lets a group of managers build clubs from a pool of real EA Sports FC players, bid for them in a live 20-second auction, set up a formation and tactics, then simulate a full double round-robin season with minute-by-minute match logs, league standings, and individual awards.

Built with **Next.js 15**, **React 19**, **Prisma**, **PostgreSQL**, **Auth.js**, and **Tailwind CSS**.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [How the Auction Works](#how-the-auction-works)
- [League Lifecycle](#league-lifecycle)
- [Project Structure](#project-structure)
- [Match Simulation](#match-simulation)
- [Deployment](#deployment)
- [Verification](#verification)

---

## Features

### League Creation & Lobby
- Create a league with a custom name, team name, manager name, and starting budget.
- Starting budgets are configurable from **$100M to $1000M** per team.
- Every league receives a unique **6-character invite code** for other managers to join.
- Supports up to **16 teams**, with a minimum of **2 teams** to start the auction.
- One-click AI manager backfill for quick solo testing and lobby demos.

### Live Auction Draft
- **400-player draft bag** with a balanced positional mix across forwards, wingers, midfielders, defenders, and goalkeepers.
- **20-second dynamic clock** that resets on every valid bid.
- **Only real managers bid** — there is no automatic AI bidding and no AI intervention during a manager's auction.
- If the clock expires without a bid, the player goes **Unsold** and the draft moves on.
- **Budget safeguards** reserve $1M for every mandatory empty squad slot, preventing teams from overbidding themselves into an incomplete squad.
- **Squad limits:** 16 players minimum, 21 players maximum.
- Managers can **skip** a player; if every team skips, the player is resolved immediately.
- The auction ends automatically when:
  - the player bag is exhausted, or
  - every team has reached the 21-player squad maximum.
- The league creator can also **end the auction manually** at any time.

### Commissioner Controls
- Only the league creator can:
  - **End the auction**, moving the league directly into the season phase.
  - **End the league**, marking it as `COMPLETED` and stopping further play.
- Creator permissions are enforced server-side, not just hidden in the UI.

### Squad Hub & Tactics
- Formations: `4-3-3`, `4-2-3-1`, `3-5-2`, `4-4-2`, and `5-3-2`.
- Interactive tactics pitch with drag/click player placement.
- Specialized player roles such as *Target Man*, *Poacher*, *Deep Lying Playmaker*, *Box-to-Box*, *Ball-Playing CB*, and *Sweeper Keeper*.
- Live aggregated ratings for attack, midfield, defense, and overall squad depth as the lineup changes.

### Fixtures & Match Simulation
- Automatic **double round-robin** schedule (home and away) for every team.
- Deterministic match engine factoring in:
  - Team attack, midfield, and defense ratings
  - Home-ground advantage
  - Recent form
  - Tactical matchup
  - Player traits and individual quality
- Live match viewer with an animated 1'–90' ticker, goals, saves, cards, and woodwork events.
- Full match logs are persisted and can be replayed from the fixtures list.

### Standings & Awards
- League table ranked by points, goal difference, goals scored, then head-to-head.
- **Golden Boot** leaderboard for top scorers.
- **Golden Glove** leaderboard for clean sheets.
- **MVP** leaderboard based on average match ratings.
- **Team of the Week** special-edition card showcase for standout players.

### Season Progression
- Off-season budget multipliers based on final league position:
  - 1st: **+50%**
  - 2nd: **+30%**
  - 3rd: **+20%**
  - 4th–16th: **+10%**
- Season transition modal advances the campaign and prepares the next auction draft.

### Authentication
- Google OAuth when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are configured.
- A built-in **demo credentials login** for local development and quick access.
- Guest/demo fallback keeps the app usable without OAuth setup.

### Design
- Dark glassmorphism stadium aesthetic with electric green and cyan accents.
- Light/dark theme toggle with persisted preference.
- Responsive layouts for desktop and mobile.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS, Lucide icons, Framer Motion |
| Database | PostgreSQL (Neon or self-hosted) |
| ORM | Prisma 6 |
| Auth | Auth.js / NextAuth v5 (Google OAuth + demo credentials) |
| Data source | EA Sports FC CSV dataset + curated fallback |
| Language | TypeScript |
| Runtime | Node.js 20+ |

---

## Getting Started

### Prerequisites
- **Node.js 20+**
- **npm**
- A **PostgreSQL** database (Neon, Supabase, local Postgres, etc.)

### 1. Install dependencies

```bash
git clone <your-repo-url>
cd Gaffer-Arena
npm install
```

`postinstall` runs `prisma generate`, so the Prisma client is ready after installation.

### 2. Configure the environment

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

```env
DATABASE_URL="postgresql://user:password@host:5432/gaffer_arena?sslmode=require"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
AUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST=true
```

Google OAuth is optional:

```env
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

If Google credentials are omitted, the demo login remains available.

### 3. Push the database schema

```bash
npm run db:push
```

The Prisma schema targets PostgreSQL. Use the connection string for your Neon or local Postgres database.

### 4. Seed the player database

```bash
npm run db:seed
```

The seed script:
- Fetches real EA Sports FC player data from public CSV datasets.
- Filters for **85+ OVR** players.
- Merges a bundled curated dataset to guarantee top stars are present.
- Generates 20-word scouting bios, attributes, traits, and playstyles.

If the remote datasets are unreachable, it falls back to `scripts/data/curated-top-players.json`.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Production build

```bash
npm run build
npm start
```

> The home page queries the database at build time, so `DATABASE_URL` must be reachable during `next build`.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma. |
| `NEXTAUTH_SECRET` | Yes | Secret used to sign Auth.js sessions/tokens. |
| `AUTH_SECRET` | Yes | Auth.js v5 secret (can match `NEXTAUTH_SECRET`). |
| `NEXTAUTH_URL` | Yes | Public application URL, e.g. `http://localhost:3000`. |
| `AUTH_URL` | Yes | Auth.js v5 public URL. |
| `AUTH_TRUST_HOST` | Recommended | Set to `true` for dynamic/preview domains. |
| `GOOGLE_CLIENT_ID` | Optional | Enables Google OAuth when set with the secret. |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth client secret. |

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Generate the Prisma client and create a production build. |
| `npm start` | Start the production server. |
| `npm run lint` | Run Next.js linting. |
| `npm run db:push` | Push the Prisma schema to the database. |
| `npm run db:generate` | Regenerate the Prisma client. |
| `npm run db:seed` | Fetch and seed 85+ OVR EA FC players. |
| `npm run test` | Run the database test script. |
| `npx tsx scripts/verify-e2e.ts` | Run the end-to-end verification flow. |

---

## How the Auction Works

1. **League creation** — The creator picks a starting budget between $100M and $1000M. They become the league host.
2. **Lobby** — Managers join with the 6-character code. The host can add AI-managed clubs to fill empty slots.
3. **Start auction** — Requires at least 2 teams. The league status becomes `AUCTION`.
4. **Bidding** — Only real managers place bids. Every valid bid resets the 20-second clock.
5. **Affordability rules** — A team must always keep $1M for each mandatory empty squad slot (up to 16 players). Squads cannot exceed 21 players.
6. **Resolution** — When the clock reaches zero:
   - The highest bidder signs the player and has the fee deducted from their budget.
   - With no bids, the player is marked **Unsold**.
7. **Next player** — The draft advances to the next player in the balanced bag.
8. **Auction end** — The auction ends when the bag is exhausted, when every team has 21 players, or when the creator ends it manually.
9. **Season start** — The league moves to `IN_SEASON`, where tactics and fixtures become available.

### Auction rules at a glance

| Rule | Value |
|------|-------|
| Starting budget range | $100M – $1000M |
| Bid clock | 20 seconds, resets on each bid |
| Minimum squad size | 16 players |
| Maximum squad size | 21 players |
| Reserved funds per empty mandatory slot | $1M |
| AI automatic bidding | Disabled |
| Skip behavior | Team passes on the current player |
| Early end | Creator can end the auction at any time |

---

## League Lifecycle

```
DRAFT ──► AUCTION ──► IN_SEASON ──► (season advance) ──► AUCTION
  │           │            │
  └───────────┴────────────┴──► COMPLETED (creator ends the league)
```

- **DRAFT** — Lobby is open for managers to join.
- **AUCTION** — Live player draft.
- **IN_SEASON** — Tactics, fixtures, standings, and awards are active.
- **COMPLETED** — The creator has ended the league. The off-season transition is hidden.

---

## Project Structure

```text
Gaffer-Arena/
├── prisma/
│   ├── schema.prisma          # PostgreSQL schema
│   └── schema.neon.prisma     # Neon-flavoured schema copy
├── scripts/
│   ├── seed-fifa.ts           # EA FC dataset ingestion and seeding
│   ├── generate-400-players.ts
│   ├── test-db.ts
│   ├── verify-e2e.ts          # Full end-to-end verification flow
│   └── data/
│       └── curated-top-players.json
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   └── leagues/[id]/
│   │   │       ├── auction/route.ts
│   │   │       └── matches/simulate/route.ts
│   │   ├── auth/signin/
│   │   ├── dashboard/
│   │   ├── leagues/
│   │   │   ├── create/
│   │   │   ├── join/
│   │   │   └── [id]/
│   │   │       ├── auction/
│   │   │       ├── lobby/
│   │   │       ├── matches/
│   │   │       ├── standings/
│   │   │       └── team/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auction/
│   │   ├── league/
│   │   ├── season/
│   │   ├── simulator/
│   │   ├── stats/
│   │   ├── tactics/
│   │   ├── ui/
│   │   └── providers/
│   ├── lib/
│   │   ├── actions/           # Server actions (league, season, tactics)
│   │   ├── auction/           # In-memory auction engine
│   │   ├── simulator/         # Fixtures, match engine, stats
│   │   ├── tactics/           # Formation templates and ratings
│   │   ├── auth.ts
│   │   ├── prisma.ts
│   │   └── fifa-dataset.ts
│   └── types/
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Match Simulation

The match engine is deterministic for a given match state:

- Aggregates each team's attack, midfield, and defense ratings from the selected starting XI.
- Applies home advantage, recent form, tactical mentality, and player traits.
- Produces a minute-by-minute event log including goals, assists, saves, cards, and woodwork hits.
- Persists the final score, events, statistics, and man of the match to the database.
- Updates league standings, goals, points, and individual award statistics.

Matches can be simulated individually or an entire matchday at once from the fixtures page.

---

## Deployment

### Vercel + Neon (recommended)

1. Create a PostgreSQL database on [Neon](https://neon.tech).
2. Import the repository into Vercel.
3. Add the environment variables from [Environment Variables](#environment-variables).
4. Set `AUTH_TRUST_HOST=true` and use your production URL for `NEXTAUTH_URL` / `AUTH_URL`.
5. Run `npm run db:push` against the production database.
6. Run `npm run db:seed` once to populate players.
7. Deploy.

`npm run build` already runs `prisma generate`, and the database must be reachable during the build.

### Live auction state

Auction state is held in memory by the running server process. This is ideal for local play and single-instance deployments. For multi-instance or serverless deployments with more than one active instance, use sticky sessions or replace the in-memory registry with a shared store (for example Redis) so all requests see the same auction state.

---

## Verification

Run the full end-to-end flow against a seeded database:

```bash
npx tsx scripts/verify-e2e.ts
```

This verifies:
- Player seeding
- League creation and lobby fill
- Auction bidding and resolution
- Tactics persistence
- Fixture generation
- Match simulation
- Standings and awards
- Season advancement

Run a quick database connectivity check:

```bash
npm run test
```

---

## Notes

- The player pool is filtered to **85+ OVR** to keep the draft pool star-studded.
- Auction budgets, squad sizes, and bid rules are enforced server-side.
- The league creator is the only user who can end the auction or end the league.
- AI-managed clubs are available for lobby filling, but they do not place automatic bids.

---

© 2026 Gaffer Arena — FIFA & EA Sports FC tactical manager engine.
