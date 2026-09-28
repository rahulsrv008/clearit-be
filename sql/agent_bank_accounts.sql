-- Payout bank account saved from agent onboarding.
-- Safe to run on an existing ClearIt database.

CREATE TABLE IF NOT EXISTS agent_bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id),
    account_holder_name VARCHAR(150),
    account_number VARCHAR(100),
    ifsc_code VARCHAR(20),
    bank_name VARCHAR(150),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_bank_accounts_agent_id
  ON agent_bank_accounts(agent_id);

GRANT ALL PRIVILEGES ON TABLE agent_bank_accounts TO cladmin;
