import fs from "node:fs";

const rows = JSON.parse(fs.readFileSync("./.tmp/sg_rows_parsed.json", "utf8"));

console.log("=== collaboration rows ===");
rows
  .filter((r) => r.facet === "collaboration")
  .forEach((r) => console.log(r.level, r.variable, "|", r.cluster_name, "=", r.value));

console.log("\n=== onet_task rows (first 40) ===");
rows
  .filter((r) => r.facet === "onet_task")
  .slice(0, 40)
  .forEach((r) => console.log(r.level, r.variable, "|", r.cluster_name, "=", r.value));

console.log("\nTotal onet_task rows:", rows.filter((r) => r.facet === "onet_task").length);
console.log(
  "Distinct onet_task variables:",
  [...new Set(rows.filter((r) => r.facet === "onet_task").map((r) => r.variable))]
);
console.log(
  "Distinct onet_task levels:",
  [...new Set(rows.filter((r) => r.facet === "onet_task").map((r) => r.level))]
);
