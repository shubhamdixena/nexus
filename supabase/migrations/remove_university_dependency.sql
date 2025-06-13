-- Remove foreign key constraint to make Universities and MBA Schools independent
-- This allows MBA Schools to have rich, detailed data without being tied to University records

-- First, drop the foreign key constraint
ALTER TABLE mba_schools 
DROP CONSTRAINT IF EXISTS mba_schools_university_id_fkey;

-- Keep the university_id column as a simple text field for reference only (optional)
-- Or remove it entirely if not needed
-- ALTER TABLE mba_schools DROP COLUMN university_id;

-- Add comment to clarify the independence
COMMENT ON TABLE mba_schools IS 'Independent MBA schools with detailed program data. Not tied to universities table.';
COMMENT ON TABLE universities IS 'General university explorer with basic academic information. Independent of MBA schools.';

-- Update any existing policies if needed
-- (Current policies should still work since they use auth.role())

-- Ensure both tables maintain their independent RLS policies
-- No changes needed to existing policies as they are already independent 