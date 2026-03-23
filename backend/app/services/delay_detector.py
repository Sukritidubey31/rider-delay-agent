from datetime import datetime, timezone
from app.database import supabase
from app.models.schemas import OrderStatus, DelayType


DELAY_THRESHOLD_MINUTES = 10


def get_delayed_orders() -> list[dict]:
    """
    Query active orders where current time exceeds
    expected time + threshold. Skip orders that already
    have a delay record.
    """
    now = datetime.now(timezone.utc).isoformat()

    # Fetch all assigned or picked_up orders
    result = supabase.table("order") \
        .select("*, rider(*), customer(*), store(*)") \
        .in_("status", [OrderStatus.assigned.value, OrderStatus.picked_up.value]) \
        .execute()

    orders = result.data or []
    delayed = []

    for order in orders:
        delay_type = _check_delay(order, now)
        if not delay_type:
            continue

        # Skip if delay record already exists for this order
        existing = supabase.table("delay") \
            .select("id") \
            .eq("order_id", order["id"]) \
            .execute()

        if existing.data:
            continue

        order["detected_delay_type"] = delay_type
        delayed.append(order)

    return delayed


def _check_delay(order: dict, now: str) -> DelayType | None:
    """
    Returns the delay type if the order is late, else None.
    - assigned   → check expected_pickup_at
    - picked_up  → check expected_delivery_at
    """
    status = order["status"]
    now_dt = datetime.fromisoformat(now)

    if status == OrderStatus.assigned.value:
        expected = order.get("expected_pickup_at")
        if not expected:
            return None
        expected_dt = datetime.fromisoformat(expected)
        delta = (now_dt - expected_dt).total_seconds() / 60
        if delta >= DELAY_THRESHOLD_MINUTES:
            return DelayType.late_pickup

    elif status == OrderStatus.picked_up.value:
        expected = order.get("expected_delivery_at")
        if not expected:
            return None
        expected_dt = datetime.fromisoformat(expected)
        delta = (now_dt - expected_dt).total_seconds() / 60
        if delta >= DELAY_THRESHOLD_MINUTES:
            return DelayType.late_delivery

    return None


def create_delay_record(order: dict) -> dict:
    """
    Insert a new delay record for a detected delayed order.
    Returns the created delay row.
    """
    payload = {
        "order_id"          : order["id"],
        "rider_id"          : order["rider_id"],
        "delay_type"        : order["detected_delay_type"],
        "escalation_status" : "pending",
    }

    result = supabase.table("delay").insert(payload).execute()
    return result.data[0]