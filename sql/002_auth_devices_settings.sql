-- 002: additions needed by the three-app API layer.
--  * refresh_tokens can now belong to an admin (admins live outside `users`)
--  * device_tokens stores FCM registration ids for push
--  * system_settings backs Admin Web → Settings
-- Safe to re-run.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Refresh tokens for admin sessions
ALTER TABLE refresh_tokens ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES admins(id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'refresh_tokens_owner_chk'
  ) THEN
    ALTER TABLE refresh_tokens
      ADD CONSTRAINT refresh_tokens_owner_chk
      CHECK ((user_id IS NOT NULL) <> (admin_id IS NOT NULL));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_admin_id ON refresh_tokens(admin_id);

-- 2. Push device tokens
CREATE TABLE IF NOT EXISTS device_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    platform VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens(user_id);

-- 3. Editable system settings
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB,
    description TEXT,
    updated_by UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO system_settings (setting_key, setting_value, description) VALUES
  ('booking_tax_percent', '5'::jsonb, 'GST/tax percentage added to booking subtotal'),
  ('agent_payout_percent', '60'::jsonb, 'Share of booking revenue paid to the agent when no per-service payout is configured'),
  ('agent_fixed_salary', '12000'::jsonb, 'Monthly fixed salary used when generating salary records'),
  ('agent_incentive_threshold', '15000'::jsonb, 'Monthly revenue an agent must generate before incentives apply'),
  ('agent_incentive_percent', '10'::jsonb, 'Incentive percentage on revenue above the threshold'),
  ('booking_cancellation_window_minutes', '60'::jsonb, 'Minutes before start time a customer may cancel free of charge')
ON CONFLICT (setting_key) DO NOTHING;
