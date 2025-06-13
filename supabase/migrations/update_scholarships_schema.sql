-- Update scholarships table to match the new data structure
-- First, let's add the new columns needed

ALTER TABLE scholarships 
ADD COLUMN IF NOT EXISTS host_organization text,
ADD COLUMN IF NOT EXISTS level_of_study text,
ADD COLUMN IF NOT EXISTS latest_deadline text,
ADD COLUMN IF NOT EXISTS eligibility_criteria text,
ADD COLUMN IF NOT EXISTS benefits text,
ADD COLUMN IF NOT EXISTS is_fully_funded text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS external_id integer;

-- Update existing columns to be more flexible
ALTER TABLE scholarships 
ALTER COLUMN amount DROP NOT NULL,
ALTER COLUMN deadline DROP NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_scholarships_country ON scholarships(country);
CREATE INDEX IF NOT EXISTS idx_scholarships_level ON scholarships(level_of_study);
CREATE INDEX IF NOT EXISTS idx_scholarships_fully_funded ON scholarships(is_fully_funded);
CREATE INDEX IF NOT EXISTS idx_scholarships_external_id ON scholarships(external_id);

-- Add a function to clean HTML tags from text
CREATE OR REPLACE FUNCTION clean_html_tags(input_text text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
    IF input_text IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Replace common HTML entities and tags
    RETURN regexp_replace(
        regexp_replace(
            regexp_replace(input_text, '&lt;br&gt;|&lt;br /&gt;|<br>|<br />', E'\n', 'gi'),
            '&lt;[^&gt;]*&gt;|<[^>]*>', '', 'g'
        ),
        '&amp;|&nbsp;', ' ', 'g'
    );
END;
$$;

-- Update RLS policies to include new fields
DROP POLICY IF EXISTS "Enable public read access for scholarships" ON scholarships;
CREATE POLICY "Enable public read access for scholarships" ON scholarships 
    FOR SELECT USING (true);

-- Add comments for documentation
COMMENT ON COLUMN scholarships.host_organization IS 'Organization hosting the scholarship';
COMMENT ON COLUMN scholarships.level_of_study IS 'Level of study (Masters, PhD, etc.)';
COMMENT ON COLUMN scholarships.latest_deadline IS 'Latest application deadline information';
COMMENT ON COLUMN scholarships.eligibility_criteria IS 'Detailed eligibility criteria';
COMMENT ON COLUMN scholarships.benefits IS 'Benefits and coverage details';
COMMENT ON COLUMN scholarships.is_fully_funded IS 'Whether scholarship is fully funded';
COMMENT ON COLUMN scholarships.external_id IS 'External reference ID from import source'; 