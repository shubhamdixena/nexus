-- Fix user_school_targets table schema to match current UI
-- Migration: fix_user_school_targets_schema.sql

-- First, make target_category nullable since new UI doesn't use it
ALTER TABLE user_school_targets 
ALTER COLUMN target_category DROP NOT NULL;

-- Set a default value for existing records that might be null
UPDATE user_school_targets 
SET target_category = 'target' 
WHERE target_category IS NULL;

-- Add any missing columns that the current UI might need
ALTER TABLE user_school_targets 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_school_targets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_school_targets_updated_at ON user_school_targets;
CREATE TRIGGER trigger_update_user_school_targets_updated_at
    BEFORE UPDATE ON user_school_targets
    FOR EACH ROW
    EXECUTE FUNCTION update_user_school_targets_updated_at();

-- Add comments for clarity
COMMENT ON COLUMN user_school_targets.target_category IS 'Legacy field - not used in current UI (reach/target/safety)';
COMMENT ON COLUMN user_school_targets.program_of_interest IS 'Specific program within the school';
COMMENT ON COLUMN user_school_targets.application_round IS 'Preferred application round';
COMMENT ON COLUMN user_school_targets.notes IS 'User notes about this target school';
COMMENT ON COLUMN user_school_targets.priority_score IS 'User priority ranking (1-10)';
COMMENT ON COLUMN user_school_targets.created_at IS 'When the target was added';
COMMENT ON COLUMN user_school_targets.updated_at IS 'When the target was last modified';

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_user_school_targets_user_id ON user_school_targets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_school_targets_school_id ON user_school_targets(school_id);
CREATE INDEX IF NOT EXISTS idx_user_school_targets_priority ON user_school_targets(priority_score DESC);