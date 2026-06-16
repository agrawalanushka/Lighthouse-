import fs from "node:fs";
import readline from "node:readline";

async function parseTaskStatements(path) {
  const rl = readline.createInterface({
    input: fs.createReadStream(path, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });
  let header = null;
  const rows = [];
  for await (const line of rl) {
    if (!line) continue;
    const fields = line.split("\t");
    if (!header) {
      header = fields;
      continue;
    }
    if (fields.length !== header.length) continue;
    const row = {};
    header.forEach((h, idx) => (row[h] = fields[idx]));
    rows.push(row);
  }
  return rows;
}

const taskRows = await parseTaskStatements("./.tmp/Task_Statements_onet29.txt");
const socTasks = new Map();
for (const row of taskRows) {
  const code = row["O*NET-SOC Code"];
  const task = (row["Task"] || "").trim().toLowerCase();
  if (!code || !task) continue;
  if (!socTasks.has(code)) socTasks.set(code, new Set());
  socTasks.get(code).add(task);
}

const sgRows = JSON.parse(fs.readFileSync("./.tmp/sg_rows_parsed.json", "utf8"));
const sgTaskPct = new Map();
for (const r of sgRows) {
  if (r.facet === "onet_task" && r.variable === "onet_task_pct") {
    sgTaskPct.set(r.cluster_name.trim().toLowerCase(), parseFloat(r.value));
  }
}

const TARGET_CODES = [
  "13-1041.00", "13-1111.00", "15-1212.00", "15-1221.00", "15-1241.00",
  "15-1242.00", "15-1243.00", "15-1243.01", "15-1244.00", "15-1252.00",
  "15-1254.00", "15-1255.00", "15-1299.04", "15-1299.05", "15-1299.06",
  "15-1299.08", "15-2031.00", "15-2051.00", "15-2051.01", "17-2061.00",
];

for (const code of TARGET_CODES) {
  const tasks = socTasks.get(code) ?? new Set();
  const matches = [...tasks]
    .filter((t) => sgTaskPct.has(t))
    .map((t) => [t, sgTaskPct.get(t)])
    .sort((a, b) => b[1] - a[1]);
  console.log(`${code} (${tasks.size} tasks): ${matches.length} SG matches`);
  matches.forEach(([t, p]) => console.log(`   [${p.toFixed(2)}%] ${t}`));
}
