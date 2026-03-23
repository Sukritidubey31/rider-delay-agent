import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type Order, getAllOrders } from "../api/client";

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllOrders().then(setOrders);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-4">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Order tracking</h1>
            <p className="text-sm text-gray-400 mt-0.5">Select an order to view status</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Back to dashboard
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {orders.length === 0 && (
            <p className="text-center text-gray-400 py-12 text-sm">No orders found.</p>
          )}
          {orders.map((o, i) => (
            <div
              key={o.id}
              onClick={() => navigate(`/order/${o.id}`)}
              className={`flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                i !== 0 ? "border-t border-gray-50" : ""
              }`}
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{o.customer.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{o.store.name} · {o.rider.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  o.status === "delivered"  ? "bg-green-50 text-green-700" :
                  o.status === "picked_up"  ? "bg-blue-50 text-blue-700"  :
                  o.status === "assigned"   ? "bg-amber-50 text-amber-700":
                  "bg-gray-50 text-gray-500"
                }`}>
                  {o.status.replace("_", " ")}
                </span>
                <span className="text-xs text-gray-300">→</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}