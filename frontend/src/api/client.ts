import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: { "Content-Type": "application/json" },
});

// ── Types ────────────────────────────────────────────────────

export interface Rider {
  id: string;
  name: string;
  phone: string;
  vehicle_type: string;
  status: "available" | "assigned" | "offline";
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface Store {
  id: string;
  name: string;
  contact_phone: string;
  address: string;
}

export interface Order {
  id: string;
  rider: Rider;
  customer: Customer;
  store: Store;
  status: "assigned" | "picked_up" | "delivered" | "cancelled";
  placed_at: string;
  expected_pickup_at: string;
  picked_up_at: string | null;
  expected_delivery_at: string;
  delivered_at: string | null;
}

export interface Delay {
  id: string;
  order: Order;
  delay_type: "late_pickup" | "late_delivery";
  cause: string | null;
  delayed_by_minutes: number | null;
  escalation_status: "pending" | "escalated" | "resolved";
  resolution_outcome: string | null;
  contacted_rider_at: string | null;
  rider_responded_at: string | null;
  contacted_customer_at: string | null;
  contacted_store_at: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface Stats {
  total: number;
  pending: number;
  escalated: number;
  resolved: number;
  avg_resolution_minutes: number | null;
}

export interface OrderTracking {
    order_id: string;
    status: string;
    store_name: string;
    store_address: string;
    placed_at: string;
    expected_pickup_at: string;
    picked_up_at: string | null;
    expected_delivery_at: string;
    delivered_at: string | null;
    delay: {
      active: boolean;
      cause: string | null;
      delayed_by_minutes: number | null;
      escalation_status: string;
    } | null;
  }

  export interface MessageLog {
    id             : string;
    delay_id       : string;
    direction      : "outbound" | "inbound";
    recipient_type : "rider" | "customer" | "store";
    recipient      : string;
    message        : string;
    created_at     : string;
  }
  
export const getDelayMessages = (delayId: string) =>
  api.get<MessageLog[]>(`/delays/${delayId}/messages`).then(r => r.data);
  
export const getOrderTracking = (id: string) =>
  api.get<OrderTracking>(`/orders/${id}/tracking`).then(r => r.data);

export const getActiveDelays  = () => api.get<Delay[]>("/delays/active").then(r => r.data);
export const getAllDelays      = () => api.get<Delay[]>("/delays/").then(r => r.data);
export const getDelay         = (id: string) => api.get<Delay>(`/delays/${id}`).then(r => r.data);
export const getStats         = () => api.get<Stats>("/delays/stats").then(r => r.data);
export const resolveDelay     = (id: string, outcome: string) =>
  api.patch(`/delays/${id}/resolve?outcome=${outcome}`).then(r => r.data);

export const getActiveOrders  = () => api.get<Order[]>("/orders/active").then(r => r.data);
export const getAllOrders      = () => api.get<Order[]>("/orders/").then(r => r.data);
export const updateOrderStatus = (id: string, status: string) =>
  api.patch(`/orders/${id}/status?status=${status}`).then(r => r.data);

export interface RiderBasic   { id: string; name: string; phone: string; }
export interface CustomerBasic{ id: string; name: string; }
export interface StoreBasic   { id: string; name: string; }

export const getRiders    = () => api.get<RiderBasic[]>("/riders").then(r => r.data);
export const getCustomers = () => api.get<CustomerBasic[]>("/customers").then(r => r.data);
export const getStores    = () => api.get<StoreBasic[]>("/stores").then(r => r.data);
export const createOrder  = (payload: OrderCreate) =>
  api.post("/orders/", payload).then(r => r.data);

export interface OrderCreate {
  rider_id             : string;
  customer_id          : string;
  store_id             : string;
  expected_pickup_at   : string;
  expected_delivery_at : string;
}

export const simulateRiderReply = (riderPhone: string, message: string) =>
    api.post(`/webhooks/sms/simulate?rider_phone=${encodeURIComponent(riderPhone)}&message=${encodeURIComponent(message)}`).then(r => r.data);
export const getDelaysByOrder = (orderId: string) =>
    api.get<Delay[]>(`/delays/by-order/${orderId}`).then(r => r.data);
export default api;