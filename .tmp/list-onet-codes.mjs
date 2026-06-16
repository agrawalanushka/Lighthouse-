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

const rows = await parseTaskStatements("./.tmp/Task_Statements_onet29.txt");

const socMap = new Map();
for (const row of rows) {
  const code = row["O*NET-SOC Code"];
  const title = row["Title"];
  if (!socMap.has(code)) socMap.set(code, { title, count: 0 });
  socMap.get(code).count++;
}

const prefixes = ["15-1", "15-2", "17-2061", "13-1041", "13-1111", "27-1024", "11-3021"];
const matches = [...socMap.entries()]
  .filter(([code]) => prefixes.some((p) => code.startsWith(p)))
  .sort(([a], [b]) => a.localeCompare(b));

for (const [code, { title, count }] of matches) {
  console.log(`${code}\t${title}\t${count} tasks`);
}

fs.writeFileSync("./.tmp/onet_soc_map.json", JSON.stringify([...socMap.entries()], null, 2));
