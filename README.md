# Forge — Resistance Training & Nutrition

A full-stack web app combining an interactive 3D anatomy-based exercise selector with AI-assisted diet tracking.

- **Workout tab**: a rotatable 3D mannequin with 15 clickable muscle groups. Pick a muscle, get exercises ranked by an evidence-informed score (EMG + hypertrophy meta-analysis + replication + practical efficacy), with citations available behind every score.
- **Diet tab**: log meals from a photo. Vision model proposes items, grams, and macros with per-item confidence levels — you confirm or edit before anything saves. Macro rings show progress against goals. A meal-plan generator builds compliant plans against your targets and restrictions.
- **Settings**: gender (controls mannequin), units, height/weight, dietary restrictions, macro targets.
- **History**: 30-day session count, total tonnage, weekly working sets per muscle, daily intake.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) + React 19 + TypeScript (strict) |
| Styling | Tailwind v4 + custom shadcn-style primitives |
| 3D | React Three Fiber + drei + Three.js |
| State | Zustand (client) + TanStack Query (server) |
| Auth | NextAuth (Google + email magic link) |
| DB | Prisma (SQLite local / Postgres on Vercel) |
| AI | Anthropic SDK · `claude-haiku-4-5` for vision + plan generation |
| Storage | Vercel Blob for meal photos |
| Deploy | Vercel-ready, see `vercel.json` |

> **Version note**: `create-next-app` now ships Next.js 16 by default; this project is pinned to Next 15 to match the spec. The relevant App Router APIs are unchanged across the bump.

## Quick start

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env
# Fill in ANTHROPIC_API_KEY at minimum. The rest are optional for local dev:
#  - GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET → Google sign-in
#  - EMAIL_SERVER / EMAIL_FROM             → magic-link sign-in
#  - BLOB_READ_WRITE_TOKEN                 → meal-photo uploads
#  - DATABASE_URL                          → defaults to "file:./dev.db" (SQLite)

# 3. Initialise the database and seed exercises
npx prisma db push
npm run seed

# 4. Run
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | `file:./dev.db` for local. For Vercel: set to your Vercel Postgres URL **and** change `provider` in `prisma/schema.prisma` from `sqlite` to `postgresql`. |
| `NEXTAUTH_SECRET` | yes | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | yes | `http://localhost:3000` locally; production URL on Vercel |
| `ANTHROPIC_API_KEY` | for AI routes | Required by `/api/analyze-meal` and `/api/generate-meal-plan` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | optional | Google sign-in |
| `EMAIL_SERVER`, `EMAIL_FROM` | optional | Email magic-link sign-in (any SMTP URL) |
| `BLOB_READ_WRITE_TOKEN` | for meal photos | If unset, the app still works — users can describe meals as text |

## Deployment to Vercel

1. Push this repo to GitHub.
2. Create a new Vercel project; connect the repo.
3. Add environment variables (see above).
4. Provision Vercel Postgres and set `DATABASE_URL`.
5. Switch `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`.
6. Provision Vercel Blob; copy the read/write token into `BLOB_READ_WRITE_TOKEN`.
7. The build command (`prisma generate && next build`) is configured in `vercel.json`.
8. After the first deploy: run `npx prisma db push` against the Postgres URL, then `npm run seed`.

## Architecture overview

```
src/
  app/
    (app)/              ← signed-in shell (TopNav + MobileTabBar)
      workout/          ← 3D mannequin + exercise panel + session dock
      diet/             ← daily macro log; /diet/plans for generator
      history/          ← stats and heatmap
      settings/         ← profile + macros
    api/                ← typed route handlers (auth, exercises,
                          sessions, meals, analyze-meal, generate-meal-plan,
                          stats, profile, upload-meal-photo)
    signin/             ← NextAuth sign-in screen
    page.tsx            ← marketing landing
  components/
    ui/                 ← shadcn-style primitives (button, card, dialog,
                          popover, select, tabs, badge, progress, …)
    workout/            ← MannequinScene, MuscleList, ExercisePanel,
                          ExerciseCard, ScorePopover, TechniqueDialog,
                          SessionDock
    diet/               ← MacroRings, MealList, LogMealDialog
    app-nav.tsx         ← top + bottom navigation
    providers.tsx       ← Session + React Query providers
  data/
    citations.ts        ← reusable bibliography
    exercises.ts        ← 70+ seed exercises with score breakdowns
  lib/
    anthropic.ts, auth.ts, blob.ts, db.ts,
    exercise-mapping.ts, muscles.ts, types.ts, utils.ts,
    zod-schemas.ts
  store/
    workout-store.ts    ← Zustand (selected muscle, draft session)
prisma/
  schema.prisma         ← User, Profile, MacroGoal, Exercise, Session*,
                          Meal*, MealPlan*
  seed.ts               ← upserts SEED_EXERCISES
```

## The mannequin

Two body types (male / female) are generated parametrically from primitive
shapes (boxes, capsules, spheres) — see `src/components/workout/mannequin-geometry.ts`.
This was a deliberate trade-off:

- **Pro**: hit-detection for muscle groups is trivial. Each muscle group is
  one or more meshes inflated slightly above the body surface, so a raycast
  hits the muscle before the underlying body. No GLB submesh wrangling.
- **Pro**: tiny payload — no GLB to download.
- **Con**: it's anatomically simplified. For a real product you'd swap in a
  Mixamo X-Bot/Y-Bot rig, ReadyPlayer.me asset, or a custom skinned model
  in `/public/models/` and wire the muscle overlays as transparent decals.
  The interface in `mannequin-geometry.ts` is the swap point.

The 15 muscle groups (defined in `src/lib/muscles.ts`) are the primary key
joining the mannequin to the exercise database. Adding a new muscle means
appending to that list and adding an overlay in `mannequin-geometry.ts`.

## The research-score methodology

Every exercise is scored on four components, summed to a 0–10 scale:

| Component | Max | What it measures |
| --- | --- | --- |
| EMG / activation | 3 | Direct surface-EMG evidence of high target-muscle activation |
| Hypertrophy meta-analysis | 3 | Long-term growth outcomes from RCTs and meta-analyses |
| Replication / sample size | 2 | Number and quality of supporting studies |
| Practical efficacy | 2 | Real-world transfer in trained populations and at scale |

Computed in `src/lib/exercise-mapping.ts`. The breakdown is shown in the
score popover on every exercise card, alongside the citations that informed
each component.

**These are evidence-informed approximations, not absolute rankings.** See
`EVIDENCE.md` for the bibliography and limitations.

## AI-assisted meal logging

`/api/analyze-meal` accepts a Vercel Blob image URL and/or a text description,
plus the user's dietary context, and returns a strict JSON schema enforced by
Zod (`AnalysisResultSchema` in `src/lib/zod-schemas.ts`). The model is
instructed to return per-item gram estimates, macros, and per-item confidence
levels, plus caveats and clarifying questions. The UI always lets the user
edit values before they commit — nothing the AI returns is silently saved.

## Scripts

| Command | Effect |
| --- | --- |
| `npm run dev` | Next.js dev server on :3000 |
| `npm run build` | `prisma generate && next build` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:push` | Sync Prisma schema to the database |
| `npm run db:reset` | Drop and recreate; reseed |
| `npm run seed` | Re-run the exercise seed |

## What's not yet shipped

- Drag-to-reorder on the session dock is currently button-driven; native HTML5 DnD plumbing was descoped to keep mobile UX clean.
- Saved meal-plan management UI (list, regenerate-single, push-to-log) is partially wired: plans are persisted in the `MealPlan`/`MealPlanMeal` tables, but only the generator view ships in this iteration.
- The mannequin uses parametric meshes (see "The mannequin" above for the GLB swap path).

## License

See `LICENSE` (MIT).
