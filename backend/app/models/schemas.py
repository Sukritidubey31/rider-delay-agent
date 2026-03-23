from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from enum import Enum


# ── Enums ────────────────────────────────────────────────────

class RiderStatus(str, Enum):
    available = "available"
    assigned  = "assigned"
    offline   = "offline"

class OrderStatus(str, Enum):
    assigned  = "assigned"
    picked_up = "picked_up"
    delivered = "delivered"
    cancelled = "cancelled"

class DelayType(str, Enum):
    late_pickup   = "late_pickup"
    late_delivery = "late_delivery"

class EscalationStatus(str, Enum):
    pending   = "pending"
    escalated = "escalated"
    resolved  = "resolved"

class ResolutionOutcome(str, Enum):
    resolved_by_rider = "resolved_by_rider"
    resolved_by_ops   = "resolved_by_ops"
    cancelled         = "cancelled"
    no_response       = "no_response"


# ── Rider ────────────────────────────────────────────────────

class Rider(BaseModel):
    id           : UUID
    name         : str
    phone        : str
    vehicle_type : Optional[str]
    status       : RiderStatus
    created_at   : datetime


# ── Customer ─────────────────────────────────────────────────

class Customer(BaseModel):
    id         : UUID
    name       : str
    phone      : str
    email      : Optional[str]
    created_at : datetime


# ── Store ────────────────────────────────────────────────────

class Store(BaseModel):
    id            : UUID
    name          : str
    contact_phone : str
    address       : Optional[str]
    created_at    : datetime


# ── Order ────────────────────────────────────────────────────

class Order(BaseModel):
    id                   : UUID
    rider_id             : UUID
    customer_id          : UUID
    store_id             : UUID
    status               : OrderStatus
    placed_at            : datetime
    expected_pickup_at   : datetime
    picked_up_at         : Optional[datetime]
    expected_delivery_at : datetime
    delivered_at         : Optional[datetime]
    created_at           : datetime


# ── Delay ────────────────────────────────────────────────────

class Delay(BaseModel):
    id                   : UUID
    order_id             : UUID
    rider_id             : UUID
    delay_type           : DelayType
    cause                : Optional[str]
    delayed_by_minutes   : Optional[int]
    escalation_status    : EscalationStatus
    resolution_outcome   : Optional[ResolutionOutcome]
    contacted_rider_at   : Optional[datetime]
    rider_responded_at   : Optional[datetime]
    contacted_customer_at: Optional[datetime]
    contacted_store_at   : Optional[datetime]
    resolved_at          : Optional[datetime]
    created_at           : datetime


# ── Create payloads (for POST endpoints) ─────────────────────

class OrderCreate(BaseModel):
    rider_id             : UUID
    customer_id          : UUID
    store_id             : UUID
    expected_pickup_at   : datetime
    expected_delivery_at : datetime

class DelayCreate(BaseModel):
    order_id   : UUID
    rider_id   : UUID
    delay_type : DelayType