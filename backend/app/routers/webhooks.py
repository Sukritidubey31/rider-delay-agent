import logging
from fastapi import APIRouter, Request, Form
from app.database import supabase
from app.agent.claude_agent import handle_rider_response

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@router.post("/sms/simulate")
def simulate_sms(rider_phone: str, message: str):
    """
    Simulates an inbound SMS from a rider.
    Same logic as the real Twilio webhook.
    """
    logger.info(f"Simulated SMS from {rider_phone}: {message}")

    rider_result = supabase.table("rider") \
        .select("id") \
        .eq("phone", rider_phone) \
        .single() \
        .execute()

    if not rider_result.data:
        return {"status": "ignored", "reason": "rider not found"}

    rider_id = rider_result.data["id"]

    delay_result = supabase.table("delay") \
        .select("*, order(*, rider(*), customer(*), store(*))") \
        .eq("rider_id", rider_id) \
        .in_("escalation_status", ["pending", "escalated"]) \
        .order("created_at", desc=True) \
        .limit(1) \
        .single() \
        .execute()

    if not delay_result.data:
        return {"status": "ignored", "reason": "no open delay"}

    delay_record = delay_result.data
    order        = delay_record.pop("order")

    handle_rider_response(order, delay_record, message)

    return {"status": "ok"}
    
@router.post("/sms")
async def receive_sms(
    From: str = Form(...),
    Body: str = Form(...),
):
    """
    Twilio hits this endpoint when a rider replies to an SMS.
    From = rider's phone number
    Body = rider's message text
    """
    logger.info(f"Inbound SMS from {From}: {Body}")

    # 1. Find the rider by phone number
    rider_result = supabase.table("rider") \
        .select("id") \
        .eq("phone", From) \
        .single() \
        .execute()

    if not rider_result.data:
        logger.warning(f"No rider found for phone {From}")
        return {"status": "ignored", "reason": "rider not found"}

    rider_id = rider_result.data["id"]

    # 2. Find the most recent open delay record for this rider
    delay_result = supabase.table("delay") \
        .select("*, order(*, rider(*), customer(*), store(*))") \
        .eq("rider_id", rider_id) \
        .in_("escalation_status", ["pending", "escalated"]) \
        .order("created_at", desc=True) \
        .limit(1) \
        .single() \
        .execute()

    if not delay_result.data:
        logger.warning(f"No open delay found for rider {rider_id}")
        return {"status": "ignored", "reason": "no open delay"}

    delay_record = delay_result.data
    order        = delay_record.pop("order")  # unnest the joined order

    # 3. Hand off to the agent
    handle_rider_response(order, delay_record, Body)

    return {"status": "ok"}