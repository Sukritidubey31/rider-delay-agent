import type { Delay } from "../api/client";

interface Props {
  delays: Delay[];
  onSelect: (id: string) => void;
}

const badge = (status: string) => {
  const styles: Record<string, string> = {
    pending  : "bg-amber-50 text-amber-700",
    escalated: "bg-red-50 text-red-700",
    resolved : "bg-green-50 text-green-700",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] ?? ""}`}>
      {status}
    </span>
  );
};

const ts = (val: string | null) =>
  val ? new Date(val).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

export default function DelayTable({ delays, onSelect }: Props) {
  if (delays.length === 0) return (
    <div className="text-center text-gray-400 py-16 text-sm">No delays found.</div>
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wide">
          <tr>
            {["Rider", "Store", "Type", "Cause", "Detected", "Status", ""].map(h => (
              <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {delays.map(d => (
            <tr key={d.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{d.order.rider.name}</td>
              <td className="px-4 py-3 text-gray-600">{d.order.store.name}</td>
              <td className="px-4 py-3 text-gray-500">
                {d.delay_type === "late_pickup" ? "Late pickup" : "Late delivery"}
              </td>
              <td className="px-4 py-3 text-gray-500">{d.cause ?? "—"}</td>
              <td className="px-4 py-3 text-gray-400">{ts(d.created_at)}</td>
              <td className="px-4 py-3">{badge(d.escalation_status)}</td>
              <td className="px-4 py-3 flex gap-3">
                <button
                  onClick={() => onSelect(d.id)}
                  className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                >
                  View
                </button>
                <a
                  href={`/order/${d.order.id}`}
                  target="_blank"
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Track
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}