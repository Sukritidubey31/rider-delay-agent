import json
import logging
from datetime import datetime, timezone
import anthropic
from app.database import supabase
from app.agent.prompts import system_prompt, initial_rider_prompt, rider_response_prompt
from app.services.sms import send_sms

logger = logging.getLogger(__name__)
client = anthropic.Anthropic()


def _call_claude(user_prompt: str) -> dict:
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        system=system_prompt(),
        messages=[
            {"role": "user", "content": user_prompt}
        ]
    )

    raw = response.content[0].text.strip()
    logger.info(f"Claude raw response: {raw}")

    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    return json.loads(raw)


def handle_delay(order: dict, delay_record: dict):
    """
    Entry point called by the poller when a delay is detected.
    Contacts the rider and decides whether to escalate.
    """
    try:
        logger.info(f"Agent handling delay {delay_record['id']}")
        if delay_record.get("contacted_rider_at"):
            logger.info(f"Delay {delay_record['id']} already contacted, skipping")
            return

        # Ask Claude what to do
        prompt   = initial_rider_prompt(order, delay_record)
        decision = _call_claude(prompt)
        rider_phone   = order.get("rider", {}).get("phone")
        message       = decision.get("message_to_rider")
        now           = datetime.now(timezone.utc).isoformat()

        # SMS the rider
        if rider_phone and message:
            send_sms(rider_phone, message, delay_id=delay_record["id"])
            logger.info(f"SMS sent to rider {rider_phone}")

        # Update delay record
        update = {
            "contacted_rider_at": now,
            "cause"             : decision.get("cause"),
        }

        if decision.get("escalate"):
            _escalate(order, delay_record, decision)
            update["escalation_status"]     = "escalated"
            update["contacted_customer_at"] = now
            update["contacted_store_at"]    = now
        
        supabase.table("delay") \
            .update(update) \
            .eq("id", delay_record["id"]) \
            .execute()

    except Exception as e:
        logger.error(f"Agent error for delay {delay_record['id']}: {e}")


def handle_rider_response(order: dict, delay_record: dict, rider_reply: str):
    """
    Called when a rider replies to the SMS (via Twilio webhook).
    Claude re-evaluates based on the reply.
    """
    try:
        logger.info(f"Agent handling rider reply for delay {delay_record['id']}")
        send_sms(
        order.get("rider", {}).get("phone", "unknown"),
        rider_reply,
        delay_id=delay_record["id"],
        direction="inbound"
        )

        prompt   = rider_response_prompt(order, delay_record, rider_reply)
        decision = _call_claude(prompt)

        now    = datetime.now(timezone.utc).isoformat()
        update = {
            "rider_responded_at": now,
            "cause"             : decision.get("cause"),
        }

        if decision.get("escalate"):
            _escalate(order, delay_record, decision)
            update["escalation_status"]     = "escalated"
            update["contacted_customer_at"] = now
            update["contacted_store_at"]    = now
        else:
            # Rider confirmed they're on their way — mark resolved
            update["escalation_status"] = delay_record.get("escalation_status", "pending")

        supabase.table("delay") \
            .update(update) \
            .eq("id", delay_record["id"]) \
            .execute()

    except Exception as e:
        logger.error(f"Agent response error for delay {delay_record['id']}: {e}")


def _escalate(order: dict, delay_record: dict, decision: dict):
    customer_phone = order.get("customer", {}).get("phone")
    store_phone    = order.get("store", {}).get("contact_phone")
    customer_msg   = decision.get("escalation_message_customer")
    store_msg      = decision.get("escalation_message_store")
    delay_id       = delay_record["id"]

    if customer_phone and customer_msg:
        send_sms(customer_phone, customer_msg,
                 delay_id=delay_id, recipient_type="customer")
        logger.info(f"Escalation SMS sent to customer {customer_phone}")

    if store_phone and store_msg:
        send_sms(store_phone, store_msg,
                 delay_id=delay_id, recipient_type="store")
        logger.info(f"Escalation SMS sent to store {store_phone}")