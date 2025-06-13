-- Create bookmarks table for saving universities, MBA schools, scholarships, and SOPs
CREATE TABLE user_bookmarks (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    item_type text NOT NULL CHECK (item_type IN ('university', 'mba_school', 'scholarship', 'sop')),
    item_id uuid NOT NULL,
    notes text,
    tags text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(user_id, item_type, item_id)
);

-- Add indexes for better performance
CREATE INDEX idx_user_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX idx_user_bookmarks_item_type ON user_bookmarks(item_type);
CREATE INDEX idx_user_bookmarks_item_id ON user_bookmarks(item_id);
CREATE INDEX idx_user_bookmarks_user_item_type ON user_bookmarks(user_id, item_type);

-- Enable Row Level Security
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own bookmarks" ON user_bookmarks 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks" ON user_bookmarks 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks" ON user_bookmarks 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON user_bookmarks 
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to get bookmark counts by type for a user
CREATE OR REPLACE FUNCTION get_user_bookmark_counts(user_uuid uuid)
RETURNS TABLE(
    universities_count bigint,
    mba_schools_count bigint,
    scholarships_count bigint,
    sops_count bigint,
    total_count bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN item_type = 'university' THEN 1 ELSE 0 END), 0) as universities_count,
        COALESCE(SUM(CASE WHEN item_type = 'mba_school' THEN 1 ELSE 0 END), 0) as mba_schools_count,
        COALESCE(SUM(CASE WHEN item_type = 'scholarship' THEN 1 ELSE 0 END), 0) as scholarships_count,
        COALESCE(SUM(CASE WHEN item_type = 'sop' THEN 1 ELSE 0 END), 0) as sops_count,
        COUNT(*) as total_count
    FROM user_bookmarks 
    WHERE user_id = user_uuid;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_bookmark_counts(uuid) TO authenticated;