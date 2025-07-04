-- Create data correction reports system
-- This allows users to report inaccurate data and suggest corrections

-- Table to store correction requests from users
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_data_corrections_reporter ON public.data_correction_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_data_corrections_status ON public.data_correction_reports(status);
CREATE INDEX IF NOT EXISTS idx_data_corrections_data_type ON public.data_correction_reports(data_type);
CREATE INDEX IF NOT EXISTS idx_data_corrections_priority ON public.data_correction_reports(priority);
CREATE INDEX IF NOT EXISTS idx_data_corrections_date ON public.data_correction_reports(created_at);

-- Table to track which data fields are frequently reported (for system improvement)
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

-- Table for admin workflow and approval history
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_data_corrections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating timestamps
DROP TRIGGER IF EXISTS trigger_update_data_corrections_updated_at ON public.data_correction_reports;
CREATE TRIGGER trigger_update_data_corrections_updated_at
    BEFORE UPDATE ON public.data_correction_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_data_corrections_updated_at();

-- Function to log status changes
CREATE OR REPLACE FUNCTION log_correction_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.data_correction_history (
            correction_id, action, performed_by, notes, old_status, new_status
        ) VALUES (
            NEW.id, NEW.status, COALESCE(NEW.reviewed_by, NEW.reporter_id), 
            NEW.admin_notes, OLD.status, NEW.status
        );
        
        -- Update reviewed timestamp if status changed and reviewed_by is set
        IF NEW.reviewed_by IS NOT NULL AND NEW.status != 'pending' THEN
            NEW.reviewed_at = now();
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status change logging
DROP TRIGGER IF EXISTS trigger_log_correction_status_change ON public.data_correction_reports;
CREATE TRIGGER trigger_log_correction_status_change
    BEFORE UPDATE ON public.data_correction_reports
    FOR EACH ROW
    EXECUTE FUNCTION log_correction_status_change();

-- Function to update analytics when new reports are created
CREATE OR REPLACE FUNCTION update_correction_analytics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.data_correction_analytics (
        data_type, data_table, field_name, issue_type, report_count, last_reported
    ) VALUES (
        NEW.data_type, NEW.data_table, NEW.field_name, NEW.issue_type, 1, NEW.created_at
    )
    ON CONFLICT (data_type, data_table, field_name, issue_type)
    DO UPDATE SET 
        report_count = data_correction_analytics.report_count + 1,
        last_reported = NEW.created_at;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for analytics updates
DROP TRIGGER IF EXISTS trigger_update_correction_analytics ON public.data_correction_reports;
CREATE TRIGGER trigger_update_correction_analytics
    AFTER INSERT ON public.data_correction_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_correction_analytics();

-- Enable Row Level Security
ALTER TABLE public.data_correction_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_correction_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_correction_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for data_correction_reports
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
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin')
        )
    );

-- Admins can update all reports
CREATE POLICY "Admins can update correction reports" ON public.data_correction_reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin')
        )
    );

-- RLS Policies for analytics (admin only)
CREATE POLICY "Admins can view correction analytics" ON public.data_correction_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin')
        )
    );

-- RLS Policies for history
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
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin')
        )
    );

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.data_correction_reports TO authenticated;
GRANT ALL ON public.data_correction_analytics TO authenticated;
GRANT ALL ON public.data_correction_history TO authenticated;
GRANT EXECUTE ON FUNCTION update_data_corrections_updated_at TO authenticated;
GRANT EXECUTE ON FUNCTION log_correction_status_change TO authenticated;
GRANT EXECUTE ON FUNCTION update_correction_analytics TO authenticated; 