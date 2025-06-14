-- Create user activity logs table for tracking user actions
-- Migration: create_user_activity_logs.sql

CREATE TABLE IF NOT EXISTS public.user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User information
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    
    -- Activity details
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    details TEXT,
    
    -- Technical details
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_timestamp ON public.user_activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_action ON public.user_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_resource ON public.user_activity_logs(resource);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_timestamp ON public.user_activity_logs(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON public.user_activity_logs(created_at DESC);

-- Create composite index for admin queries
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_admin_search ON public.user_activity_logs(user_name, action, resource);

-- Enable Row Level Security
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_activity_logs
-- Users can view their own activity logs
CREATE POLICY "Users can view their own activity logs" ON public.user_activity_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own activity logs
CREATE POLICY "Users can insert their own activity logs" ON public.user_activity_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs" ON public.user_activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin')
        )
    );

-- Function to automatically clean up old activity logs (older than 1 year)
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM public.user_activity_logs 
    WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get activity summary for a user
CREATE OR REPLACE FUNCTION get_user_activity_summary(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE(
    total_activities BIGINT,
    unique_actions BIGINT,
    unique_resources BIGINT,
    most_common_action TEXT,
    most_common_resource TEXT,
    last_activity TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_activities,
        COUNT(DISTINCT action) as unique_actions,
        COUNT(DISTINCT resource) as unique_resources,
        (
            SELECT action 
            FROM public.user_activity_logs 
            WHERE user_id = p_user_id 
              AND created_at >= NOW() - (p_days || ' days')::INTERVAL
            GROUP BY action 
            ORDER BY COUNT(*) DESC 
            LIMIT 1
        ) as most_common_action,
        (
            SELECT resource 
            FROM public.user_activity_logs 
            WHERE user_id = p_user_id 
              AND created_at >= NOW() - (p_days || ' days')::INTERVAL
            GROUP BY resource 
            ORDER BY COUNT(*) DESC 
            LIMIT 1
        ) as most_common_resource,
        MAX(timestamp) as last_activity
    FROM public.user_activity_logs 
    WHERE user_id = p_user_id 
      AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get activity analytics for admins
CREATE OR REPLACE FUNCTION get_activity_analytics(p_days INTEGER DEFAULT 30)
RETURNS TABLE(
    total_users BIGINT,
    total_activities BIGINT,
    daily_average NUMERIC,
    top_actions JSONB,
    top_resources JSONB,
    hourly_distribution JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT user_id) as total_users,
        COUNT(*) as total_activities,
        ROUND(COUNT(*)::NUMERIC / p_days, 2) as daily_average,
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'action', action,
                    'count', count
                ) ORDER BY count DESC
            )
            FROM (
                SELECT action, COUNT(*) as count
                FROM public.user_activity_logs 
                WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
                GROUP BY action 
                ORDER BY COUNT(*) DESC 
                LIMIT 10
            ) t
        ) as top_actions,
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'resource', resource,
                    'count', count
                ) ORDER BY count DESC
            )
            FROM (
                SELECT resource, COUNT(*) as count
                FROM public.user_activity_logs 
                WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
                GROUP BY resource 
                ORDER BY COUNT(*) DESC 
                LIMIT 10
            ) t
        ) as top_resources,
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'hour', hour,
                    'count', count
                ) ORDER BY hour
            )
            FROM (
                SELECT EXTRACT(HOUR FROM timestamp) as hour, COUNT(*) as count
                FROM public.user_activity_logs 
                WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
                GROUP BY EXTRACT(HOUR FROM timestamp)
                ORDER BY EXTRACT(HOUR FROM timestamp)
            ) t
        ) as hourly_distribution
    FROM public.user_activity_logs 
    WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_activity_logs TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_activity_logs TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_activity_summary(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_activity_analytics(INTEGER) TO authenticated;

-- Insert some sample data for testing (optional)
-- This will be inserted only if there are existing users
INSERT INTO public.user_activity_logs (user_id, user_name, action, resource, details)
SELECT 
    id,
    COALESCE(raw_user_meta_data->>'name', email, 'Unknown User'),
    'System Setup',
    'Profile',
    'Initial system setup'
FROM auth.users 
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_activity_logs WHERE user_id = auth.users.id
)
LIMIT 5;

-- Comment on the table
COMMENT ON TABLE public.user_activity_logs IS 'Stores user activity logs for analytics and audit purposes';
COMMENT ON COLUMN public.user_activity_logs.user_id IS 'References the user who performed the action';
COMMENT ON COLUMN public.user_activity_logs.user_name IS 'Cached user name for display purposes';
COMMENT ON COLUMN public.user_activity_logs.action IS 'The action performed by the user';
COMMENT ON COLUMN public.user_activity_logs.resource IS 'The resource or entity the action was performed on';
COMMENT ON COLUMN public.user_activity_logs.details IS 'Additional details about the action';
COMMENT ON COLUMN public.user_activity_logs.ip_address IS 'IP address of the user when the action was performed';
COMMENT ON COLUMN public.user_activity_logs.user_agent IS 'User agent string of the browser/client';
COMMENT ON COLUMN public.user_activity_logs.timestamp IS 'When the action was performed'; 