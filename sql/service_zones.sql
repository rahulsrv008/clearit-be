CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS service_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Existing installs keep their rows; new columns are added in place.
ALTER TABLE service_areas ADD COLUMN IF NOT EXISTS code VARCHAR(32);
ALTER TABLE service_areas ADD COLUMN IF NOT EXISTS region VARCHAR(50);
ALTER TABLE service_areas ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE service_areas ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE service_areas ADD COLUMN IF NOT EXISTS service_radius_km INT DEFAULT 3;

CREATE UNIQUE INDEX IF NOT EXISTS uq_service_areas_code
  ON service_areas (code)
  WHERE code IS NOT NULL;

CREATE TABLE IF NOT EXISTS service_zone_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_area_id UUID NOT NULL REFERENCES service_areas(id) ON DELETE CASCADE,
  area_name VARCHAR(150) NOT NULL,
  pincode VARCHAR(10),
  buildings_cover JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_service_zone_areas_area_id
  ON service_zone_areas (service_area_id);

CREATE INDEX IF NOT EXISTS idx_service_zone_areas_pincode
  ON service_zone_areas (pincode);
