import fs from "node:fs";
import readline from "node:readline";

function parseCsvLine(line) {
  const fields = [];
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

async function extractCollabMix(csvPath) {
  const rl = readline.createInterface({
    input: fs.createReadStream(csvPath, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  let header = null;
  let geoIdx, facetIdx, levelIdx, variableIdx, clusterIdx, valueIdx;
  const pct = {};

  for await (const line of rl) {
    if (!line) continue;
    if (!header) {
      header = parseCsvLine(line);
      geoIdx = header.indexOf("geo_id");
      facetIdx = header.indexOf("facet");
      levelIdx = header.indexOf("level");
      variableIdx = header.indexOf("variable");
      clusterIdx = header.indexOf("cluster_name");
      valueIdx = header.indexOf("value");
      continue;
    }
    if (!line.startsWith("SG,")) continue;
    const fields = parseCsvLine(line);
    if (
      fields[facetIdx] === "collaboration" &&
      fields[levelIdx] === "0" &&
      fields[variableIdx] === "collaboration_pct"
    ) {
      pct[fields[clusterIdx]] = parseFloat(fields[valueIdx]);
    }
  }

  return pct;
}

const targets = [
  { label: "2025-08", path: "./.tmp/aei_raw_2025-08.csv", periodStart: "2025-08-04", periodEnd: "2025-08-11" },
  { label: "2025-11", path: "./.tmp/aei_raw_2025-11.csv", periodStart: "2025-11-13", periodEnd: "2025-11-20" },
  { label: "2026-02", path: "./.tmp/aei_raw_claude_ai.csv", periodStart: "2026-02-05", periodEnd: "2026-02-12" },
];

const results = [];
for (const t of targets) {
  const pct = await extractCollabMix(t.path);
  const none = pct["none"] ?? 0;
  const directive = pct["directive"] ?? 0;
  const denom = 100 - none;
  const autoShare = Math.round((directive / denom) * 10000) / 10000;
  const augShare = Math.round((1 - autoShare) * 10000) / 10000;
  console.log(t.label, pct, "-> autoShare=", autoShare, "augShare=", augShare);
  results.push({ periodStart: t.periodStart, periodEnd: t.periodEnd, raw: pct, autoShare, augShare });
}

fs.writeFileSync("./.tmp/collab-mix-history.json", JSON.stringify(results, null, 2));
console.log("\nWrote ./.tmp/collab-mix-history.json");
