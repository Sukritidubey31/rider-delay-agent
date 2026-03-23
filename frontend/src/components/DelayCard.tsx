import { useEffect, useState } from "react";
import { type Delay, resolveDelay, getDelayMessages, simulateRiderReply, type MessageLog } from "../api/client";

interface Props {
  delay: Delay;
  onResolved: () => void;
}

const badge = (status: string) => {
  const styles: Record<string, string> = {
    pending  : "bg-amber-50 text-amber-700 border-amber-200",
    escalated: "bg-red-50 text-red-700 border-red-200",
    resolved : "bg-green-50 text-green-700 border-green-200",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${styles[status] ?? ""}`}>
      {status}
    </span>
  );
};

const ts = (val: string | null) =>
  val ? new Date(val).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

export default function DelayCard({ delay, onResolved }: Props) {

  const [replyText,    setReplyText]    = useState("");
  const [replying,     setReplying]     = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);

  const order                         = delay.order;
  const rider                         = order.rider;
  const [messages, setMessages]       = useState<MessageLog[]>([]);

  useEffect(() => {
    getDelayMessages(delay.id).then(setMessages);
  }, [delay.id]);

  const handleResolve = async (outcome: string) => {
    await resolveDelay(delay.id, outcome);
    onResolved();
  };

  const handleSimulateReply = async () => {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      await simulateRiderReply(order.rider.phone, replyText);
      setReplyText("");
      setReplySuccess(true);
      setTimeout(() => {
        setReplySuccess(false);
        getDelayMessages(delay.id).then(setMessages);
      }, 1000);
    } catch (e) {
      console.error(e);
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-gray-900">{rider.name}</p>
          <p className="text-xs text-gray-400">{rider.phone} · {rider.vehicle_type}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {badge(delay.escalation_status)}
          <span className="text-xs text-gray-400">
            {delay.delay_type === "late_pickup" ? "Late pickup" : "Late delivery"}
          </span>
        </div>
        <button
        onClick={() => window.open(`/orders/${order.id}`, "_blank")}
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors mt-1"
        >
        View full order →
        </button>
      </div>

      {/* Order info */}
      <div className="text-sm text-gray-600 space-y-1">
        <p><span className="text-gray-400">Store</span> {order.store.name}</p>
        <p><span className="text-gray-400">Customer</span> {order.customer.name}</p>
        {delay.cause && (
          <p><span className="text-gray-400">Cause</span> {delay.cause}</p>
        )}
        {delay.delayed_by_minutes && (
          <p><span className="text-gray-400">Delayed by</span> {delay.delayed_by_minutes} min</p>
        )}
      </div>

      {/* Timeline */}
      <div className="text-xs text-gray-400 grid grid-cols-2 gap-1">
        <span>Rider contacted: {ts(delay.contacted_rider_at)}</span>
        <span>Rider replied: {ts(delay.rider_responded_at)}</span>
        <span>Customer notified: {ts(delay.contacted_customer_at)}</span>
        <span>Store notified: {ts(delay.contacted_store_at)}</span>
      </div>

      {/* Split messages by recipient type */}
        {messages.length > 0 && (() => {
        const riderMsgs     = messages.filter(m => m.recipient_type === "rider");
        const escalationMsgs = messages.filter(m => m.recipient_type !== "rider");

        return (
            <>
            {/* Rider conversation */}
            {riderMsgs.length > 0 && (
                <div className="space-y-2">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    Rider conversation
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {riderMsgs.map(m => (
                    <div
                        key={m.id}
                        className={`flex ${m.direction === "outbound" ? "justify-end" : "justify-start"}`}
                    >
                        <div className={`max-w-xs rounded-xl px-3 py-2 ${
                        m.direction === "outbound"
                            ? "bg-blue-50 text-blue-800"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                        <p className="text-xs">{m.message}</p>
                        <p className={`text-xs mt-1 ${
                            m.direction === "outbound" ? "text-blue-400" : "text-gray-400"
                        }`}>
                            {new Date(m.created_at).toLocaleTimeString([], {
                            hour: "2-digit", minute: "2-digit"
                            })}
                            {" · "}
                            {m.direction === "outbound" ? "Agent → Rider" : "Rider → Agent"}
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
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    Escalation notifications
                </p>
                <div className="space-y-2">
                    {escalationMsgs.map(m => (
                    <div key={m.id} className="rounded-xl border border-red-100 bg-red-50 px-3 py-2">
                        <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-red-600 capitalize">
                            {m.recipient_type === "customer" ? "Customer notified" : "Store notified"}
                        </span>
                        <span className="text-xs text-red-400">
                            {new Date(m.created_at).toLocaleTimeString([], {
                            hour: "2-digit", minute: "2-digit"
                            })}
                        </span>
                        </div>
                        <p className="text-xs text-red-700">{m.message}</p>
                    </div>
                    ))}
                </div>
                </div>
            )}
            </>
        );
        })()}

      {/* Simulate rider reply */}
        {delay.escalation_status !== "resolved" && (
        <div className="space-y-2">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            Simulate rider reply
            </p>
            {replySuccess ? (
            <p className="text-xs text-green-600">Reply sent — agent is processing...</p>
            ) : (
            <div className="flex gap-2">
                <input
                type="text"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSimulateReply()}
                placeholder="Type rider's reply..."
                className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-300"
                />
                <button
                onClick={handleSimulateReply}
                disabled={replying || !replyText.trim()}
                className="text-xs bg-gray-800 hover:bg-gray-900 text-white rounded-lg px-3 py-2 transition-colors disabled:opacity-40"
                >
                {replying ? "..." : "Send"}
                </button>
            </div>
            )}
        </div>
        )}

      {/* Actions */}
      {delay.escalation_status !== "resolved" && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => handleResolve("resolved_by_ops")}
            className="flex-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg py-1.5 transition-colors"
          >
            Mark resolved
          </button>
          <button
            onClick={() => handleResolve("no_response")}
            className="flex-1 text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-lg py-1.5 transition-colors"
          >
            No response
          </button>
        </div>
      )}

    </div>
  );
}