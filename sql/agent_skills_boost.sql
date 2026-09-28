-- Incremental: skills catalog, agent skill selections, booking boost.
-- Safe to run on an existing ClearIt database.

ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS boost_enabled BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(80) UNIQUE NOT NULL,
    name VARCHAR(120) NOT NULL,
    category VARCHAR(80) NOT NULL,
    training_track VARCHAR(80) NOT NULL,
    description TEXT DEFAULT '',
    match_keywords TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id),
    skill_id UUID NOT NULL REFERENCES skills(id),
    selected BOOLEAN DEFAULT FALSE,
    training_status VARCHAR(30) DEFAULT 'UNVERIFIED',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (agent_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_skills_agent_id ON agent_skills(agent_id);

GRANT ALL PRIVILEGES ON TABLE skills TO cladmin;
GRANT ALL PRIVILEGES ON TABLE agent_skills TO cladmin;
