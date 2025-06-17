-- Safe Data Correction System Migration
-- Apply this directly to your Supabase database via the SQL Editor

-- 1. Create data correction reports table
CREATE TABLE IF NOT EXISTS public.data_correction_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User who reported the issue
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- What data is being corrected
    data_type VARCHAR(50) NOT NULL CHECK (data_type IN (
        'university', 'mba_school', 'scholarship', 'deadline', 'test_info', 'sop', 'general'
    )),
    data_id UUID, -- ID of the record being corrected (if applicable)
    data_table VARCHAR(50), -- Table name where the data exists
    
    -- Issue details
    issue_type VARCHAR(50) NOT NULL CHECK (issue_type IN (
        'incorrect_info', 'outdated_info', 'missing_info', 'broken_link', 'wrong_deadline', 'other'
    )),
    field_name VARCHAR(100), -- Specific field being corrected
    current_value TEXT, -- Current incorrect value
    suggested_value TEXT, -- User's suggested correction
    
    -- Description and evidence
    description TEXT NOT NULL,
    evidence_urls TEXT[], -- URLs to supporting evidence
    additional_notes TEXT,
    
    -- Admin workflow
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'under_review', 'approved', 'rejected', 'implemented', 'duplicate'
    )),
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN (
        'low', 'medium', 'high', 'critical'
    )),
    
    -- Admin handling
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    admin_notes TEXT,
    implementation_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_data_corrections_reporter ON public.data_correction_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_data_corrections_status ON public.data_correction_reports(status);
CREATE INDEX IF NOT EXISTS idx_data_corrections_data_type ON public.data_correction_reports(data_type);
CREATE INDEX IF NOT EXISTS idx_data_corrections_priority ON public.data_correction_reports(priority);
CREATE INDEX IF NOT EXISTS idx_data_corrections_date ON public.data_correction_reports(created_at);

-- 3. Create analytics table
CREATE TABLE IF NOT EXISTS public.data_correction_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_type VARCHAR(50) NOT NULL,
    data_table VARCHAR(50),
    field_name VARCHAR(100),
    issue_type VARCHAR(50) NOT NULL,
    report_count INTEGER NOT NULL DEFAULT 1,
    last_reported TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT unique_analytics_entry UNIQUE(data_type, data_table, field_name, issue_type)
);

-- 4. Create history table
CREATE TABLE IF NOT EXISTS public.data_correction_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correction_id UUID NOT NULL REFERENCES public.data_correction_reports(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL CHECK (action IN (
        'submitted', 'reviewed', 'approved', 'rejected', 'implemented', 'reopened'
    )),
    performed_by UUID NOT NULL REFERENCES auth.users(id),
    notes TEXT,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Enable Row Level Security
ALTER TABLE public.data_correction_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_correction_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_correction_history ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for data_correction_reports (drop existing first)
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own correction reports" ON public.data_correction_reports;
DROP POLICY IF EXISTS "Users can create correction reports" ON public.data_correction_reports;
DROP POLICY IF EXISTS "Users can update their own pending reports" ON public.data_correction_reports;
DROP POLICY IF EXISTS "Admins can view all correction reports" ON public.data_correction_reports;
DROP POLICY IF EXISTS "Admins can update correction reports" ON public.data_correction_reports;

-- Users can view their own reports
CREATE POLICY "Users can view their own correction reports" ON public.data_correction_reports
    FOR SELECT USING (auth.uid() = reporter_id);

-- Users can insert their own reports
CREATE POLICY "Users can create correction reports" ON public.data_correction_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Users can update their own pending reports
CREATE POLICY "Users can update their own pending reports" ON public.data_correction_reports
    FOR UPDATE USING (auth.uid() = reporter_id AND status = 'pending');

-- Admins can view all reports
CREATE POLICY "Admins can view all correction reports" ON public.data_correction_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Admins can update all reports
CREATE POLICY "Admins can update correction reports" ON public.data_correction_reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- 7. RLS Policies for analytics (admin only)
DROP POLICY IF EXISTS "Admins can view correction analytics" ON public.data_correction_analytics;
CREATE POLICY "Admins can view correction analytics" ON public.data_correction_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- 8. RLS Policies for history
DROP POLICY IF EXISTS "Users can view their report history" ON public.data_correction_history;
DROP POLICY IF EXISTS "Admins can view all correction history" ON public.data_correction_history;

-- Users can view history of their own reports
CREATE POLICY "Users can view their report history" ON public.data_correction_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.data_correction_reports 
            WHERE data_correction_reports.id = correction_id 
            AND data_correction_reports.reporter_id = auth.uid()
        )
    );

-- Admins can view all history
CREATE POLICY "Admins can view all correction history" ON public.data_correction_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- 9. Create trigger functions
CREATE OR REPLACE FUNCTION update_data_corrections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_data_corrections_updated_at ON public.data_correction_reports;

-- Create trigger for auto-updating timestamps
CREATE TRIGGER trigger_update_data_corrections_updated_at
    BEFORE UPDATE ON public.data_correction_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_data_corrections_updated_at();

-- 10. Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.data_correction_reports TO authenticated;
GRANT ALL ON public.data_correction_analytics TO authenticated;
GRANT ALL ON public.data_correction_history TO authenticated;

-- 11. Verify tables were created
SELECT 
    schemaname, 
    tablename, 
    tableowner 
FROM pg_tables 
WHERE tablename LIKE '%data_correction%' 
ORDER BY tablename;