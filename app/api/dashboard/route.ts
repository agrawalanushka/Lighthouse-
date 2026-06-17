import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { DashboardSnapshot, PulseItem, RiskScore } from "@/lib/types";
import type { NextRequest } from "next/server";
import riskScoresSeed from "@/data/seed/risk-scores.json";

// /api/dashboard is the only route allowed to consume other features' APIs
// (per CLAUDE.md cross-feature consumption rule).
//
// Dashboard shows 3 cards: Pulse, AI Intervention Score, Chat (static link).
// Jobs card removed from dashboard per product decision — Jobs feature itself
// (page, API, nav link, seed data) is untouched, just not surfaced here.
//
// Wired to real routes:
//   - pulseItem -> /api/pulse/highlight (Rishi)
//   - riskScore -> /api/risk/[roleId] (Vidush) — uses user's first targetRole
//                  from the "profiles" table (Min's schema), falls back to
//                  "backend-engineer" (a real seed roleId) if unset.
//                  profiles.targetRoles stores display labels (e.g.
//                  "Frontend Engineer", "API Engineer"), but /api/risk/[roleId]
//                  expects slugs (e.g. "frontend-engineer"). We build an
//                  alias map from Vidush's own seed data (roleId + aliases)
//                  so labels that are aliases of a real role (e.g. "API
//                  Engineer" -> backend-engineer) resolve correctly, not
//                  just labels that happen to match their own slug.
// Still placeholder:
//   - weeklyFocus -> short heuristic for now; swap for LLM-generated +
//     24h cache once that's built.

const FALLBACK_ROLE_ID = "backend-engineer";

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Built once at module load from Vidush's seed data: maps both each role's
// own slug and every alias's slug to the canonical roleId.
const aliasToRoleId = new Map<string, string>();
for (const entry of riskScoresSeed as { roleId: string; aliases?: string[] }[]) {
  aliasToRoleId.set(entry.roleId, entry.roleId);
  for (const alias of entry.aliases ?? []) {
    aliasToRoleId.set(slugify(alias), entry.roleId);
  }
}

function resolveRoleId(label: string): string {
  const slug = slugify(label);
  return aliasToRoleId.get(slug) ?? slug;
}

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const origin = request.nextUrl.origin;

  // --- Pulse (real) ---
  let pulseItem: PulseItem | null = null;
  try {
    const res = await fetch(`${origin}/api/pulse/highlight`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (res.ok) pulseItem = await res.json();
  } catch {
    pulseItem = null;
  }

  // --- AI Intervention Score (real) ---
  let riskScore: RiskScore | null = null;
  try {
    let roleId = FALLBACK_ROLE_ID;
    const { data: profile } = await supabase
      .from("profiles")
      .select("targetRoles")
      .eq("id", user.id)
      .single();

    if (profile?.targetRoles?.[0]) {
      roleId = resolveRoleId(profile.targetRoles[0]);
    }

    const riskRes = await fetch(`${origin}/api/risk/${roleId}`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (riskRes.ok) {
      const detail = await riskRes.json();
      riskScore = {
        roleId: detail.roleId,
        roleName: detail.roleName,
        score: detail.score,
        reasoning: detail.reasoning,
        sources: detail.sources,
        industry: detail.industry,
        seniority: detail.seniority,
      };
    }
  } catch {
    riskScore = null;
  }

  // --- Weekly focus (placeholder heuristic, not yet LLM-generated) ---
  const weeklyFocus = pulseItem
    ? `This week, keep an eye on: ${pulseItem.headline}`
    : "Complete your profile to get a personalised weekly focus.";

  const snapshot: Partial<DashboardSnapshot> & { userId: string } = {
    userId: user.id,
    pulseItem: pulseItem ?? undefined,
    riskScore: riskScore ?? undefined,
    weeklyFocus,
    generatedAt: new Date().toISOString(),
  };

  return Response.json(snapshot);
}
