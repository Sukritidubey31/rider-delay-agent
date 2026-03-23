import logging
from app.database import supabase

logger = logging.getLogger(__name__)

def send_sms(to: str, body: str, delay_id: str = None,
             direction: str = "outbound", recipient_type: str = "rider") -> bool:
    logger.info(f"[SMS MOCK] To: {to} | Message: {body}")

    if delay_id:
        try:
            supabase.table("message_log").insert({
                "delay_id"       : delay_id,
                "direction"      : direction,
                "recipient"      : to,
                "recipient_type" : recipient_type,
                "message"        : body,
            }).execute()
        except Exception as e:
            logger.error(f"Failed to log message: {e}")

    return True