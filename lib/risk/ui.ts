export const SENIORITIES = [
  { label: "Junior", value: "junior" },
  { label: "Mid", value: "mid" },
  { label: "Senior", value: "senior" },
];

export function riskColor(score: number) {
  if (score < 33) return "text-green-600";
  if (score < 66) return "text-amber-600";
  return "text-red-600";
}

export function riskBand(score: number) {
  if (score < 33) return "Low";
  if (score < 66) return "Moderate";
  return "High";
}
