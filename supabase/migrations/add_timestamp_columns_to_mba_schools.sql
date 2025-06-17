-- Add timestamp columns to mba_schools table
ALTER TABLE mba_schools 
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_mba_schools_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_mba_schools_timestamp ON mba_schools;
CREATE TRIGGER trigger_update_mba_schools_timestamp
BEFORE UPDATE ON mba_schools
FOR EACH ROW
EXECUTE FUNCTION update_mba_schools_updated_at();

-- Add comments for clarity
COMMENT ON COLUMN mba_schools.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN mba_schools.updated_at IS 'Timestamp when the record was last updated'; 