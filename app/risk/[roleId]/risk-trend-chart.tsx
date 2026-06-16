"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RiskScoreHistoryPoint } from "@/lib/risk/compute";

type ChartRow = RiskScoreHistoryPoint & {
  scoreGlobal?: number;
  scoreSingapore?: number;
};

function TrendTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: readonly { payload?: ChartRow }[];
}) {
  if (!active || !payload?.length || !payload[0].payload) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-md border bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-gray-900">{point.releaseLabel}</p>
      <p className="text-gray-500">Score: {point.score} / 100</p>
      <p className="text-gray-500">
        {Math.round(point.autoShare * 100)}% automation / {Math.round(point.augShare * 100)}% augmentation
      </p>
      <p className="text-gray-400 mt-1">
        {point.source === "global" ? "Global (pre-Singapore reporting)" : "Singapore-specific"}
      </p>
    </div>
  );
}

// Zooms the Y-axis to the spread of the visible points instead of a fixed
// 0-100 scale, so small period-to-period moves are still readable instead of
// flattening into a near-straight line.
function computeDomain(points: RiskScoreHistoryPoint[]): [number, number] {
  if (points.length === 0) return [0, 100];
  const scores = points.map((p) => p.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const padding = Math.max((max - min) * 0.25, 3);
  return [Math.max(0, Math.floor(min - padding)), Math.min(100, Math.ceil(max + padding))];
}

export function RiskTrendChart({ points }: { points: RiskScoreHistoryPoint[] }) {
  const data: ChartRow[] = points.map((p) => ({
    ...p,
    scoreGlobal: p.source === "global" ? p.score : undefined,
    scoreSingapore: p.source === "singapore" ? p.score : undefined,
  }));
  const domain = computeDomain(points);
  const hasGlobal = points.some((p) => p.source === "global");
  const hasSingapore = points.some((p) => p.source === "singapore");

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="releaseLabel"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
          />
          <YAxis
            domain={domain}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip content={(props) => <TrendTooltip {...props} />} />
          {hasGlobal && hasSingapore && <Legend wrapperStyle={{ fontSize: 11 }} />}
          {hasGlobal && (
            <Line
              type="monotone"
              dataKey="scoreGlobal"
              name="Global"
              stroke="#9ca3af"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 4, fill: "#9ca3af" }}
            />
          )}
          {hasSingapore && (
            <Line
              type="monotone"
              dataKey="scoreSingapore"
              name="Singapore"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 4, fill: "#2563eb" }}
              activeDot={{ r: 6 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
