# Lighthouse 🔦

> AI Career Navigator for Singapore Students

Built for **SummerBuild 2026 Hackathon** — helping computing students navigate their career path with personalized AI-powered insights.

---

## What it does

Lighthouse is an authenticated dashboard that brings together three AI-powered insights in one place:

- **Pulse** — Weekly personalized digest of tech industry news relevant to your skills and target roles (e.g. hiring trends at Shopee, Grab, GovTech, Sea), with a guaranteed Singapore-specific story in every digest
- **AI Intervention Score** — A score for ~25 tech roles showing how much AI is reshaping each one, broken down into automation vs. augmentation, backed by cited evidence from the Anthropic Economic Index and O*NET task data
- **AI Chat** — A profile-aware career advisor that references your skills, target roles, intervention scores, and curated Singapore job listings to answer questions — sharing observations rather than direct instructions

---

## Tech stack

| Layer | Tool |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Data fetching | TanStack Query |
| Forms | React Hook Form + Zod |
| Database & Auth | Supabase (`@supabase/ssr`) |
| LLM | Anthropic Claude API |
| Embeddings | OpenAI text-embedding-3-small (with graceful fallback to Claude on quota errors) |
| Hosting | Vercel |
| Icons | lucide-react |
| Dates | date-fns |

---

## Getting started

### Prerequisites
- Node.js 20+
- npm
- A Supabase project
- Anthropic and OpenAI API keys

### Setup

```bash
# 1. Clone the repo
git clone git@github.com:agrawalanushka/Lighthouse-.git
cd Lighthouse-

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your API keys in .env.local (no spaces around the "=")

# 4. Run the development server
npm run dev
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
/app/chat               → Amudhan (AI career advisor)
/app/onboarding         → Min (signup flow)
/app/profile            → Min (user profile)
/app/risk               → Vidush (AI Intervention Score)
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
| Amudhan | AI Chat advisor |
| Min | Onboarding + User Profile + Auth |
| Vidush | AI Intervention Score |

---

*Deadline: 18 June 2026*
