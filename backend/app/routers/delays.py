import logging
from fastapi import APIRouter, HTTPException
from app.database import supabase
from app.models.schemas import EscalationStatus

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/delays", tags=["delays"])


@router.get("/")
def list_delays():
    result = supabase.table("delay") \
        .select("*, order(*, rider(*), customer(*), store(*))") \
        .order("created_at", desc=True) \
        .execute()
    return result.data


@router.get("/active")
def list_active_delays():
    """All delays not yet resolved — for the live dashboard view."""
    result = supabase.table("delay") \
        .select("*, order(*, rider(*), customer(*), store(*))") \
        .in_("escalation_status", [EscalationStatus.pending.value, EscalationStatus.escalated.value]) \
        .order("created_at", desc=True) \
        .execute()
    return result.data


@router.get("/stats")
def get_stats():
    """Aggregate stats for the dashboard header."""
    all_delays = supabase.table("delay").select("*").execute().data or []

    total      = len(all_delays)
    pending    = sum(1 for d in all_delays if d["escalation_status"] == "pending")
    escalated  = sum(1 for d in all_delays if d["escalation_status"] == "escalated")
    resolved   = sum(1 for d in all_delays if d["escalation_status"] == "resolved")

    resolved_delays = [
        d for d in all_delays
        if d["escalation_status"] == "resolved"
        and d.get("resolved_at")
        and d.get("contacted_rider_at")
    ]

    avg_resolution_minutes = None
    if resolved_delays:
        from datetime import datetime, timezone
        def mins(d):
            start = datetime.fromisoformat(d["contacted_rider_at"])
            end   = datetime.fromisoformat(d["resolved_at"])
            return (end - start).total_seconds() / 60
        avg_resolution_minutes = round(
            sum(mins(d) for d in resolved_delays) / len(resolved_delays), 1
        )

    return {
        "total"                  : total,
        "pending"                : pending,
        "escalated"              : escalated,
        "resolved"               : resolved,
        "avg_resolution_minutes" : avg_resolution_minutes,
    }


@router.get("/{delay_id}")
def get_delay(delay_id: str):
    result = supabase.table("delay") \
        .select("*, order(*, rider(*), customer(*), store(*))") \
        .eq("id", delay_id) \
        .single() \
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Delay not found")
    return result.data


@router.patch("/{delay_id}/resolve")
def resolve_delay(delay_id: str, outcome: str):
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()

    result = supabase.table("delay") \
        .update({
            "escalation_status" : "resolved",
            "resolution_outcome": outcome,
            "resolved_at"       : now,
        }) \
        .eq("id", delay_id) \
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Delay not found")
    return result.data[0]

@router.get("/{delay_id}/messages")
def get_delay_messages(delay_id: str):
    result = supabase.table("message_log") \
        .select("*") \
        .eq("delay_id", delay_id) \
        .order("created_at", desc=False) \
        .execute()
    return result.data or []

@router.get("/by-order/{order_id}")
def get_delays_by_order(order_id: str):
    result = supabase.table("delay") \
        .select("*, order(*, rider(*), customer(*), store(*))") \
        .eq("order_id", order_id) \
        .order("created_at", desc=True) \
        .execute()
    return result.data or []