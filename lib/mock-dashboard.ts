import type { PulseItem, RiskScore, SkillGap } from "@/lib/types";

// Temporary mock data — replace with real /api/pulse/highlight,
// /api/risk/[roleId], and /api/skill-gap calls once those routes exist.
// Shapes match lib/types.ts exactly so swapping later is a one-line change.

export const mockPulseItem: PulseItem = {
  id: "pulse-001",
  headline: "Shopee expands engineering hub in Singapore, hiring 200+ roles",
  summary:
    "Shopee announced a major expansion of its Singapore engineering team, with openings spanning backend, ML, and platform engineering — many open to fresh graduates.",
  relevance:
    "Matches your interest in backend engineering and your NUS Computing background.",
  url: "https://careers.shopee.sg",
  source: "TechInAsia",
  publishedAt: "2026-06-09T08:00:00Z",
};

export const mockRiskScore: RiskScore = {
  roleId: "frontend-engineer",
  roleName: "Frontend Engineer",
  score: 42,
  reasoning:
    "Frontend engineering retains strong demand due to the need for human judgment in UX and design systems, though AI coding assistants are automating routine component work.",
  sources: ["WEF Future of Jobs Report 2025", "LinkedIn Emerging Jobs SG"],
  industry: "Technology",
  seniority: "junior",
};

export const mockSkillGap: SkillGap = {
  userId: "mock-user",
  targetRole: "Frontend Engineer",
  currentSkills: ["JavaScript", "React", "HTML/CSS", "Git"],
  requiredSkills: [
    "JavaScript",
    "React",
    "TypeScript",
    "Next.js",
    "Tailwind CSS",
    "Testing (Jest)",
  ],
  missingSkills: ["TypeScript", "Next.js", "Tailwind CSS", "Testing (Jest)"],
  matchPercentage: 33,
};

export const mockWeeklyFocus =
  "This week, focus on TypeScript fundamentals — it's the top missing skill for your target Frontend Engineer role and appears in 80% of matched job listings.";
