import type { Stats } from "../api/client";

interface Props { stats: Stats | null; }

const statCard = (label: string, value: string | number, color: string) => (
  <div key={label} className="bg-white rounded-xl border border-gray-100 px-6 py-4 flex flex-col gap-1">
    <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
    <span className={`text-2xl font-semibold ${color}`}>{value}</span>
  </div>
);

export default function StatsBar({ stats }: Props) {
  if (!stats) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {statCard("Total delays",    stats.total,                              "text-gray-800")}
      {statCard("Pending",         stats.pending,                            "text-amber-500")}
      {statCard("Escalated",       stats.escalated,                          "text-red-500")}
      {statCard("Resolved",        stats.resolved,                           "text-green-500")}
      {statCard("Avg resolution",  stats.avg_resolution_minutes
        ? `${stats.avg_resolution_minutes} min`
        : "—",                                                               "text-blue-500")}
    </div>
  );
}