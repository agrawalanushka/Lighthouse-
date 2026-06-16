import { promises as fs } from "node:fs";
import path from "node:path";
import { GLOBAL_EXPOSURE_BY_SOC, JOB_EXPOSURE_CSV_URL } from "@/lib/risk/constants";
import { computeRiskScores } from "@/lib/risk/compute";

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      fields.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  fields.push(cur);
  return fields;
}

// labor_market_impacts/job_exposure.csv is ~37KB — small enough to fetch live.
// The Singapore collaboration-mix data it's paired with comes from a 103MB raw
// export that isn't practical to fetch in a request; that half stays as the
// committed SG_AUTO_SHARE/SG_AUG_SHARE constants (lib/risk/constants.ts),
// refreshed via the offline extraction script when AEI publishes a new release.
async function fetchGlobalExposure(): Promise<{
  data: Record<string, number>;
  source: "live" | "fallback";
}> {
  try {
    const res = await fetch(JOB_EXPOSURE_CSV_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const lines = text.split("\n").filter(Boolean);
    const exposure: Record<string, number> = {};
    for (const line of lines.slice(1)) {
      const [occCode, , observedExposure] = parseCsvLine(line);
      if (occCode && observedExposure) {
        exposure[occCode] = parseFloat(observedExposure);
      }
    }
    if (Object.keys(exposure).length === 0) throw new Error("Empty parse result");
    return { data: exposure, source: "live" };
  } catch {
    return { data: GLOBAL_EXPOSURE_BY_SOC, source: "fallback" };
  }
}

export async function POST() {
  const { data: exposureBySoc, source } = await fetchGlobalExposure();

  const now = new Date();
  const weekOf = now.toISOString().slice(0, 10);
  const generatedAt = now.toISOString();

  const scores = computeRiskScores(exposureBySoc, weekOf, generatedAt);

  // Best-effort persist to the committed seed file. Works in local dev;
  // no-ops on read-only serverless filesystems (e.g. Vercel production).
  let persisted = false;
  try {
    const seedPath = path.join(process.cwd(), "data", "seed", "risk-scores.json");
    await fs.writeFile(seedPath, JSON.stringify(scores, null, 2));
    persisted = true;
  } catch {
    persisted = false;
  }

  return Response.json({
    scores,
    meta: { exposureSource: source, persisted, generatedAt },
  });
}
