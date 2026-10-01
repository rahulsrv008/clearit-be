-- Agent coverage + customer zone assignment. Safe to re-run.

ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS home_zone UUID REFERENCES service_areas(id) ON DELETE SET NULL;
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS service_areas UUID[] NOT NULL DEFAULT '{}';
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS current_location JSONB;

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS home_zone UUID REFERENCES service_areas(id) ON DELETE SET NULL;

ALTER TABLE customer_addresses
  ADD COLUMN IF NOT EXISTS service_area_id UUID REFERENCES service_areas(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_agents_home_zone ON agents (home_zone);
CREATE INDEX IF NOT EXISTS idx_customers_home_zone ON customers (home_zone);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_service_area
  ON customer_addresses (service_area_id);
