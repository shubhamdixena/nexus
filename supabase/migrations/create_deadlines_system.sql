-- Create deadlines table for user-specific important dates
CREATE TABLE IF NOT EXISTS public.deadlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    deadline_type VARCHAR(50) NOT NULL CHECK (deadline_type IN ('application', 'scholarship', 'test', 'reminder', 'interview')),
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    deadline_date DATE NOT NULL,
    notes TEXT,
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    
    -- Auto-population source tracking
    source_type VARCHAR(50) CHECK (source_type IN ('manual', 'school_bookmark', 'scholarship_save', 'auto_test')),
    source_id UUID, -- Reference to school, scholarship, etc.
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Indexes for performance
    CONSTRAINT deadlines_user_date_idx UNIQUE(user_id, title, deadline_date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_deadlines_user_id ON public.deadlines(user_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_date ON public.deadlines(deadline_date);
CREATE INDEX IF NOT EXISTS idx_deadlines_type ON public.deadlines(deadline_type);
CREATE INDEX IF NOT EXISTS idx_deadlines_completed ON public.deadlines(completed);
CREATE INDEX IF NOT EXISTS idx_deadlines_source ON public.deadlines(source_type, source_id);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_deadlines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    -- Auto-set completed_at when marked as completed
    IF NEW.completed = true AND OLD.completed = false THEN
        NEW.completed_at = now();
    ELSIF NEW.completed = false AND OLD.completed = true THEN
        NEW.completed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating timestamps
DROP TRIGGER IF EXISTS trigger_update_deadlines_updated_at ON public.deadlines;
CREATE TRIGGER trigger_update_deadlines_updated_at
    BEFORE UPDATE ON public.deadlines
    FOR EACH ROW
    EXECUTE FUNCTION update_deadlines_updated_at();

-- Create auto-population tracking table
CREATE TABLE IF NOT EXISTS public.deadline_auto_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_type VARCHAR(50) NOT NULL,
    source_id UUID NOT NULL,
    import_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    deadlines_created INTEGER NOT NULL DEFAULT 0,
    
    CONSTRAINT unique_auto_import UNIQUE(user_id, source_type, source_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deadline_auto_imports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for deadlines
CREATE POLICY "Users can view their own deadlines" ON public.deadlines
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deadlines" ON public.deadlines
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deadlines" ON public.deadlines
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deadlines" ON public.deadlines
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for auto-imports
CREATE POLICY "Users can view their own auto-imports" ON public.deadline_auto_imports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own auto-imports" ON public.deadline_auto_imports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert some predefined test dates that all users can see
INSERT INTO public.deadlines (id, user_id, title, deadline_type, priority, deadline_date, notes, source_type) 
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', '00000000-0000-0000-0000-000000000000', 'GMAT Test Registration Opens', 'test', 'medium', '2024-08-01', 'Registration typically opens 6 months in advance', 'auto_test'),
    ('550e8400-e29b-41d4-a716-446655440002', '00000000-0000-0000-0000-000000000000', 'GRE Test Available Year-Round', 'test', 'low', '2024-12-31', 'GRE can be taken year-round, plan 2-3 months before applications', 'auto_test'),
    ('550e8400-e29b-41d4-a716-446655440003', '00000000-0000-0000-0000-000000000000', 'TOEFL Test Registration', 'test', 'medium', '2024-09-01', 'TOEFL available year-round, register 2-4 weeks in advance', 'auto_test')
ON CONFLICT (user_id, title, deadline_date) DO NOTHING;

-- Create function to auto-populate deadlines from school bookmarks
CREATE OR REPLACE FUNCTION auto_populate_school_deadlines(
    p_user_id UUID,
    p_school_id UUID,
    p_school_name TEXT
)
RETURNS INTEGER AS $$
DECLARE
    deadlines_added INTEGER := 0;
    import_record_id UUID;
    current_year INTEGER;
    next_year INTEGER;
    app_deadline DATE;
    scholarship_deadline DATE;
    interview_deadline DATE;
BEGIN
    -- Check if we've already imported for this school
    SELECT id INTO import_record_id 
    FROM public.deadline_auto_imports 
    WHERE user_id = p_user_id 
      AND source_type = 'school_bookmark' 
      AND source_id = p_school_id;
    
    IF import_record_id IS NOT NULL THEN
        RETURN 0; -- Already imported
    END IF;
    
    -- Calculate appropriate deadlines based on current date
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    next_year := current_year + 1;
    
    -- If we're past October, target next year's application cycle
    IF EXTRACT(MONTH FROM CURRENT_DATE) >= 10 THEN
        app_deadline := (next_year || '-01-15')::DATE;  -- January 15th next year
        scholarship_deadline := (next_year || '-01-01')::DATE;  -- January 1st next year
        interview_deadline := (next_year || '-03-15')::DATE;  -- March 15th next year
    ELSE
        app_deadline := (current_year || '-12-15')::DATE;  -- December 15th this year
        scholarship_deadline := (current_year || '-12-01')::DATE;  -- December 1st this year
        interview_deadline := (next_year || '-02-15')::DATE;  -- February 15th next year
    END IF;
    
    -- Add common application deadlines (these would be customized per school in real implementation)
    INSERT INTO public.deadlines (user_id, title, deadline_type, priority, deadline_date, notes, source_type, source_id)
    VALUES
        (p_user_id, p_school_name || ' - Application Deadline', 'application', 'high', app_deadline, 'Complete application package due', 'school_bookmark', p_school_id),
        (p_user_id, p_school_name || ' - Scholarship Application', 'scholarship', 'medium', scholarship_deadline, 'Merit-based scholarship application', 'school_bookmark', p_school_id),
        (p_user_id, p_school_name || ' - Interview Preparation', 'interview', 'medium', interview_deadline, 'Prepare for potential interviews', 'school_bookmark', p_school_id)
    ON CONFLICT (user_id, title, deadline_date) DO NOTHING;
    
    GET DIAGNOSTICS deadlines_added = ROW_COUNT;
    
    -- Record the import
    INSERT INTO public.deadline_auto_imports (user_id, source_type, source_id, deadlines_created)
    VALUES (p_user_id, 'school_bookmark', p_school_id, deadlines_added)
    ON CONFLICT (user_id, source_type, source_id) DO UPDATE SET
        deadlines_created = deadlines_created + EXCLUDED.deadlines_created,
        import_date = now();
    
    RETURN deadlines_added;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to auto-populate deadlines from scholarship saves
CREATE OR REPLACE FUNCTION auto_populate_scholarship_deadlines(
    p_user_id UUID,
    p_scholarship_id UUID,
    p_scholarship_name TEXT,
    p_deadline_date DATE DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    deadlines_added INTEGER := 0;
    actual_deadline_date DATE;
    current_year INTEGER;
    next_year INTEGER;
BEGIN
    -- Calculate appropriate deadline based on current date
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    next_year := current_year + 1;
    
    -- Use provided deadline or calculate smart default
    IF p_deadline_date IS NOT NULL THEN
        actual_deadline_date := p_deadline_date;
    ELSE
        -- If we're past October, target next year's deadline cycle
        IF EXTRACT(MONTH FROM CURRENT_DATE) >= 10 THEN
            actual_deadline_date := (next_year || '-03-31')::DATE;  -- March 31st next year
        ELSE
            actual_deadline_date := (current_year || '-12-31')::DATE;  -- December 31st this year
        END IF;
    END IF;
    
    -- Check if we've already imported for this scholarship
    IF EXISTS (
        SELECT 1 FROM public.deadline_auto_imports 
        WHERE user_id = p_user_id 
          AND source_type = 'scholarship_save' 
          AND source_id = p_scholarship_id
    ) THEN
        RETURN 0; -- Already imported
    END IF;
    
    -- Add scholarship deadline
    INSERT INTO public.deadlines (user_id, title, deadline_type, priority, deadline_date, notes, source_type, source_id)
    VALUES (p_user_id, p_scholarship_name || ' - Application Due', 'scholarship', 'high', actual_deadline_date, 'Scholarship application deadline', 'scholarship_save', p_scholarship_id)
    ON CONFLICT (user_id, title, deadline_date) DO NOTHING;
    
    GET DIAGNOSTICS deadlines_added = ROW_COUNT;
    
    -- Record the import
    INSERT INTO public.deadline_auto_imports (user_id, source_type, source_id, deadlines_created)
    VALUES (p_user_id, 'scholarship_save', p_scholarship_id, deadlines_added)
    ON CONFLICT (user_id, source_type, source_id) DO UPDATE SET
        deadlines_created = deadlines_created + EXCLUDED.deadlines_created,
        import_date = now();
    
    RETURN deadlines_added;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.deadlines TO authenticated;
GRANT ALL ON public.deadline_auto_imports TO authenticated;
GRANT EXECUTE ON FUNCTION auto_populate_school_deadlines TO authenticated;
GRANT EXECUTE ON FUNCTION auto_populate_scholarship_deadlines TO authenticated; 