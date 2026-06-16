import {
  AEI_SOURCES,
  AUGMENTATION_WEIGHT,
  AUTOMATION_WEIGHT,
  GLOBAL_COLLAB_MIX_HISTORY,
  GLOBAL_EXPOSURE_BY_SOC,
  ROLE_DEFINITIONS,
  SENIORITY_SHIFT,
  SG_AUTO_SHARE,
  SG_COLLAB_MIX_HISTORY,
  SG_TASK_EVIDENCE,
} from "@/lib/risk/constants";

export type Seniority = "junior" | "mid" | "senior";

export type RiskScoreHistoryPoint = {
  periodStart: string;
  periodEnd: string;
  releaseLabel: string;
  score: number;
  autoShare: number;
  augShare: number;
  // "global" points (the 2 earliest AEI releases) predate Singapore-specific
  // reporting and use worldwide Claude.ai usage data, not Singapore's —
  // kept distinct so the UI never blends them into the Singapore trend line.
  source: "global" | "singapore";
};

export type RiskScoreHistory = {
  roleId: string;
  seniority: Seniority;
  points: RiskScoreHistoryPoint[];
};

export type RiskScoreDetail = {
  roleId: string;
  roleName: string;
  aliases: string[];
  score: number;
  reasoning: string;
  sources: string[];
  industry: string;
  seniority: Seniority;
  interventionBreadth: number;
  augShare: number;
  autoShare: number;
  onetCode: string;
  onetTaskCount: number;
  aiTouchedTasksSG: number;
  weekOf: string;
  generatedAt: string;
};

const SENIORITIES: Seniority[] = ["junior", "mid", "senior"];

// AEI's published exposure data only resolves to the 6-digit SOC family, not
// the O*NET detail occupation — so clusters that share a family but have a
// different onetCode (different real task list) still land on the same
// coverage number, and therefore the same score. That's a data-resolution
// limit, not a claim that they're the same job, so it's surfaced explicitly
// per affected role rather than left as an unexplained coincidence.
const FAMILY_SIBLINGS = new Map<string, string[]>();
for (const role of ROLE_DEFINITIONS) {
  for (const other of ROLE_DEFINITIONS) {
    if (other.soc === role.soc && other.onetCode !== role.onetCode) {
      const list = FAMILY_SIBLINGS.get(role.roleId) ?? [];
      list.push(other.roleName);
      FAMILY_SIBLINGS.set(role.roleId, list);
    }
  }
}

function round(n: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
}

function toHistoryPoint(
  period: { periodStart: string; periodEnd: string; releaseLabel: string; autoShare: number; augShare: number },
  source: "global" | "singapore",
  coverage: number,
  seniorityShift: number
): RiskScoreHistoryPoint {
  const autoShare = Math.min(1, Math.max(0, period.autoShare + seniorityShift));
  const augShare = 1 - autoShare;
  const score = round(100 * coverage * (AUGMENTATION_WEIGHT * augShare + AUTOMATION_WEIGHT * autoShare), 1);
  return {
    periodStart: period.periodStart,
    periodEnd: period.periodEnd,
    releaseLabel: period.releaseLabel,
    score,
    autoShare: round(autoShare, 3),
    augShare: round(augShare, 3),
    source,
  };
}

export function computeRiskScores(
  exposureBySoc: Record<string, number>,
  weekOf: string,
  generatedAt: string
): RiskScoreDetail[] {
  const results: RiskScoreDetail[] = [];

  for (const role of ROLE_DEFINITIONS) {
    const coverage = exposureBySoc[role.soc];
    if (coverage === undefined) continue;

    const evidence = SG_TASK_EVIDENCE[role.roleId] ?? [];
    const sgNote =
      evidence.length > 0
        ? `Singapore-specific evidence: ${evidence.length} of this role's O*NET tasks appear directly in Singapore Claude.ai usage data (top match: "${evidence[0].task}" at ${evidence[0].pct}% of all SG conversations).`
        : `No Singapore-specific O*NET task for this role cleared the reporting threshold in the raw SG export (top ~63 tasks economy-wide) — used global AEI occupational exposure as instructed.`;
    const aliasNote =
      role.aliases.length > 0
        ? ` This O*NET classification (and therefore this score) also covers: ${role.aliases.join(", ")}.`
        : "";
    const siblings = FAMILY_SIBLINGS.get(role.roleId) ?? [];
    const familyNote =
      siblings.length > 0
        ? ` Anthropic's published exposure data resolves only to the parent occupation family (SOC ${role.soc}), not this specific O*NET detail occupation, so this score currently coincides with ${siblings.join(", ")} even though their O*NET tasks differ.`
        : "";

    for (const seniority of SENIORITIES) {
      const shift = SENIORITY_SHIFT[seniority];
      const autoShare = Math.min(1, Math.max(0, SG_AUTO_SHARE + shift));
      const augShare = 1 - autoShare;
      const score = round(100 * coverage * (AUGMENTATION_WEIGHT * augShare + AUTOMATION_WEIGHT * autoShare), 1);

      results.push({
        roleId: role.roleId,
        roleName: role.roleName,
        aliases: role.aliases,
        score,
        reasoning: `Coverage (Intervention Breadth) = ${(coverage * 100).toFixed(1)}% of this occupation's O*NET tasks show meaningful Claude usage, from Anthropic Economic Index global occupational exposure data (SOC ${role.soc}). Intervention Mode = ${(autoShare * 100).toFixed(1)}% automation / ${(augShare * 100).toFixed(1)}% augmentation, derived from Singapore-specific Claude.ai collaboration-pattern data (directive vs. feedback-loop/iteration/learning/validation), with a ${seniority} seniority adjustment applied to the mix. ${sgNote}${aliasNote}${familyNote}`,
        sources: AEI_SOURCES,
        industry: role.industry,
        seniority,
        interventionBreadth: round(coverage, 3),
        augShare: round(augShare, 3),
        autoShare: round(autoShare, 3),
        onetCode: role.onetCode,
        onetTaskCount: role.onetTaskCount,
        aiTouchedTasksSG: evidence.length,
        weekOf,
        generatedAt,
      });
    }
  }

  return results;
}

export function computeRiskScoreHistory(): RiskScoreHistory[] {
  const results: RiskScoreHistory[] = [];

  for (const role of ROLE_DEFINITIONS) {
    const coverage = GLOBAL_EXPOSURE_BY_SOC[role.soc];
    if (coverage === undefined) continue;

    for (const seniority of SENIORITIES) {
      const shift = SENIORITY_SHIFT[seniority];
      const points = [
        ...GLOBAL_COLLAB_MIX_HISTORY.map((period) => toHistoryPoint(period, "global", coverage, shift)),
        ...SG_COLLAB_MIX_HISTORY.map((period) => toHistoryPoint(period, "singapore", coverage, shift)),
      ].sort((a, b) => a.periodStart.localeCompare(b.periodStart));

      results.push({ roleId: role.roleId, seniority, points });
    }
  }

  return results;
}
