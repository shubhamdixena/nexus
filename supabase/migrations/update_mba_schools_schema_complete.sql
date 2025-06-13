-- Complete schema update for MBA Schools to match CSV data structure
-- This migration adds all missing fields from the CSV data

-- Add missing columns to mba_schools table
ALTER TABLE mba_schools 
  ADD COLUMN IF NOT EXISTS class_size INTEGER,
  ADD COLUMN IF NOT EXISTS women_percentage DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS mean_gmat INTEGER,
  ADD COLUMN IF NOT EXISTS mean_gpa DECIMAL(3,2),
  ADD COLUMN IF NOT EXISTS avg_gre INTEGER,
  ADD COLUMN IF NOT EXISTS avg_work_exp_years DECIMAL(3,1),
  ADD COLUMN IF NOT EXISTS avg_starting_salary TEXT,
  ADD COLUMN IF NOT EXISTS application_deadlines TEXT,
  ADD COLUMN IF NOT EXISTS application_fee TEXT,
  ADD COLUMN IF NOT EXISTS gmat_gre_waiver_available BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS class_profile TEXT,
  ADD COLUMN IF NOT EXISTS admissions_rounds TEXT,
  ADD COLUMN IF NOT EXISTS qs_mba_rank INTEGER,
  ADD COLUMN IF NOT EXISTS ft_global_mba_rank INTEGER,
  ADD COLUMN IF NOT EXISTS bloomberg_mba_rank INTEGER,
  ADD COLUMN IF NOT EXISTS employment_in_3_months_percent DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS weighted_salary TEXT,
  ADD COLUMN IF NOT EXISTS top_hiring_companies TEXT,
  ADD COLUMN IF NOT EXISTS alumni_network_strength TEXT,
  ADD COLUMN IF NOT EXISTS notable_alumni TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_mba_schools_mean_gmat ON mba_schools(mean_gmat);
CREATE INDEX IF NOT EXISTS idx_mba_schools_mean_gpa ON mba_schools(mean_gpa);
CREATE INDEX IF NOT EXISTS idx_mba_schools_avg_gre ON mba_schools(avg_gre);
CREATE INDEX IF NOT EXISTS idx_mba_schools_qs_rank ON mba_schools(qs_mba_rank);
CREATE INDEX IF NOT EXISTS idx_mba_schools_ft_rank ON mba_schools(ft_global_mba_rank);
CREATE INDEX IF NOT EXISTS idx_mba_schools_bloomberg_rank ON mba_schools(bloomberg_mba_rank);
CREATE INDEX IF NOT EXISTS idx_mba_schools_employment_rate ON mba_schools(employment_in_3_months_percent);
CREATE INDEX IF NOT EXISTS idx_mba_schools_women_percentage ON mba_schools(women_percentage);
CREATE INDEX IF NOT EXISTS idx_mba_schools_class_size ON mba_schools(class_size);

-- Add comments for clarity
COMMENT ON COLUMN mba_schools.class_size IS 'Number of students in the MBA program cohort';
COMMENT ON COLUMN mba_schools.women_percentage IS 'Percentage of women in the program';
COMMENT ON COLUMN mba_schools.mean_gmat IS 'Average GMAT score of admitted students';
COMMENT ON COLUMN mba_schools.mean_gpa IS 'Average GPA of admitted students';
COMMENT ON COLUMN mba_schools.avg_gre IS 'Average GRE score of admitted students';
COMMENT ON COLUMN mba_schools.avg_work_exp_years IS 'Average years of work experience';
COMMENT ON COLUMN mba_schools.avg_starting_salary IS 'Average starting salary after graduation';
COMMENT ON COLUMN mba_schools.application_deadlines IS 'Application deadlines for different rounds';
COMMENT ON COLUMN mba_schools.application_fee IS 'Application fee amount';
COMMENT ON COLUMN mba_schools.gmat_gre_waiver_available IS 'Whether GMAT/GRE waiver is available';
COMMENT ON COLUMN mba_schools.class_profile IS 'Description of the student class profile';
COMMENT ON COLUMN mba_schools.admissions_rounds IS 'Information about admission rounds';
COMMENT ON COLUMN mba_schools.qs_mba_rank IS 'QS MBA ranking';
COMMENT ON COLUMN mba_schools.ft_global_mba_rank IS 'Financial Times Global MBA ranking';
COMMENT ON COLUMN mba_schools.bloomberg_mba_rank IS 'Bloomberg MBA ranking';
COMMENT ON COLUMN mba_schools.employment_in_3_months_percent IS 'Percentage employed within 3 months';
COMMENT ON COLUMN mba_schools.weighted_salary IS 'Weighted average salary';
COMMENT ON COLUMN mba_schools.top_hiring_companies IS 'List of top hiring companies';
COMMENT ON COLUMN mba_schools.alumni_network_strength IS 'Description of alumni network';
COMMENT ON COLUMN mba_schools.notable_alumni IS 'List of notable alumni';

-- Enable real-time for the table (if not already enabled)
ALTER PUBLICATION supabase_realtime ADD TABLE mba_schools;

-- Update the table comment
COMMENT ON TABLE mba_schools IS 'Comprehensive MBA school data with detailed program information, rankings, and admission statistics'; 