def system_prompt() -> str:
    return """You are an operations assistant for a delivery platform.
Your job is to contact riders who are delayed and determine the cause.

You must:
- Be professional, brief, and friendly
- Ask for the cause of the delay and a new estimated time
- Based on the rider's response, decide whether to escalate to the customer and store
- If the rider does not respond or the delay is severe (>30 min), recommend escalation

CRITICAL: You must respond ONLY with a valid JSON object. No preamble, no explanation, no markdown fences.
Your entire response must be parseable by json.loads().

Respond with exactly this structure:
{
  "message_to_rider": "the SMS message to send to the rider",
  "escalate": true or false,
  "cause": "short description of cause or null if unknown",
  "estimated_delay_minutes": integer or null,
  "escalation_message_customer": "SMS to customer if escalate is true, else null",
  "escalation_message_store": "SMS to store if escalate is true, else null"
}"""


def initial_rider_prompt(order: dict, delay_record: dict) -> str:
    rider   = order.get("rider", {})
    store   = order.get("store", {})
    delay_type = delay_record.get("delay_type", "")

    if delay_type == "late_pickup":
        situation = f"has not yet picked up the order from {store.get('name', 'the store')}"
    else:
        situation = f"has not yet delivered the order and is past the expected delivery time"

    return f"""A rider named {rider.get('name', 'the rider')} {situation}.

Order ID: {order['id']}
Delay type: {delay_type}
Rider phone: {rider.get('phone', 'unknown')}

Generate the initial outreach SMS to the rider asking about the delay,
and decide whether to escalate immediately based on severity."""


def rider_response_prompt(order: dict, delay_record: dict, rider_reply: str) -> str:
    rider = order.get("rider", {})
    return f"""The rider {rider.get('name', 'the rider')} has responded to your delay inquiry.

Their reply: "{rider_reply}"

Order ID: {order['id']}
Current delay type: {delay_record.get('delay_type')}
Minutes delayed so far: {delay_record.get('delayed_by_minutes', 'unknown')}

Based on their response:
- If the delay cause is minor and rider confirms they are on their way: set escalate=false
- If the delay is severe, ongoing, or rider is stuck: set escalate=true and notify customer and store
- Only set resolved=true if the rider confirms the order has been delivered

Respond with the same JSON structure. Always include a message_to_rider acknowledging their update."""