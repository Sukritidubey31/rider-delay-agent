import { useEffect, useState } from "react";
import {
  getRiders, getCustomers, getStores, createOrder,
  type RiderBasic, type CustomerBasic, type StoreBasic
} from "../api/client";

interface Props {
  onClose   : () => void;
  onCreated : () => void;
}

export default function CreateOrderModal({ onClose, onCreated }: Props) {
  const [riders,    setRiders]    = useState<RiderBasic[]>([]);
  const [customers, setCustomers] = useState<CustomerBasic[]>([]);
  const [stores,    setStores]    = useState<StoreBasic[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);

  const [riderId,     setRiderId]     = useState("");
  const [customerId,  setCustomerId]  = useState("");
  const [storeId,     setStoreId]     = useState("");
  const [alreadyLate, setAlreadyLate] = useState(true);

  useEffect(() => {
    Promise.all([getRiders(), getCustomers(), getStores()]).then(([r, c, s]) => {
      setRiders(r);    setRiderId(r[0]?.id ?? "");
      setCustomers(c); setCustomerId(c[0]?.id ?? "");
      setStores(s);    setStoreId(s[0]?.id ?? "");
    });
  }, []);

  const handleSubmit = async () => {
    if (!riderId || !customerId || !storeId) return;
    setLoading(true);
    try {
      const now = new Date();
      const expected_pickup_at   = new Date(
        alreadyLate
          ? now.getTime() - 15 * 60 * 1000   // 15 min ago → already delayed
          : now.getTime() + 10 * 60 * 1000   // 10 min from now → not yet delayed
      ).toISOString();
      const expected_delivery_at = new Date(
        now.getTime() + 40 * 60 * 1000
      ).toISOString();

      await createOrder({ rider_id: riderId, customer_id: customerId, store_id: storeId, expected_pickup_at, expected_delivery_at });
      setSuccess(true);
      setTimeout(() => { onCreated(); onClose(); }, 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectClass = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-300";

  return (
    <div
      style={{ minHeight: 400, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl border border-gray-100 p-6 w-full max-w-sm space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div>
          <h2 className="text-base font-semibold text-gray-900">Create test order</h2>
          <p className="text-xs text-gray-400 mt-0.5">Triggers the full agent flow within 30 seconds</p>
        </div>

        {success ? (
          <div className="text-center py-6">
            <p className="text-green-600 font-medium text-sm">Order created!</p>
            <p className="text-xs text-gray-400 mt-1">Agent will fire within 2 minutes</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Rider</label>
                <select className={selectClass} value={riderId} onChange={e => setRiderId(e.target.value)}>
                  {riders.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Customer</label>
                <select className={selectClass} value={customerId} onChange={e => setCustomerId(e.target.value)}>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Store</label>
                <select className={selectClass} value={storeId} onChange={e => setStoreId(e.target.value)}>
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="already-late"
                  checked={alreadyLate}
                  onChange={e => setAlreadyLate(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="already-late" className="text-xs text-gray-600 cursor-pointer">
                  Already delayed (pickup was 15 min ago)
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 text-xs border border-gray-200 rounded-lg py-2 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 transition-colors disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create order"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}