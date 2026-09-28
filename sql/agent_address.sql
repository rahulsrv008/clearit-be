-- Live address captured from the agent map, plus optional passbook scans.
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(255),
  ADD COLUMN IF NOT EXISTS locality VARCHAR(120),
  ADD COLUMN IF NOT EXISTS city VARCHAR(120),
  ADD COLUMN IF NOT EXISTS state VARCHAR(120),
  ADD COLUMN IF NOT EXISTS pincode VARCHAR(12),
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 7),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 7);
