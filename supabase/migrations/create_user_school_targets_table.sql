-- Create user_school_targets table for storing user's target schools
-- Migration: create_user_school_targets_table.sql

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_school_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES mba_schools(id) ON DELETE CASCADE,
    
    -- User preferences for this target school
    program_of_interest TEXT,
    application_round TEXT CHECK (application_round IN ('R1', 'R2', 'R3', 'Rolling')),
    notes TEXT,
    priority_score INTEGER NOT NULL DEFAULT 5 CHECK (priority_score >= 1 AND priority_score <= 10),
    target_category TEXT DEFAULT 'target' CHECK (target_category IN ('reach', 'target', 'safety')),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure user can't add same school twice
    UNIQUE(user_id, school_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_school_targets_user_id ON user_school_targets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_school_targets_school_id ON user_school_targets(school_id);
CREATE INDEX IF NOT EXISTS idx_user_school_targets_priority ON user_school_targets(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_school_targets_created ON user_school_targets(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_school_targets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own school targets
CREATE POLICY "Users can view their own school targets" ON user_school_targets
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own school targets  
CREATE POLICY "Users can insert their own school targets" ON user_school_targets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own school targets
CREATE POLICY "Users can update their own school targets" ON user_school_targets
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own school targets
CREATE POLICY "Users can delete their own school targets" ON user_school_targets
    FOR DELETE USING (auth.uid() = user_id);

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

-- Add comments for documentation
COMMENT ON TABLE user_school_targets IS 'Stores users target schools with preferences and notes';
COMMENT ON COLUMN user_school_targets.program_of_interest IS 'Specific program within the school (MBA, Executive MBA, etc.)';
COMMENT ON COLUMN user_school_targets.application_round IS 'Preferred application round (R1, R2, R3, Rolling)';
COMMENT ON COLUMN user_school_targets.notes IS 'User notes about this target school';
COMMENT ON COLUMN user_school_targets.priority_score IS 'User priority ranking (1-10, with 10 being highest priority)';
COMMENT ON COLUMN user_school_targets.target_category IS 'School difficulty category (reach/target/safety)';
COMMENT ON COLUMN user_school_targets.created_at IS 'When the target was added';
COMMENT ON COLUMN user_school_targets.updated_at IS 'When the target was last modified';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_school_targets TO authenticated;