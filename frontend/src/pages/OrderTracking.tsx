import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { type OrderTracking, getOrderTracking } from "../api/client";
import { useNavigate } from "react-router-dom";

// inside the component, before the return:
const steps = [
  { key: "assigned",  label: "Order placed",    sub: "Rider assigned"        },
  { key: "picked_up", label: "Picked up",        sub: "Order collected"       },
  { key: "delivered", label: "Delivered",        sub: "Order at your door"    },
];

const statusIndex = (status: string) => {
  if (status === "delivered") return 2;
  if (status === "picked_up") return 1;
  return 0;
};

const fmt = (val: string | null) =>
  val ? new Date(val).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null;

export default function OrderTrackingPage() {
  const navigate = useNavigate();
  const { orderId }                       = useParams<{ orderId: string }>();
  const [data,    setData]                = useState<OrderTracking | null>(null);
  const [error,   setError]               = useState(false);
  const [lastRefresh, setLastRefresh]     = useState(new Date());

  const load = async () => {
    try {
      const result = await getOrderTracking(orderId!);
      setData(result);
      setLastRefresh(new Date());
    } catch {
      setError(true);
    }
  };

  useEffect(() => { load(); }, [orderId]);
  useEffect(() => {
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 text-sm">Order not found.</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading your order...</p>
    </div>
  );

  const currentStep = statusIndex(data.status);
  const isDelayed   = !!data.delay;
  const isDelivered = data.status === "delivered";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="flex items-center justify-between mb-2">
            <button
                onClick={() => navigate("/")}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
            >
                ← Back to dashboard
            </button>
            </div>
      <div className="w-full max-w-md space-y-4">

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <p className="text-xs text-gray-400 mb-1">Order from</p>
          <h1 className="text-lg font-semibold text-gray-900">{data.store_name}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{data.store_address}</p>
        </div>

        {/* Delay banner */}
        {isDelayed && !isDelivered && (
          <div className={`rounded-xl border px-5 py-4 ${
            data.delay!.escalation_status === "resolved"
              ? "bg-green-50 border-green-200"
              : "bg-amber-50 border-amber-200"
          }`}>
            <p className={`text-sm font-medium ${
              data.delay!.escalation_status === "resolved"
                ? "text-green-700"
                : "text-amber-700"
            }`}>
              {data.delay!.escalation_status === "resolved"
                ? "Your order is back on track"
                : "Your order is running a little late"}
            </p>
            {data.delay!.cause && (
              <p className={`text-xs mt-1 ${
                data.delay!.escalation_status === "resolved"
                  ? "text-green-600"
                  : "text-amber-600"
              }`}>
                {data.delay!.cause}
                {data.delay!.delayed_by_minutes
                  ? ` · ~${data.delay!.delayed_by_minutes} min delay`
                  : ""}
              </p>
            )}
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-3.5 top-4 bottom-4 w-px bg-gray-100" />

            <div className="space-y-6">
              {steps.map((step, i) => {
                const done    = i <= currentStep;
                const current = i === currentStep;
                const time    = i === 0 ? fmt(data.placed_at)
                              : i === 1 ? fmt(data.picked_up_at)
                              : fmt(data.delivered_at);
                return (
                  <div key={step.key} className="flex items-start gap-4 relative">
                    {/* Dot */}
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 ${
                      done
                        ? current && isDelayed && !isDelivered
                          ? "border-amber-400 bg-amber-50"
                          : "border-green-400 bg-green-50"
                        : "border-gray-200 bg-white"
                    }`}>
                      {done && (
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          current && isDelayed && !isDelivered
                            ? "bg-amber-400"
                            : "bg-green-400"
                        }`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="pt-0.5">
                      <p className={`text-sm font-medium ${done ? "text-gray-900" : "text-gray-300"}`}>
                        {step.label}
                      </p>
                      <p className={`text-xs ${done ? "text-gray-400" : "text-gray-200"}`}>
                        {time ?? step.sub}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ETA */}
        {!isDelivered && (
          <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center justify-between">
            <span className="text-xs text-gray-400">Expected delivery</span>
            <span className="text-sm font-medium text-gray-900">
              {fmt(data.expected_delivery_at) ?? "—"}
            </span>
          </div>
        )}

        {/* Last refresh */}
        <p className="text-center text-xs text-gray-300">
          Updated {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          {" · "}auto-refreshes every 30s
        </p>

      </div>
    </div>
  );
}