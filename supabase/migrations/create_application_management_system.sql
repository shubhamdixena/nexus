-- Create application management system for MBA applications
-- Migration: create_application_management_system.sql

-- 1. Create user_application_progress table
CREATE TABLE IF NOT EXISTS user_application_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mba_school_id UUID NOT NULL REFERENCES mba_schools(id) ON DELETE CASCADE,
    
    -- Basic application info
    application_round TEXT CHECK (application_round IN ('R1', 'R2', 'R3', 'R4', 'R5', 'Rolling')),
    target_deadline DATE,
    application_status TEXT DEFAULT 'not_started' CHECK (
        application_status IN (
            'not_started', 'account_created', 'essays_in_progress', 
            'essays_completed', 'review_in_progress', 'ready_to_submit',
            'submitted', 'interview_invited', 'interview_completed',
            'decision_pending', 'accepted', 'waitlisted', 'rejected'
        )
    ),
    
    -- Progress tracking
    overall_completion_percentage INTEGER DEFAULT 0 CHECK (overall_completion_percentage >= 0 AND overall_completion_percentage <= 100),
    essays_completion_percentage INTEGER DEFAULT 0 CHECK (essays_completion_percentage >= 0 AND essays_completion_percentage <= 100),
    lors_completion_percentage INTEGER DEFAULT 0 CHECK (lors_completion_percentage >= 0 AND lors_completion_percentage <= 100),
    documents_completion_percentage INTEGER DEFAULT 0 CHECK (documents_completion_percentage >= 0 AND documents_completion_percentage <= 100),
    
    -- Application details
    application_fee_paid BOOLEAN DEFAULT FALSE,
    application_submitted_date DATE,
    interview_date DATE,
    decision_date DATE,
    decision_result TEXT CHECK (decision_result IN ('accepted', 'waitlisted', 'rejected')),
    
    -- User notes and tracking
    notes TEXT,
    priority_level INTEGER DEFAULT 3 CHECK (priority_level >= 1 AND priority_level <= 5),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one progress entry per user per school
    UNIQUE(user_id, mba_school_id)
);

-- 2. Create user_application_essays table
CREATE TABLE IF NOT EXISTS user_application_essays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    application_progress_id UUID NOT NULL REFERENCES user_application_progress(id) ON DELETE CASCADE,
    
    -- Essay identification
    essay_type TEXT NOT NULL CHECK (
        essay_type IN (
            'personal_statement', 'goals_essay', 'leadership_essay', 
            'achievement_essay', 'failure_essay', 'diversity_essay',
            'why_mba', 'why_school', 'career_goals', 'optional_essay',
            'video_essay_script', 'custom'
        )
    ),
    essay_prompt TEXT,
    custom_title TEXT, -- For custom essay types
    
    -- Essay content and versions
    content TEXT DEFAULT '',
    word_count INTEGER DEFAULT 0,
    character_count INTEGER DEFAULT 0,
    version_number INTEGER DEFAULT 1,
    
    -- Essay requirements
    max_word_limit INTEGER,
    min_word_limit INTEGER,
    is_required BOOLEAN DEFAULT TRUE,
    
    -- Essay status and workflow
    status TEXT DEFAULT 'draft' CHECK (
        status IN (
            'draft', 'in_review', 'review_completed', 
            'final', 'submitted', 'needs_revision'
        )
    ),
    
    -- Review and feedback
    feedback TEXT,
    reviewer_notes TEXT,
    last_reviewed_date DATE,
    
    -- Submission tracking
    submitted_to_school BOOLEAN DEFAULT FALSE,
    submission_date DATE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create user_application_lors table (Letters of Recommendation)
CREATE TABLE IF NOT EXISTS user_application_lors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    application_progress_id UUID NOT NULL REFERENCES user_application_progress(id) ON DELETE CASCADE,
    
    -- Recommender information
    recommender_name TEXT NOT NULL,
    recommender_title TEXT,
    recommender_organization TEXT,
    recommender_email TEXT,
    recommender_phone TEXT,
    
    -- Relationship details
    relationship_to_applicant TEXT NOT NULL CHECK (
        relationship_to_applicant IN (
            'supervisor', 'manager', 'professor', 'colleague', 
            'mentor', 'client', 'direct_report', 'other'
        )
    ),
    relationship_duration TEXT, -- e.g., "2 years", "6 months"
    work_context TEXT, -- Description of how they know the applicant
    
    -- LOR requirements and status
    lor_type TEXT DEFAULT 'standard' CHECK (
        lor_type IN ('academic', 'professional', 'personal', 'standard')
    ),
    is_required BOOLEAN DEFAULT TRUE,
    
    -- Status tracking
    status TEXT DEFAULT 'pending_request' CHECK (
        status IN (
            'pending_request', 'request_sent', 'agreed', 'declined',
            'in_progress', 'completed', 'submitted_to_school', 'expired'
        )
    ),
    
    -- Communication tracking
    request_sent_date DATE,
    reminder_sent_dates DATE[],
    agreed_date DATE,
    deadline_date DATE,
    completion_date DATE,
    
    -- LOR content (if applicable)
    content TEXT, -- For cases where LOR content is shared
    is_confidential BOOLEAN DEFAULT TRUE,
    
    -- Submission details
    submission_method TEXT CHECK (
        submission_method IN ('online_portal', 'email', 'mail', 'hand_delivered')
    ),
    submitted_to_school BOOLEAN DEFAULT FALSE,
    submission_date DATE,
    
    -- Notes and communication history
    notes TEXT,
    communication_history JSONB DEFAULT '[]'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_application_progress_user_id ON user_application_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_application_progress_school_id ON user_application_progress(mba_school_id);
CREATE INDEX IF NOT EXISTS idx_user_application_progress_status ON user_application_progress(application_status);
CREATE INDEX IF NOT EXISTS idx_user_application_progress_deadline ON user_application_progress(target_deadline);

CREATE INDEX IF NOT EXISTS idx_user_application_essays_user_id ON user_application_essays(user_id);
CREATE INDEX IF NOT EXISTS idx_user_application_essays_progress_id ON user_application_essays(application_progress_id);
CREATE INDEX IF NOT EXISTS idx_user_application_essays_type ON user_application_essays(essay_type);
CREATE INDEX IF NOT EXISTS idx_user_application_essays_status ON user_application_essays(status);

CREATE INDEX IF NOT EXISTS idx_user_application_lors_user_id ON user_application_lors(user_id);
CREATE INDEX IF NOT EXISTS idx_user_application_lors_progress_id ON user_application_lors(application_progress_id);
CREATE INDEX IF NOT EXISTS idx_user_application_lors_status ON user_application_lors(status);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE user_application_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_application_essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_application_lors ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for user_application_progress
CREATE POLICY "Users can view their own application progress" ON user_application_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own application progress" ON user_application_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own application progress" ON user_application_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own application progress" ON user_application_progress
    FOR DELETE USING (auth.uid() = user_id);

-- 7. Create RLS policies for user_application_essays
CREATE POLICY "Users can view their own essays" ON user_application_essays
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own essays" ON user_application_essays
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own essays" ON user_application_essays
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own essays" ON user_application_essays
    FOR DELETE USING (auth.uid() = user_id);

-- 8. Create RLS policies for user_application_lors
CREATE POLICY "Users can view their own LORs" ON user_application_lors
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own LORs" ON user_application_lors
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own LORs" ON user_application_lors
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own LORs" ON user_application_lors
    FOR DELETE USING (auth.uid() = user_id);

-- 9. Create trigger functions for automatic updates
CREATE OR REPLACE FUNCTION update_application_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_essay_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    -- Auto-calculate word and character counts
    NEW.word_count = array_length(string_to_array(trim(NEW.content), ' '), 1);
    NEW.character_count = length(NEW.content);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_lor_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create triggers
CREATE TRIGGER update_user_application_progress_updated_at
    BEFORE UPDATE ON user_application_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_application_progress_updated_at();

CREATE TRIGGER update_user_application_essays_updated_at
    BEFORE UPDATE ON user_application_essays
    FOR EACH ROW
    EXECUTE FUNCTION update_essay_updated_at();

CREATE TRIGGER update_user_application_lors_updated_at
    BEFORE UPDATE ON user_application_lors
    FOR EACH ROW
    EXECUTE FUNCTION update_lor_updated_at();

-- 11. Create function to auto-update progress percentages
CREATE OR REPLACE FUNCTION calculate_application_progress()
RETURNS TRIGGER AS $$
DECLARE
    total_essays INTEGER;
    completed_essays INTEGER;
    total_lors INTEGER;
    completed_lors INTEGER;
    essays_pct INTEGER;
    lors_pct INTEGER;
    overall_pct INTEGER;
BEGIN
    -- Calculate essays completion percentage
    SELECT COUNT(*) INTO total_essays 
    FROM user_application_essays 
    WHERE application_progress_id = COALESCE(NEW.application_progress_id, OLD.application_progress_id);
    
    SELECT COUNT(*) INTO completed_essays 
    FROM user_application_essays 
    WHERE application_progress_id = COALESCE(NEW.application_progress_id, OLD.application_progress_id)
    AND status IN ('final', 'submitted');
    
    -- Calculate LORs completion percentage
    SELECT COUNT(*) INTO total_lors 
    FROM user_application_lors 
    WHERE application_progress_id = COALESCE(NEW.application_progress_id, OLD.application_progress_id);
    
    SELECT COUNT(*) INTO completed_lors 
    FROM user_application_lors 
    WHERE application_progress_id = COALESCE(NEW.application_progress_id, OLD.application_progress_id)
    AND status IN ('completed', 'submitted_to_school');
    
    -- Calculate percentages
    essays_pct := CASE WHEN total_essays > 0 THEN (completed_essays * 100 / total_essays) ELSE 100 END;
    lors_pct := CASE WHEN total_lors > 0 THEN (completed_lors * 100 / total_lors) ELSE 100 END;
    
    -- Calculate overall progress (essays 60%, lors 40%)
    overall_pct := (essays_pct * 60 + lors_pct * 40) / 100;
    
    -- Update the progress record
    UPDATE user_application_progress 
    SET 
        essays_completion_percentage = essays_pct,
        lors_completion_percentage = lors_pct,
        overall_completion_percentage = overall_pct,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.application_progress_id, OLD.application_progress_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 12. Create triggers for auto-updating progress
CREATE TRIGGER update_progress_on_essay_change
    AFTER INSERT OR UPDATE OR DELETE ON user_application_essays
    FOR EACH ROW
    EXECUTE FUNCTION calculate_application_progress();

CREATE TRIGGER update_progress_on_lor_change
    AFTER INSERT OR UPDATE OR DELETE ON user_application_lors
    FOR EACH ROW
    EXECUTE FUNCTION calculate_application_progress();

-- 13. Add helpful comments
COMMENT ON TABLE user_application_progress IS 'Tracks overall progress for each MBA school application';
COMMENT ON TABLE user_application_essays IS 'Stores essay content and drafts for MBA applications';
COMMENT ON TABLE user_application_lors IS 'Manages letters of recommendation for MBA applications';

COMMENT ON COLUMN user_application_progress.overall_completion_percentage IS 'Auto-calculated based on essays and LORs completion';
COMMENT ON COLUMN user_application_essays.word_count IS 'Auto-calculated on content update';
COMMENT ON COLUMN user_application_essays.character_count IS 'Auto-calculated on content update';

-- 14. Create helpful views
CREATE OR REPLACE VIEW application_dashboard_view AS
SELECT 
    uap.id as progress_id,
    uap.user_id,
    uap.mba_school_id,
    ms.business_school as school_name,
    ms.location as school_location,
    uap.application_round,
    uap.target_deadline,
    uap.application_status,
    uap.overall_completion_percentage,
    uap.essays_completion_percentage,
    uap.lors_completion_percentage,
    uap.priority_level,
    uap.notes,
    COUNT(DISTINCT uae.id) as total_essays,
    COUNT(DISTINCT CASE WHEN uae.status IN ('final', 'submitted') THEN uae.id END) as completed_essays,
    COUNT(DISTINCT ual.id) as total_lors,
    COUNT(DISTINCT CASE WHEN ual.status IN ('completed', 'submitted_to_school') THEN ual.id END) as completed_lors,
    uap.created_at,
    uap.updated_at
FROM user_application_progress uap
LEFT JOIN mba_schools ms ON uap.mba_school_id = ms.id
LEFT JOIN user_application_essays uae ON uap.id = uae.application_progress_id
LEFT JOIN user_application_lors ual ON uap.id = ual.application_progress_id
GROUP BY uap.id, ms.business_school, ms.location;

-- 15. Grant permissions
GRANT ALL ON user_application_progress TO authenticated;
GRANT ALL ON user_application_essays TO authenticated;
GRANT ALL ON user_application_lors TO authenticated;
GRANT SELECT ON application_dashboard_view TO authenticated; 