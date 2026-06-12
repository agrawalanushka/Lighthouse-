# Project context for Claude

You are assisting a 5-person team building an AI career navigator for Singapore CS students, for the SummerBuild 2026 hackathon. Deadline: **18 June 2026**.

This file is read by every team member's Claude session (Claude Code, Claude in Cursor, Claude in VS Code). Follow it strictly. When in doubt, ask in the chat before generating large chunks of code.

---

## Stack (locked — do not suggest alternatives)

- **Framework:** Next.js 14, App Router
- **Language:** TypeScript (strict mode). Never use `any` except as last resort with a `// FIXME` comment.
- **Styling:** Tailwind CSS only. No `.css` files except `globals.css`.
- **Components:** shadcn/ui from `/components/ui`. Never raw `<button>`, `<input>`, `<select>`, `<dialog>`, etc.
- **Data fetching:** TanStack Query. Never raw `fetch()` in components.
- **Mutations:** Next.js server actions preferred; API routes when consumed across features.
- **Forms:** React Hook Form + Zod for validation.
- **Database & auth:** Supabase. Client lives in `/lib/supabase.ts`. Never instantiate elsewhere.
- **LLM:** Anthropic Claude API. All calls go through `/lib/ai/`. Never call the Anthropic SDK directly in routes or components.
- **Embeddings:** OpenAI `text-embedding-3-small`, also wrapped in `/lib/ai/`.
- **Dates:** date-fns. Never `Date.toLocaleString()` directly in UI.
- **Icons:** lucide-react.
- **State:** React state and TanStack Query cache only. No Redux, no Zustand.

---

## File ownership

Respect folder boundaries. **Do not edit** files outside the owner's domain without explicit team approval:

| Folder | Owner |
|---|---|
| `/app/onboarding`, `/app/profile`, `/app/api/profile` | Min |
| `/app/pulse`, `/app/api/pulse`, `/lib/ai` | Rishi |
| `/app/jobs`, `/app/api/jobs` | Amudhan |
| `/app/risk`, `/app/skill-gap`, `/app/api/risk` | Vidush |
| `/app/dashboard`, `/app/api/dashboard`, `/components/dashboard` | Anushka |
| `/components/ui`, `/components/shared`, `/app/layout.tsx`, `/app/page.tsx` | Anushka |
| `/lib/types.ts` | Team-edited; changes must be announced in `#decisions` |
| `/data/seed/*.json` | Each owner of the corresponding feature |

If the user asks you to edit a file outside their assigned folder, **flag it and ask for confirmation** before proceeding.

---

## Type system

All shared types live in `/lib/types.ts`. Import from there. **Never redefine these types locally.** The canonical types are:

`UserProfile`, `Skill`, `Job`, `NewsItem`, `PulseDigest`, `PulseItem`, `RiskScore`, `SkillGap`, `DashboardSnapshot`.

`DashboardSnapshot` is the aggregated view consumed by `/app/dashboard`. It composes one `PulseItem`, three top-matched `Job`s with match percentages, one `RiskScore`, one `SkillGap`, plus a weekly-focus string.

If a feature needs a new field, **do not add it silently**. Surface the need to the user so they can post in `#decisions` and get team approval.

---

## API conventions

| Route | Owner | Purpose |
|---|---|---|
| `GET /api/profile` | Min | Fetch current user |
| `POST /api/profile` | Min | Create/update profile |
| `GET /api/jobs` | Amudhan | List jobs (query: `skills`, `role`) |
| `GET /api/jobs/[id]` | Amudhan | Job detail |
| `GET /api/jobs/top-matches` | Amudhan | Top 3 matches for current user (dashboard) |
| `GET /api/pulse` | Rishi | Fetch latest digest |
| `GET /api/pulse/highlight` | Rishi | Single top pulse item for dashboard |
| `POST /api/pulse/generate` | Rishi | Force regenerate (demo) |
| `GET /api/risk` | Vidush | List all risk scores |
| `GET /api/risk/[roleId]` | Vidush | One role's detail |
| `POST /api/skill-gap` | Vidush | Compute gap |
| `GET /api/dashboard` | Anushka | Aggregated `DashboardSnapshot` for current user |

**Cross-feature consumption rule:** `/api/dashboard` is the only route allowed to consume other features' APIs. Every other feature reads only its own routes. This isolation keeps merge surface small.

---

## Code style

- Match patterns already in the codebase. If a similar component exists, mirror its structure.
- Prefer composition over configuration. Many small components > one giant configurable one.
- Every async UI element needs:
  - A loading state (use shadcn `Skeleton`).
  - An error state (use shadcn `Alert` with variant `destructive`).
  - An empty state (a plain centered text block with an icon is fine).
- Server components by default. Add `"use client"` only when needed (interactivity, hooks).
- Co-locate components used only in one route under that route's folder. Promote to `/components/shared` only when used by 2+ features. Dashboard-specific cards live in `/components/dashboard`.
- Filenames: `kebab-case.tsx` for files, `PascalCase` for component exports.
- No comments that just restate the code. Comments explain *why*, not *what*.

---

## LLM usage rules

- All Claude/OpenAI calls go through `/lib/ai/`. Never import `@anthropic-ai/sdk` outside that folder.
- Prompt templates live in `/lib/ai/prompts/` as named exports. Don't inline long prompts in route handlers.
- Always set `max_tokens` explicitly. Default to 1024 unless the use case justifies more.
- Cache personalization results in Supabase by `(userId, weekOf)` — never regenerate on every page load.
- The dashboard's "weekly focus" string is also LLM-generated; cache it per-user with a 24-hour TTL.
- For demo safety, the Pulse generation route has a "cached mode" that returns pre-generated digests if the API key is missing or rate-limited.

---

## What you (Claude) should do

- Read this file fully before generating code in a new session.
- When asked to "build X," check the spec implied by this file and the feature owner's docs. Don't invent requirements.
- Read at least one existing component before writing a new one in the same area — match its style.
- When the user pastes a diff or asks for a review, point out: type safety issues, missing loading/error states, violations of file ownership, and missing tests for tricky logic.
- Prefer small, reviewable changes. If a request is large, suggest splitting it into commits.
- If the user asks for something contradicting this file (e.g., "let's use Redux"), push back politely and explain why — but defer if they confirm.

## What you (Claude) should NOT do

- Don't invent new shared types, routes, or env vars without flagging.
- Don't suggest alternative libraries from the locked stack.
- Don't write `.css` files.
- Don't use raw HTML form elements where a shadcn equivalent exists.
- Don't add packages without checking with the user.
- Don't force-push, rebase `main`, or rewrite Git history. If you suggest these, the user will refuse.
- Don't generate placeholder/lorem-ipsum content for the demo. Use realistic Singapore-specific examples (NTU, NUS, Shopee, Grab, Sea, GovTech, etc.).
- Don't let any feature except the dashboard call other features' APIs.

---

## Demo-driven priorities

We're optimizing for a 90-second live demo on June 18. The demo flow is:

1. User logs in → **Dashboard** loads showing aggregated insights
2. From dashboard → drill into **Pulse** for the weekly personalized digest
3. From dashboard → drill into **Jobs** for top matches
4. From dashboard → drill into **Risk + Skill Gap** for the target role

The dashboard is the opening shot. It needs to look complete and feel personalized. Code paths in this flow are P0. Everything else is P1+. When trading off, ask: "does this affect the 90-second demo?"

---

## Environment

- Node 20+, pnpm preferred (npm fine)
- Env vars in `.env.local`. Required: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Deploy: Vercel, `main` branch auto-deploys.

---

*Maintained by Anushka. Version v2 (dashboard ownership added). Last updated 6 June 2026. Any change to this file ships in the same commit as the change it documents.*
