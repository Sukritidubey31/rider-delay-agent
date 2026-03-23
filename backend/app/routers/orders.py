import logging
from fastapi import APIRouter, HTTPException
from app.database import supabase
from app.models.schemas import OrderCreate, OrderStatus

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("/")
def list_orders():
    result = supabase.table("order") \
        .select("*, rider(*), customer(*), store(*)") \
        .order("placed_at", desc=True) \
        .execute()
    return result.data


@router.get("/active")
def list_active_orders():
    result = supabase.table("order") \
        .select("*, rider(*), customer(*), store(*)") \
        .in_("status", [OrderStatus.assigned.value, OrderStatus.picked_up.value]) \
        .order("placed_at", desc=True) \
        .execute()
    return result.data


@router.get("/{order_id}")
def get_order(order_id: str):
    result = supabase.table("order") \
        .select("*, rider(*), customer(*), store(*)") \
        .eq("id", order_id) \
        .single() \
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Order not found")
    return result.data


@router.post("/")
def create_order(payload: OrderCreate):
    data = payload.model_dump()
    # Convert UUIDs and datetimes to strings for Supabase
    for key, val in data.items():
        data[key] = str(val) if val is not None else None
    result = supabase.table("order").insert(data).execute()
    return result.data[0]


@router.patch("/{order_id}/status")
def update_order_status(order_id: str, status: OrderStatus):
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()

    update = {"status": status.value}

    # Auto-stamp timestamps when status changes
    if status == OrderStatus.picked_up:
        update["picked_up_at"] = now
    elif status == OrderStatus.delivered:
        update["delivered_at"] = now

    result = supabase.table("order") \
        .update(update) \
        .eq("id", order_id) \
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Order not found")
    return result.data[0]

@router.get("/{order_id}/tracking")
def get_order_tracking(order_id: str):
    """
    Customer-safe order tracking payload.
    No sensitive fields like phone numbers or internal IDs.
    """
    order_result = supabase.table("order") \
        .select("*, rider(*), customer(*), store(*)") \
        .eq("id", order_id) \
        .single() \
        .execute()

    if not order_result.data:
        raise HTTPException(status_code=404, detail="Order not found")

    order = order_result.data

    # Fetch active delay for this order if any
    delay_result = supabase.table("delay") \
        .select("*") \
        .eq("order_id", order_id) \
        .order("created_at", desc=True) \
        .limit(1) \
        .execute()

    delay = delay_result.data[0] if delay_result.data else None

    # Return only customer-safe fields
    return {
        "order_id"             : order["id"],
        "status"               : order["status"],
        "store_name"           : order["store"]["name"],
        "store_address"        : order["store"]["address"],
        "placed_at"            : order["placed_at"],
        "expected_pickup_at"   : order["expected_pickup_at"],
        "picked_up_at"         : order["picked_up_at"],
        "expected_delivery_at" : order["expected_delivery_at"],
        "delivered_at"         : order["delivered_at"],
        "delay": {
            "active"             : True,
            "cause"              : delay["cause"],
            "delayed_by_minutes" : delay["delayed_by_minutes"],
            "escalation_status"  : delay["escalation_status"],
        } if delay else None
    }