CREATE TYPE rider_status AS ENUM (
  'available',
  'assigned',
  'offline'
);

CREATE TYPE order_status AS ENUM (
  'assigned',
  'picked_up',
  'delivered',
  'cancelled'
);

CREATE TYPE delay_type AS ENUM (
  'late_pickup',
  'late_delivery'
);

CREATE TYPE escalation_status AS ENUM (
  'pending',
  'escalated',
  'resolved'
);

CREATE TYPE resolution_outcome AS ENUM (
  'resolved_by_rider',
  'resolved_by_ops',
  'cancelled',
  'no_response'
);


CREATE TABLE rider (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  phone             TEXT NOT NULL UNIQUE,
  vehicle_type      TEXT,
  status            rider_status NOT NULL DEFAULT 'available',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE customer (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  phone             TEXT NOT NULL UNIQUE,
  email             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE store (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  contact_phone     TEXT NOT NULL,
  address           TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "order" (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id                UUID NOT NULL REFERENCES rider(id),
  customer_id             UUID NOT NULL REFERENCES customer(id),
  store_id                UUID NOT NULL REFERENCES store(id),

  status                  order_status NOT NULL DEFAULT 'assigned',

  placed_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  expected_pickup_at      TIMESTAMPTZ NOT NULL,
  picked_up_at            TIMESTAMPTZ,
  expected_delivery_at    TIMESTAMPTZ NOT NULL,
  delivered_at            TIMESTAMPTZ,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE delay (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                UUID NOT NULL REFERENCES "order"(id),
  rider_id                UUID NOT NULL REFERENCES rider(id),

  delay_type              delay_type NOT NULL,
  cause                   TEXT,
  delayed_by_minutes      INT,

  escalation_status       escalation_status NOT NULL DEFAULT 'pending',
  resolution_outcome      resolution_outcome,

  contacted_rider_at      TIMESTAMPTZ,
  rider_responded_at      TIMESTAMPTZ,
  contacted_customer_at   TIMESTAMPTZ,
  contacted_store_at      TIMESTAMPTZ,
  resolved_at             TIMESTAMPTZ,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE INDEX idx_order_status        ON "order"(status);
CREATE INDEX idx_order_rider         ON "order"(rider_id);

CREATE INDEX idx_delay_order_id      ON delay(order_id);
CREATE INDEX idx_delay_escalation    ON delay(escalation_status);

CREATE INDEX idx_delay_created_at    ON delay(created_at DESC);
