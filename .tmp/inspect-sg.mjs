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
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        fields.push(cur);
        cur = "";
      } else {
        cur += c;
      }
    }
  }
  fields.push(cur);
  return fields;
}

const filePath = "./.tmp/aei_raw_claude_ai.csv";
const rl = readline.createInterface({
  input: fs.createReadStream(filePath, { encoding: "utf8" }),
  crlfDelay: Infinity,
});

let header = null;
const sgRows = [];
let lineNo = 0;

for await (const line of rl) {
  lineNo++;
  if (lineNo === 1) {
    header = parseCsvLine(line);
    continue;
  }
  if (line.startsWith("SG,")) {
    const fields = parseCsvLine(line);
    const row = {};
    header.forEach((h, idx) => (row[h] = fields[idx]));
    sgRows.push(row);
  }
}

console.log("Header:", header);
console.log("Total SG rows:", sgRows.length);

const distinct = (key) => [...new Set(sgRows.map((r) => r[key]))];

console.log("Distinct facets:", distinct("facet"));
console.log("Distinct geography:", distinct("geography"));
console.log("Distinct platform_and_product:", distinct("platform_and_product"));
console.log("Distinct level:", distinct("level"));
console.log("Distinct variable (first 30):", distinct("variable").slice(0, 30));

fs.writeFileSync("./.tmp/sg_rows_parsed.json", JSON.stringify(sgRows, null, 2));
console.log("Wrote ./.tmp/sg_rows_parsed.json");
