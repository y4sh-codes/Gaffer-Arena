# Gaffer Arena ⚽
### FIFA & EA Sports FC-Style Multiplayer Manager & Auction Draft Platform

Gaffer Arena is a multiplayer tactical football management platform built with Next.js 15, Prisma ORM, Neon PostgreSQL / SQLite, Auth.js, and Tailwind CSS. It features real-time 16-player interactive auction bidding with a 20-second dynamic reset clock, an interactive drag-and-drop tactics pitch, deterministic matchday simulation with live animated clock tickers (1'–90'), double round-robin fixtures, league standings, individual awards (Golden Boot, Golden Glove, MVP), and off-season budget progression.

---

## ⚡ Key Highlights & Architecture

### Phase 1: Real EA FC Dataset Ingestion & Seeding
- **Data Source**: Fetches real EA Sports FC player records from GitHub raw datasets, parses CSV data with PapaParse, and filters for world-class stars (**85+ OVR** across modern players, Icons, and Heroes).
- **Bio Synthesis**: Dynamically generates concise, authentic **20-word player scouting bios** highlighting each player's top 3 pillar attributes and tactical role.
- **Attributes & Traits**: Mapped pillar stats (`PAC/SPE`, `SHO/ATT`, `PAS`, `DRI`, `DEF`, `PHY`), playstyles (`Finesse Shot+`, `Quick Step+`, `Tiki Taka+`), and traits.

### Phase 2: League Creation, 6-Char Entry Codes & 16-Team Lobby
- **Commissioners**: Create custom leagues with configurable starting budgets ($100M–$500M) and unique 6-character secret invite codes.
- **Managers**: Join existing draft lobbies via entry code with custom Team Name & Manager Name.
- **Lobby Controls**: Enforces strict 16-team maximum caps and allows one-click AI manager backfill for rapid solo/multiplayer testing.

### Phase 3: Real-Time Live Player Auction Draft Engine
- **400-Player Bag**: Balanced draft pool ensuring fair positional distribution across FW/ST, RW/LW, CAM/CM/CDM, CB/LB/RB, and GK.
- **20-Second Dynamic Active Clock**: Every new bid instantly resets the clock back to 20 seconds.
- **Team Budget & Squad Safeguards**: Prevents overbidding by strictly reserving minimum funds ($1M/slot) required to fill mandatory 16-player squad sizes (max 21).
- **Skip Mechanics**: Teams can vote to pass; if all active managers skip, player is marked Unsold.

### Phase 4: FIFA-Style Tactics Pitch & Squad Hub
- **Formations**: Full support for `4-3-3`, `4-2-3-1`, `3-5-2`, `4-4-2`, and `5-3-2`.
- **Interactive Pitch**: Drag/click tactical discs on authentic turf pitch with penalty boxes and center circle markings.
- **Specialized Roles**: Assign roles such as *Target Man*, *Poacher*, *Deep Lying Playmaker*, *Box-to-Box*, *Ball-Playing CB*, and *Sweeper Keeper*.
- **Live Aggregated Ratings**: Attack, Midfield, Defense, and Overall Squad Depth calculated dynamically in real-time as lineups change.

### Phase 5: Double Round-Robin Fixtures & Live Match Simulator
- **Fixture Engine**: Automatically schedules $N$ teams across Home & Away matches (240 matches for 16 teams).
- **Deterministic Simulation Algorithm**: Factorizes Home Ground Advantage boost (+7%), head-to-head position ratings, recent 3-match form momentum, tactical clashes, and player traits.
- **60–90 Second Live Ticker**: Animated real-time match viewer running 1' to 90' with goal flashes, key saves, cards, and woodwork incidents.

### Phase 6: League Statistics & Off-Season Progression Engine
- **Standings Table**: Ranked dynamically by Points (PTS) → Goal Difference (GD) → Goals Scored (GF) → Head-to-Head records.
- **Awards Leaderboards**: Golden Boot (top scorers), Golden Glove (clean sheets), and MVP (average match ratings).
- **Team of the Week (TOTW)**: EA FC special edition black & gold cards honoring the matchday's top 11 performers.
- **Off-Season Budget Multipliers**:
  - **1st Place (Champion)**: **+50%** budget boost for next season.
  - **2nd Place**: **+30%** budget boost.
  - **3rd Place**: **+20%** budget boost.
  - **4th–16th Place**: **+10%** budget boost.
- **Season Transition Modal**: Confetti celebration advancing campaign and refreshing funds for the next draft.

### Phase 7: EA Sports FC Menu Aesthetic & Design System
- Sleek dark glassmorphism stadium atmosphere with electric green (`#00ff87`) and cyan (`#00f0ff`) neon accents.
- Light mode toggle with clean high-contrast sports analytics aesthetics.
- Zero AI-slop UI: precise borders, micro-interactions, responsive FUT cards.

---

## 🚀 Getting Started

### 1. Environment Setup
Create a `.env` file (or copy from `.env.example`):
```bash
cp .env.example .env
```

Contents of `.env`:
```env
# For local zero-config development (SQLite):
DATABASE_URL="file:./dev.db"

# For Neon PostgreSQL deployment:
# DATABASE_URL="postgresql://user:password@ep-sample-pooler.us-east-2.aws.neon.tech/gaffer_arena?sslmode=require"

NEXTAUTH_SECRET="gaffer-arena-super-secret-development-key-32chars"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 2. Database Synchronization & FIFA Seeding
Sync your schema and seed over 600+ real 85+ OVR EA FC players:
```bash
npm run db:push
npm run db:seed
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run End-to-End Test Suite
To verify the entire 7-phase loop programmatically:
```bash
npx tsx scripts/verify-e2e.ts
```

### 5. Production Build
```bash
npm run build
npm start
```
