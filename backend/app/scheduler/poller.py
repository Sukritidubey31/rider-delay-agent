import logging
from apscheduler.schedulers.background import BackgroundScheduler
from app.services.delay_detector import get_delayed_orders, create_delay_record
from app.agent.claude_agent import handle_delay

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()


_processing = set()

def poll_for_delays():
    logger.info("Polling for delayed orders...")
    delayed_orders = get_delayed_orders()

    if not delayed_orders:
        logger.info("No delays detected.")
        return

    logger.info(f"{len(delayed_orders)} delay(s) detected.")

    for order in delayed_orders:
        order_id = order["id"]
        if order_id in _processing:
            logger.info(f"Order {order_id} already being processed, skipping")
            continue

        _processing.add(order_id)
        try:
            delay_record = create_delay_record(order)
            logger.info(f"Delay record created: {delay_record['id']} — firing agent")
            handle_delay(order, delay_record)
        finally:
            _processing.discard(order_id)


def start_scheduler():
    scheduler.add_job(poll_for_delays, "interval", seconds=30, id="delay_poller")
    scheduler.start()
    logger.info("Scheduler started — polling every 30 seconds.")


def stop_scheduler():
    scheduler.shutdown()