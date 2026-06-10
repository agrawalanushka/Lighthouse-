# Lighthouse 🔦

> AI Career Navigator for Singapore CS Students

Built for **SummerBuild 2026 Hackathon** — helping CS students at NTU, NUS, SMU, and SIT navigate their career path with personalized AI-powered insights.

---

## What it does

Lighthouse is an authenticated dashboard that aggregates four AI-powered insights in one place:

- **Pulse** — Weekly personalized digest of tech industry news relevant to your skills and target roles (e.g. hiring trends at Shopee, Grab, GovTech, Sea)
- **Job Matches** — Top job matches from MyCareersFuture, scored against your skill profile using AI embeddings
- **Risk Scores** — AI automation risk scores for ~25 tech roles, so you can make informed decisions about your career direction
- **Skill Gap** — Side-by-side comparison of your current skills vs. what your target role requires

---

## Tech stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Data fetching | TanStack Query |
| Forms | React Hook Form + Zod |
| Database & Auth | Supabase |
| LLM | Anthropic Claude API |
| Embeddings | OpenAI text-embedding-3-small |
| Hosting | Vercel |
| Icons | lucide-react |
| Dates | date-fns |

---

## Getting started

### Prerequisites
- Node.js 20+
- pnpm (or npm)
- A Supabase project
- Anthropic and OpenAI API keys

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_ORG/lighthouse.git
cd lighthouse

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your API keys in .env.local

# 4. Run the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Required environment variables

```
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Folder structure & ownership

```
/app/dashboard          → Anushka (aggregated insights hub)
/app/pulse              → Rishi (news digest)
/app/jobs               → Amudhan (job board)
/app/onboarding         → Min (signup flow)
/app/profile            → Min (user profile)
/app/risk               → Vidush (risk scores)
/app/skill-gap          → Vidush (skill gap analysis)
/components/ui          → Anushka (shadcn components)
/components/shared      → Anushka (Header, Nav, shell)
/components/dashboard   → Anushka (insight cards)
/lib/ai                 → Rishi (Claude + OpenAI calls)
/lib/types.ts           → Team (changes announced in #decisions)
```

> Golden rule: if a file isn't in your folder, don't edit it without announcing in Discord first.

---

## Deployment

Deployed on **Vercel**. The `main` branch auto-deploys on every push.

---

## Team

| Name | Role |
|---|---|
| Anushka | Team Lead + Dashboard & Insights Hub |
| Rishi | Pulse (News + Personalization) + LLM infrastructure |
| Amudhan | Job Board + MyCareersFuture integration |
| Min | Onboarding + User Profile + Auth |
| Vidush | Risk Scores + Skill Gap analysis |

---

*Deadline: 18 June 2026*
