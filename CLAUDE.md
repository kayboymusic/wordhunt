# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Next.js Version

This project uses **Next.js 16.2.4**, which has breaking changes from older versions. Key differences:
- `src/middleware.ts` is replaced by `src/proxy.ts` — the exported function must be named `proxy`, not `middleware`
- Read `node_modules/next/dist/docs/` before making assumptions about Next.js APIs

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build
npm run lint     # ESLint
npx tsc --noEmit # type check without building
```

No test suite exists yet.

## Environment Variables

Copy `.env.example` → `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY` — from Supabase dashboard
- `RESEND_API_KEY` — for challenge invite emails
- `NEXT_PUBLIC_APP_URL` — deployed URL (or `http://localhost:3000` for dev)

Run `supabase/migration.sql` in the Supabase SQL editor to create tables.

## Architecture

### Dual-mode game engine

`useGame` (`src/hooks/useGame.ts`) operates in two modes:
1. **Server mode** — calls `/api/game/start` → `/api/game/guess`. Guess evaluation is server-side only; the answer is never sent to the client. Player identity is a UUID stored in `localStorage` (`wh_player_token`).
2. **Local mode** — automatic fallback when Supabase is unavailable. Evaluation runs client-side using `evaluateGuess` + `getDailyWord` from `src/lib/utils/`. State persists to `localStorage` (`wh_local_session`). `sessionId` is set to the string `"local"` to signal this mode.

The mode switch happens silently in `initSession()` — if both `/api/game/state` and `/api/game/start` fail, `localMode.current = true` and `sessionId = "local"`.

### State flow

Zustand store (`src/store/gameStore.ts`) holds all game state: `guesses`, `currentGuess`, `status`, `keyStates`, `error`, `sessionId`. `keyStates` is a `Record<string, LetterState>` where `addGuess` merges letter states with a priority (`correct > present > absent`) to correctly color the on-screen keyboard.

Error lifecycle: the hook calls `store.setError("msg")` and the page (`src/app/page.tsx`) owns clearing — it shows a toast for 1800ms then calls both `setToast(null)` and `setError(null)`. Do not add `setTimeout(() => store.setError(null))` inside the hook.

### 3D tile animation

`Tile.tsx` manages its own flip state with `useState` + `useEffect`. It starts flipped (`useState(() => isResult(state))`) for page restores. It animates when `state` transitions from a non-result to a result state — it uses `prevStateRef` to detect this transition and schedules `setFlipped(true)` after a stagger `delay` (passed from `GameBoard` as `colIdx * 120ms`). The CSS uses `rotateX(180deg)` (not 360) with `preserve-3d` and `backface-visibility: hidden` on both faces so the back face (colored) is what's visible post-flip.

### Challenge flow

`CREATE → PENDING → IN_PROGRESS → COMPLETED` (or `CANCELLED` / `EXPIRED`)

- Creator POSTs `/api/challenge/create` → DB row + fire-and-forget Resend email to opponent
- Opponent visits `/challenge/[id]?token=[invite_token]`, enters email, POSTs `/api/challenge/accept`
- Creator's page polls `GET /api/challenge/[id]` every 5 seconds (via `useChallenge`) until status is no longer `pending`
- Both players' game sessions are locked until `status = in_progress`

### API routes (all in `src/app/api/`)

All routes use `createServerClient()` (service role key, bypasses RLS). Zod validates every request body. The answer word is computed server-side via `getDailyWord(new Date(session.game_date))` and never returned to the client.

Rate limiting on `POST /api/game/guess`: 10 req/min per IP, enforced in `src/proxy.ts` using an in-memory map (replace with Upstash Redis for multi-instance production).

### Daily word

`getDailyWord()` in `src/lib/utils/getDailyWord.ts` is deterministic: `dayIndex = (UTC_today - epoch_2025-01-01) / 86400000`, then `ANSWERS[dayIndex % ANSWERS.length]`. Always uses UTC (`getUTCFullYear` etc.) to keep the word consistent globally. The answer list lives in `src/lib/words/answers.ts`.

### Supabase clients

- `src/lib/supabase/client.ts` — browser client (anon key), for future use
- `src/lib/supabase/server.ts` — `createServerClient()` with service role key, used in all API routes
