import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { type Order, type Delay, type MessageLog, getDelayMessages } from "../api/client";
import api from "../api/client";

const fmt = (val: string | null) =>
  val ? new Date(val).toLocaleString([], {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit"
  }) : null;

const ts = (val: string | null) =>
  val ? new Date(val).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

export default function OrderDetail() {
  const { orderId }               = useParams<{ orderId: string }>();
  const navigate                  = useNavigate();
  const [order,   setOrder]       = useState<Order | null>(null);
  const [delays,  setDelays]      = useState<Delay[]>([]);
  const [messages, setMessages]   = useState<Record<string, MessageLog[]>>({});
  const [loading, setLoading]     = useState(true);

  const load = async () => {
    const [orderRes, delayRes] = await Promise.all([
      api.get<Order>(`/orders/${orderId}`).then(r => r.data),
      api.get<Delay[]>(`/delays/by-order/${orderId}`).then(r => r.data).catch(() => []),
    ]);
    setOrder(orderRes);
    setDelays(delayRes);

    // Load messages for each delay
    const msgMap: Record<string, MessageLog[]> = {};
    for (const d of delayRes) {
      msgMap[d.id] = await getDelayMessages(d.id);
    }
    setMessages(msgMap);
    setLoading(false);
  };

  useEffect(() => { load(); }, [orderId]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Order not found.</p>
    </div>
  );

  const statusSteps = [
    { key: "assigned",  label: "Order assigned",  time: order.placed_at },
    { key: "picked_up", label: "Picked up",        time: order.picked_up_at },
    { key: "delivered", label: "Delivered",        time: order.delivered_at },
  ];

  const currentStep =
    order.status === "delivered" ? 2 :
    order.status === "picked_up" ? 1 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Order detail</h1>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">{order.id}</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Back to dashboard
          </button>
        </div>

        {/* Order info */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Rider</p>
            <p className="text-sm font-medium text-gray-900">{order.rider.name}</p>
            <p className="text-xs text-gray-400">{order.rider.phone}</p>
            <p className="text-xs text-gray-400">{order.rider.vehicle_type}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Store</p>
            <p className="text-sm font-medium text-gray-900">{order.store.name}</p>
            <p className="text-xs text-gray-400">{order.store.address}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Customer</p>
            <p className="text-sm font-medium text-gray-900">{order.customer.name}</p>
            <p className="text-xs text-gray-400">{order.customer.phone}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-medium text-gray-700 mb-4">Order timeline</h2>
          <div className="relative">
            <div className="absolute left-3.5 top-4 bottom-4 w-px bg-gray-100" />
            <div className="space-y-5">
              {statusSteps.map((step, i) => {
                const done = i <= currentStep;
                return (
                  <div key={step.key} className="flex items-start gap-4 relative">
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 ${
                      done ? "border-green-400 bg-green-50" : "border-gray-200 bg-white"
                    }`}>
                      {done && <div className="w-2.5 h-2.5 rounded-full bg-green-400" />}
                    </div>
                    <div className="pt-0.5">
                      <p className={`text-sm font-medium ${done ? "text-gray-900" : "text-gray-300"}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-gray-400">{fmt(step.time) ?? "—"}</p>
                    </div>
                  </div>
                );
              })}

              {/* Expected times */}
              <div className="flex items-start gap-4">
                <div className="w-7 h-7 flex-shrink-0" />
                <div className="text-xs text-gray-400 space-y-0.5">
                  <p>Expected pickup: {fmt(order.expected_pickup_at)}</p>
                  <p>Expected delivery: {fmt(order.expected_delivery_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delay history */}
        {delays.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-gray-700">Delay history</h2>
            {delays.map(d => {
              const msgs = messages[d.id] || [];
              const riderMsgs = msgs.filter(m => m.recipient_type === "rider");
              const escalationMsgs = msgs.filter(m => m.recipient_type !== "rider");

              return (
                <div key={d.id} className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">

                  {/* Delay header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                        d.escalation_status === "resolved"  ? "bg-green-50 text-green-700 border-green-200" :
                        d.escalation_status === "escalated" ? "bg-red-50 text-red-700 border-red-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {d.escalation_status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {d.delay_type === "late_pickup" ? "Late pickup" : "Late delivery"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{ts(d.created_at)}</span>
                  </div>

                  {/* Delay info */}
                  <div className="text-xs text-gray-500 space-y-1">
                    {d.cause && <p><span className="text-gray-400">Cause</span> · {d.cause}</p>}
                    {d.delayed_by_minutes && <p><span className="text-gray-400">Delayed by</span> · {d.delayed_by_minutes} min</p>}
                    {d.resolution_outcome && <p><span className="text-gray-400">Outcome</span> · {d.resolution_outcome.replace(/_/g, " ")}</p>}
                  </div>

                  {/* Timestamps */}
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
                    <span>Rider contacted: {ts(d.contacted_rider_at)}</span>
                    <span>Rider replied: {ts(d.rider_responded_at)}</span>
                    <span>Customer notified: {ts(d.contacted_customer_at)}</span>
                    <span>Store notified: {ts(d.contacted_store_at)}</span>
                    {d.resolved_at && <span>Resolved: {ts(d.resolved_at)}</span>}
                  </div>

                  {/* Rider conversation */}
                  {riderMsgs.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Rider conversation</p>
                      <div className="space-y-2">
                        {riderMsgs.map(m => (
                          <div key={m.id} className={`flex ${m.direction === "outbound" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-xs rounded-xl px-3 py-2 ${
                              m.direction === "outbound" ? "bg-blue-50 text-blue-800" : "bg-gray-100 text-gray-700"
                            }`}>
                              <p className="text-xs">{m.message}</p>
                              <p className={`text-xs mt-1 ${m.direction === "outbound" ? "text-blue-400" : "text-gray-400"}`}>
                                {ts(m.created_at)} · {m.direction === "outbound" ? "Agent → Rider" : "Rider → Agent"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Escalation notifications */}
                  {escalationMsgs.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Escalation notifications</p>
                      <div className="space-y-2">
                        {escalationMsgs.map(m => (
                          <div key={m.id} className="rounded-xl border border-red-100 bg-red-50 px-3 py-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-red-600 capitalize">
                                {m.recipient_type === "customer" ? "Customer notified" : "Store notified"}
                              </span>
                              <span className="text-xs text-red-400">{ts(m.created_at)}</span>
                            </div>
                            <p className="text-xs text-red-700">{m.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {delays.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <p className="text-sm text-gray-400">No delays recorded for this order.</p>
          </div>
        )}

      </div>
    </div>
  );
}