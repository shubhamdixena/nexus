-- ===================================================
-- MBA APPLICATION MANAGEMENT SYSTEM - COMPLETE SQL
-- ===================================================
-- Run this entire file in Supabase SQL Editor
-- This will create all tables, triggers, functions, and policies
-- for the MBA Application Management System

-- ===================================================
-- 1. CREATE MAIN TABLES
-- ===================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_application_lors CASCADE;
DROP TABLE IF EXISTS user_application_essays CASCADE;
DROP TABLE IF EXISTS user_application_progress CASCADE;

-- 1.1 User Application Progress Table
CREATE TABLE user_application_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mba_school_id UUID NOT NULL REFERENCES mba_schools(id) ON DELETE CASCADE,
    
    -- Application status
    application_status TEXT DEFAULT 'not_started' CHECK (
        application_status IN (
            'not_started', 'account_created', 'essays_in_progress', 
            'essays_completed', 'review_in_progress', 'ready_to_submit',
            'submitted', 'interview_invited', 'interview_completed',
            'decision_pending', 'accepted', 'waitlisted', 'rejected'
        )
    ),
    
    -- Progress tracking (auto-calculated)
    overall_completion_percentage INTEGER DEFAULT 0 CHECK (overall_completion_percentage >= 0 AND overall_completion_percentage <= 100),
    essays_completion_percentage INTEGER DEFAULT 0 CHECK (essays_completion_percentage >= 0 AND essays_completion_percentage <= 100),
    lors_completion_percentage INTEGER DEFAULT 0 CHECK (lors_completion_percentage >= 0 AND lors_completion_percentage <= 100),
    
    -- User tracking
    notes TEXT,
    priority_level INTEGER DEFAULT 3 CHECK (priority_level >= 1 AND priority_level <= 5),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(user_id, mba_school_id)
);

-- 1.2 User Application Essays Table
CREATE TABLE user_application_essays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    application_progress_id UUID NOT NULL REFERENCES user_application_progress(id) ON DELETE CASCADE,
    
    -- Essay details
    essay_title TEXT NOT NULL DEFAULT 'Untitled Essay',
    essay_prompt TEXT,
    
    -- Content
    content TEXT DEFAULT '',
    word_count INTEGER DEFAULT 0,
    character_count INTEGER DEFAULT 0,
    version_number INTEGER DEFAULT 1,
    
    -- Requirements
    max_word_limit INTEGER,
    min_word_limit INTEGER,
    is_required BOOLEAN DEFAULT TRUE,
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (
        status IN ('draft', 'in_review', 'review_completed', 'final', 'submitted', 'needs_revision')
    ),
    
    -- Review
    feedback TEXT,
    reviewer_notes TEXT,
    last_reviewed_date DATE,
    
    -- Submission
    submitted_to_school BOOLEAN DEFAULT FALSE,
    submission_date DATE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 User Application LORs Table
CREATE TABLE user_application_lors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    application_progress_id UUID NOT NULL REFERENCES user_application_progress(id) ON DELETE CASCADE,
    
    -- Recommender info
    recommender_name TEXT NOT NULL,
    recommender_title TEXT,
    recommender_organization TEXT,
    recommender_email TEXT,
    recommender_phone TEXT,
    
    -- Relationship
    relationship_to_applicant TEXT NOT NULL CHECK (
        relationship_to_applicant IN (
            'supervisor', 'manager', 'professor', 'colleague', 
            'mentor', 'client', 'direct_report', 'other'
        )
    ),
    relationship_duration TEXT,
    work_context TEXT,
    
    -- LOR details
    lor_type TEXT DEFAULT 'standard' CHECK (
        lor_type IN ('academic', 'professional', 'personal', 'standard')
    ),
    is_required BOOLEAN DEFAULT TRUE,
    
    -- Status
    status TEXT DEFAULT 'pending_request' CHECK (
        status IN (
            'pending_request', 'request_sent', 'agreed', 'declined',
            'in_progress', 'completed', 'submitted_to_school', 'expired'
        )
    ),
    
    -- Communication
    request_sent_date DATE,
    agreed_date DATE,
    completion_date DATE,
    
    -- Content
    content TEXT,
    is_confidential BOOLEAN DEFAULT TRUE,
    
    -- Submission
    submission_method TEXT CHECK (
        submission_method IN ('online_portal', 'email', 'mail', 'hand_delivered')
    ),
    submitted_to_school BOOLEAN DEFAULT FALSE,
    submission_date DATE,
    
    -- Notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================
-- 2. CREATE INDEXES
-- ===================================================

-- Progress indexes
CREATE INDEX idx_user_application_progress_user_id ON user_application_progress(user_id);
CREATE INDEX idx_user_application_progress_school_id ON user_application_progress(mba_school_id);
CREATE INDEX idx_user_application_progress_status ON user_application_progress(application_status);

-- Essay indexes
CREATE INDEX idx_user_application_essays_user_id ON user_application_essays(user_id);
CREATE INDEX idx_user_application_essays_progress_id ON user_application_essays(application_progress_id);
CREATE INDEX idx_user_application_essays_status ON user_application_essays(status);

-- LOR indexes
CREATE INDEX idx_user_application_lors_user_id ON user_application_lors(user_id);
CREATE INDEX idx_user_application_lors_progress_id ON user_application_lors(application_progress_id);
CREATE INDEX idx_user_application_lors_status ON user_application_lors(status);

-- ===================================================
-- 3. ENABLE RLS
-- ===================================================

ALTER TABLE user_application_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_application_essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_application_lors ENABLE ROW LEVEL SECURITY;

-- ===================================================
-- 4. CREATE RLS POLICIES
-- ===================================================

-- Progress policies
CREATE POLICY "Users can view their own application progress" ON user_application_progress
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own application progress" ON user_application_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own application progress" ON user_application_progress
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own application progress" ON user_application_progress
    FOR DELETE USING (auth.uid() = user_id);

-- Essay policies
CREATE POLICY "Users can view their own essays" ON user_application_essays
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own essays" ON user_application_essays
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own essays" ON user_application_essays
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own essays" ON user_application_essays
    FOR DELETE USING (auth.uid() = user_id);

-- LOR policies
CREATE POLICY "Users can view their own LORs" ON user_application_lors
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own LORs" ON user_application_lors
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own LORs" ON user_application_lors
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own LORs" ON user_application_lors
    FOR DELETE USING (auth.uid() = user_id);

-- ===================================================
-- 5. CREATE FUNCTIONS
-- ===================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_application_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Essay word count function
CREATE OR REPLACE FUNCTION update_essay_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- Calculate word and character counts
    IF NEW.content IS NOT NULL THEN
        NEW.word_count = COALESCE(array_length(string_to_array(trim(NEW.content), ' '), 1), 0);
        NEW.character_count = length(NEW.content);
    ELSE
        NEW.word_count = 0;
        NEW.character_count = 0;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- LOR timestamp function
CREATE OR REPLACE FUNCTION update_lor_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Progress calculation function
CREATE OR REPLACE FUNCTION calculate_application_progress()
RETURNS TRIGGER AS $$
DECLARE
    progress_id_to_update UUID;
    total_essays INTEGER;
    completed_essays INTEGER;
    total_lors INTEGER;
    completed_lors INTEGER;
    essays_pct INTEGER;
    lors_pct INTEGER;
    overall_pct INTEGER;
BEGIN
    progress_id_to_update = COALESCE(NEW.application_progress_id, OLD.application_progress_id);
    
    -- Count essays
    SELECT COUNT(*) INTO total_essays 
    FROM user_application_essays 
    WHERE application_progress_id = progress_id_to_update;
    
    SELECT COUNT(*) INTO completed_essays 
    FROM user_application_essays 
    WHERE application_progress_id = progress_id_to_update
    AND status IN ('final', 'submitted');
    
    -- Count LORs
    SELECT COUNT(*) INTO total_lors 
    FROM user_application_lors 
    WHERE application_progress_id = progress_id_to_update;
    
    SELECT COUNT(*) INTO completed_lors 
    FROM user_application_lors 
    WHERE application_progress_id = progress_id_to_update
    AND status IN ('completed', 'submitted_to_school');
    
    -- Calculate percentages
    essays_pct := CASE 
        WHEN total_essays > 0 THEN (completed_essays * 100 / total_essays)
        ELSE 100 
    END;
    
    lors_pct := CASE 
        WHEN total_lors > 0 THEN (completed_lors * 100 / total_lors)
        ELSE 100 
    END;
    
    -- Overall: 60% essays + 40% LORs
    overall_pct := (essays_pct * 60 + lors_pct * 40) / 100;
    
    -- Update progress
    UPDATE user_application_progress 
    SET 
        essays_completion_percentage = essays_pct,
        lors_completion_percentage = lors_pct,
        overall_completion_percentage = overall_pct,
        updated_at = NOW()
    WHERE id = progress_id_to_update;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ===================================================
-- 6. CREATE TRIGGERS
-- ===================================================

-- Timestamp triggers
CREATE TRIGGER update_user_application_progress_updated_at
    BEFORE UPDATE ON user_application_progress
    FOR EACH ROW EXECUTE FUNCTION update_application_progress_updated_at();

CREATE TRIGGER update_user_application_essays_updated_at
    BEFORE UPDATE ON user_application_essays
    FOR EACH ROW EXECUTE FUNCTION update_essay_updated_at();

CREATE TRIGGER insert_user_application_essays_word_count
    BEFORE INSERT ON user_application_essays
    FOR EACH ROW EXECUTE FUNCTION update_essay_updated_at();

CREATE TRIGGER update_user_application_lors_updated_at
    BEFORE UPDATE ON user_application_lors
    FOR EACH ROW EXECUTE FUNCTION update_lor_updated_at();

-- Progress calculation triggers
CREATE TRIGGER update_progress_on_essay_change
    AFTER INSERT OR UPDATE OR DELETE ON user_application_essays
    FOR EACH ROW EXECUTE FUNCTION calculate_application_progress();

CREATE TRIGGER update_progress_on_lor_change
    AFTER INSERT OR UPDATE OR DELETE ON user_application_lors
    FOR EACH ROW EXECUTE FUNCTION calculate_application_progress();

-- ===================================================
-- 7. CREATE DASHBOARD VIEW
-- ===================================================

CREATE OR REPLACE VIEW application_dashboard_view AS
SELECT 
    uap.id as progress_id,
    uap.user_id,
    uap.mba_school_id,
    ms.school_name,
    ms.business_school,
    ms.location_city,
    ms.location_country,
    uap.application_status,
    uap.overall_completion_percentage,
    uap.essays_completion_percentage,
    uap.lors_completion_percentage,
    uap.notes,
    uap.priority_level,
    uap.created_at,
    uap.updated_at,
    
    -- Essay counts
    COALESCE(essay_stats.total_essays, 0) as total_essays,
    COALESCE(essay_stats.completed_essays, 0) as completed_essays,
    COALESCE(essay_stats.draft_essays, 0) as draft_essays,
    
    -- LOR counts
    COALESCE(lor_stats.total_lors, 0) as total_lors,
    COALESCE(lor_stats.completed_lors, 0) as completed_lors,
    COALESCE(lor_stats.pending_lors, 0) as pending_lors
    
FROM user_application_progress uap
LEFT JOIN mba_schools ms ON uap.mba_school_id = ms.id
LEFT JOIN (
    SELECT 
        application_progress_id,
        COUNT(*) as total_essays,
        COUNT(*) FILTER (WHERE status IN ('final', 'submitted')) as completed_essays,
        COUNT(*) FILTER (WHERE status = 'draft') as draft_essays
    FROM user_application_essays 
    GROUP BY application_progress_id
) essay_stats ON uap.id = essay_stats.application_progress_id
LEFT JOIN (
    SELECT 
        application_progress_id,
        COUNT(*) as total_lors,
        COUNT(*) FILTER (WHERE status IN ('completed', 'submitted_to_school')) as completed_lors,
        COUNT(*) FILTER (WHERE status IN ('pending_request', 'request_sent', 'agreed', 'in_progress')) as pending_lors
    FROM user_application_lors 
    GROUP BY application_progress_id
) lor_stats ON uap.id = lor_stats.application_progress_id;

-- ===================================================
-- 8. GRANT PERMISSIONS
-- ===================================================

GRANT ALL ON user_application_progress TO authenticated;
GRANT ALL ON user_application_essays TO authenticated;
GRANT ALL ON user_application_lors TO authenticated;
GRANT SELECT ON application_dashboard_view TO authenticated;

-- ===================================================
-- SETUP COMPLETE!
-- Your MBA Application Management System is ready!
-- =================================================== 