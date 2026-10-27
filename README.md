# LANKA FINTECHVERSE — Snakes & Ladders
### Sri Lanka FinTech Festival 2026 Official Digital Game

A production-ready, short-form digital Snakes & Ladders game built with **Next.js (App Router)** and **Supabase (PostgreSQL + Auth + RLS)**, themed specifically for the **Sri Lanka FinTech Festival 2026** (2–3 November 2026).

---

## 1. Features & Architecture

- **Festival Brand Identity:** Designed using official festival color palette:
  - Yellow: `#FEC01F`
  - Orange: `#F57222`
  - Teal: `#125252`
  - Burgundy: `#8D1739`
- **5 × 5 Serpentine Board (25 Squares):**
  - **Ladders:**
    - Square 3 → 8 (*Digital payments*)
    - Square 6 → 11 (*Financial inclusion*)
    - Square 10 → 17 (*Innovation*)
    - Square 14 → 22 (*Entrepreneurship*)
  - **Snakes:**
    - Square 12 → 5 (*Ordinary risk*, -10 pts)
    - Square 19 → 9 (*Major risk*, -25 pts & -1 Heart)
    - Square 21 → 13 (*Ordinary risk*, -10 pts)
    - Square 24 → 16 (*Major risk*, -25 pts & -1 Heart)
  - **Special Squares:**
    - Squares 4, 15, 18: FinTech Quiz (+50 pts for correct answer)
    - Squares 7, 20: Treasure (+50 pts and 1 protective Shield, max 2)
  - **Finish (Square 25):** Exact roll required. Overshooting keeps player in current position.
- **Server-Authoritative Game Engine:**
  - All dice rolls, state transitions, scoring, and heart/shield resolutions are computed authoritatively on the server using cryptographically secure random values (`crypto.getRandomValues`).
  - Pure, deterministic transition functions in `lib/game-engine/engine.ts`.
- **One Official Attempt Per Account:**
  - Enforced at database level via `UNIQUE (player_id)` on `game_runs`.
  - Automatic resume across reloads, browser closures, or connection interruptions.
- **Google OAuth via Supabase Auth:**
  - No ticket requirement; open to all public participants.
  - Automatically creates player profile with customizable public display name.
- **Privacy & Voluntary Leaderboard:**
  - Strict separation of private auth data and public leaderboard data.
  - Email addresses and Google user IDs are never exposed or stored in public views.
  - Leaderboard participation requires explicit opt-in (can opt out at any time).
- **Result Cards & Social Sharing:**
  - Generates downloadable high-resolution branded cards with dynamic QR codes:
    - 1080 × 1350 px for Social Feed Posts
    - 1080 × 1920 px for Stories
  - Unique, safe challenge links that allow friends to play without leaking identity.
- **25-Question FinTech Knowledge Bank:**
  - Covering Digital Payments, Cybersecurity, Digital Banking, Fraud Prevention, Financial Inclusion, Sri Lankan Digital Economy (LankaPay, CBSL), and Blockchain.

---

## 2. Project Structure

```
├── app/
│   ├── layout.tsx                     # Root layout with festival metadata & fonts
│   ├── page.tsx                       # Landing page with rules, CTA, and leaderboard preview
│   ├── globals.css                    # Tailwind CSS v4 + brand styling & board animations
│   ├── game/
│   │   ├── page.tsx                   # Authoritative game board & gameplay screen
│   │   └── result/page.tsx            # End-of-game card, stats, opt-in, and PNG downloads
│   ├── leaderboard/page.tsx           # Public leaderboard with tie-break rules & podium
│   ├── challenge/[token]/page.tsx     # Challenge link landing page
│   ├── auth/callback/route.ts         # Supabase OAuth redirect & profile initialization
│   └── api/
│       ├── game/
│       │   ├── start/route.ts         # Idempotent run creator / retriever
│       │   ├── state/route.ts         # Authoritative game state fetch
│       │   ├── roll/route.ts          # Server dice roll & turn processor
│       │   └── quiz/route.ts          # Quiz answer verification & score delta
│       ├── leaderboard/route.ts       # Opted-in public rankings
│       ├── profile/route.ts           # Display name & opt-in updates
│       └── share/
│           ├── card/route.ts          # Safe card metadata
│           └── link/route.ts          # Unique challenge token generator
├── components/
│   ├── game/
│   │   ├── Board.tsx                  # 5x5 serpentine board grid with badges & tokens
│   │   ├── DicePanel.tsx              # Interactive dice with 3D dot faces & rolling status
│   │   ├── PlayerPanel.tsx            # Hearts, shields, score, and position indicators
│   │   ├── EventLog.tsx               # Monotonic game event chronicle
│   │   ├── QuizOverlay.tsx            # Modal quiz interaction with category & difficulty
│   │   ├── TreasureOverlay.tsx        # Treasure & shield reward popup
│   │   └── OnboardingModal.tsx        # Display name & voluntary leaderboard opt-in
├── lib/
│   ├── game-engine/
│   │   ├── board-config.ts            # Central single-source-of-truth board rules
│   │   ├── engine.ts                  # Pure state transition machine
│   │   └── quiz-bank.ts               # 25 reviewed FinTech multiple-choice questions
│   ├── supabase/
│   │   ├── client.ts                  # Browser Supabase client
│   │   ├── server.ts                  # Server & service-role Supabase clients
│   │   └── middleware.ts              # Session refresher & route protector
│   └── utils/
│       └── card-generator.ts          # Canvas-based 1080x1350 and 1080x1920 card generator
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql     # Full PostgreSQL schema, RLS, indexes & views
├── tests/
│   ├── game-engine.test.ts            # Board, movement, ladder/snake, and quiz tests
│   └── engine-security.test.ts        # Computer parity, terminal immutability & score bounds
├── middleware.ts                      # Next.js proxy middleware for auth
└── package.json
```

---

## 3. Database Setup (Supabase)

1. Open your Supabase Project Dashboard: [https://supabase.com](https://supabase.com).
2. Go to the **SQL Editor**.
3. Copy the contents of `supabase/migrations/001_initial_schema.sql` and run it.
4. The migration sets up:
   - `player_profiles`: Public display names, avatars, opt-in flags with RLS.
   - `game_runs`: Enforces `UNIQUE (player_id)` (one run per human), tracking positions, hearts, shields, and scores.
   - `game_moves`: Monotonic turn sequences with idempotent constraints.
   - `score_ledger`: Auditable record of all score changes.
   - `quiz_attempts`: Prevents duplicate quiz scoring for the same square.
   - `leaderboard_entries`: Materialized ranking table populated only for opted-in players.
   - `challenge_links`: Random tokens for share cards with 90-day expiry.
   - `public_leaderboard`: Public view filtering out all private information.

---

## 4. Google OAuth Configuration in Supabase

1. In Supabase Dashboard, navigate to **Authentication** → **Providers** → **Google**.
2. Enable Google login.
3. In [Google Cloud Console](https://console.cloud.google.com/):
   - Create an OAuth 2.0 Client ID (Web Application).
   - Under **Authorized redirect URIs**, paste the Supabase Callback URL:
     `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`
   - Copy the Client ID and Client Secret from Google Console into the Supabase Google Provider settings.
4. In Supabase Dashboard under **Authentication** → **URL Configuration**:
   - Set **Site URL** to `http://localhost:3000` (or your production domain).
   - Add `http://localhost:3000/**` to **Redirect URLs**.

---

## 5. Local Setup & Environment Variables

1. Clone or open this repository:
   ```bash
   cd "Fintech Snakes and ladders"
   ```
2. Create `.env.local` using `.env.example` as reference:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
3. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Running Automated Tests

Run the test suite using Vitest:
```bash
npm test
```
Or run in watch mode:
```bash
npx vitest
```

### Verified Test Coverage:
- **Board and Movement (25 tests):**
  - Board configuration validation (size 25, 3 start hearts, no overlap).
  - Forward ladders and backward snakes.
  - Exact roll to finish on square 25 and overshoot behavior.
  - Identical movement rules for human player and computer opponent.
- **Hearts, Shields & Rewards:**
  - Major-risk snakes remove hearts unless a shield is consumed.
  - Ordinary snakes do not deduct hearts.
  - Shields are awarded from treasures (up to 2 maximum) and consumed on impact.
  - Player or computer eliminated at 0 hearts.
- **Scoring & Ledgers:**
  - Movement score awarded only for dice roll (+10 per square).
  - Ladder (+25), Ordinary Snake (-10), Major Snake (-25).
  - Remaining hearts (+100 each), Finish (+300), Defeat computer (+200).
  - Score cannot drop below zero.
- **Security & Terminal State:**
  - Disallows moves on completed or eliminated games.
  - Idempotent turn sequence processing.

---

## 7. Production Build Verification

Verify that the Next.js production build succeeds:
```bash
npm run build
```
This performs full TypeScript compilation, Next.js optimization, and route generation for all pages and APIs.
