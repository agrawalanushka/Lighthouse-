import type { NextRequest } from "next/server";
import rawRiskScores from "@/data/seed/risk-scores.json";
import type { RiskScoreDetail } from "@/lib/risk/compute";
import { ROLE_DEFINITIONS } from "@/lib/risk/constants";

// slug("AI Engineer") → "ai-engineer"
function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Maps every alias slug to its canonical roleId, e.g. "api-engineer" → "backend-engineer"
const ALIAS_TO_ROLE_ID = new Map<string, string>(
  ROLE_DEFINITIONS.flatMap((r) => r.aliases.map((a) => [slug(a), r.roleId]))
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { roleId } = await params;
  const { searchParams } = new URL(request.url);
  const seniorityParam = searchParams.get("seniority") ?? "mid";

  const canonicalId = ALIAS_TO_ROLE_ID.get(roleId) ?? roleId;

  const scores = rawRiskScores as RiskScoreDetail[];
  const detail = scores.find(
    (s) => s.roleId === canonicalId && s.seniority === seniorityParam
  );

  if (!detail) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(detail);
}
