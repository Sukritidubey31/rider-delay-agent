import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type Delay, type Stats, getActiveDelays, getAllDelays, getStats } from "../api/client";
import StatsBar from "../components/StatsBar";
import DelayTable from "../components/DelayTable";
import DelayCard from "../components/DelayCard";
import CreateOrderModal from "../components/CreateOrderModal";

export default function Dashboard() {
  const [stats,      setStats]      = useState<Stats | null>(null);
  const [delays,     setDelays]     = useState<Delay[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAll,    setShowAll]    = useState(false);
  const [loading,    setLoading]    = useState(true);
  const navigate                    = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const selected = delays.find(d => d.id === selectedId) ?? null;

  const load = async () => {
    const [s, d] = await Promise.all([
      getStats(),
      showAll ? getAllDelays() : getActiveDelays(),
    ]);
    setStats(s);
    setDelays(d);
    setLoading(false);
  };

  useEffect(() => { load(); }, [showAll]);

  useEffect(() => {
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [showAll]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navbar */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Rider Delay Agent</h1>
            <p className="text-base text-gray-500 mt-1">Live operations dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/order")}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl px-5 py-2.5 bg-white hover:bg-gray-50 transition-all shadow-sm"
            >
              Customer view
            </button>
            <button
              onClick={load}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl px-5 py-2.5 bg-white hover:bg-gray-50 transition-all shadow-sm"
            >
              Refresh
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 transition-all shadow-sm hover:shadow-md"
            >
              + New test order
            </button>
            {showModal && (
              <div className="fixed inset-0 z-50">
                <CreateOrderModal
                  onClose={() => setShowModal(false)}
                  onCreated={() => { setShowModal(false); load(); }}
                />
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">

        {/* Stats */}
        <StatsBar stats={stats} />

        {/* Main content */}
        <div className={`grid gap-6 ${selected ? "grid-cols-3" : "grid-cols-1"}`}>

          {/* Table */}
          <div className={`${selected ? "col-span-2" : "col-span-1"} space-y-3`}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-700">
                {showAll ? "All delays" : "Active delays"}
              </h2>
              <button
                onClick={() => { setShowAll(v => !v); setSelectedId(null); }}
                className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
              >
                {showAll ? "Show active only" : "Show all"}
              </button>
            </div>
            {loading
              ? <div className="text-center text-gray-400 py-16 text-sm">Loading...</div>
              : <DelayTable delays={delays} onSelect={setSelectedId} />
            }
          </div>

          {/* Detail card */}
          {selected && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-700">Detail</h2>
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
              <DelayCard
                delay={selected}
                onResolved={() => { setSelectedId(null); load(); }}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
