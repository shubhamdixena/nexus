-- Create separate application rounds table for detailed round-specific data
-- Migration: create_application_rounds_system.sql

-- 1. Create application_rounds table
CREATE TABLE IF NOT EXISTS application_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mba_school_id UUID NOT NULL REFERENCES mba_schools(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL CHECK (round_number >= 1 AND round_number <= 5),
    round_name VARCHAR(50) NOT NULL, -- e.g., "Round 1", "Early Decision", "Regular Decision"
    application_deadline DATE NOT NULL,
    notification_date DATE,
    deposit_deadline DATE,
    interview_period_start DATE,
    interview_period_end DATE,
    application_fee DECIMAL(10,2),
    gmat_gre_waiver_deadline DATE,
    scholarship_deadline DATE,
    early_bird_deadline DATE,
    priority_level VARCHAR(20) DEFAULT 'standard' CHECK (priority_level IN ('priority', 'standard', 'final')),
    round_description TEXT,
    special_requirements TEXT[],
    is_rolling_admission BOOLEAN DEFAULT false,
    seats_available INTEGER,
    historical_acceptance_rate DECIMAL(5,2),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique constraint to prevent duplicate rounds for same school
CREATE UNIQUE INDEX IF NOT EXISTS idx_mba_school_round_unique 
ON application_rounds(mba_school_id, round_number);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_application_rounds_deadline ON application_rounds(application_deadline);
CREATE INDEX IF NOT EXISTS idx_application_rounds_school ON application_rounds(mba_school_id);
CREATE INDEX IF NOT EXISTS idx_application_rounds_status ON application_rounds(status);

-- 2. Create class_profile_metrics table for structured class profile data
CREATE TABLE IF NOT EXISTS class_profile_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mba_school_id UUID NOT NULL REFERENCES mba_schools(id) ON DELETE CASCADE,
    
    -- Demographics
    international_percentage DECIMAL(5,2),
    women_percentage DECIMAL(5,2),
    us_minorities_percentage DECIMAL(5,2),
    underrepresented_minorities_percentage DECIMAL(5,2),
    countries_represented INTEGER,
    
    -- Academic Metrics
    mean_gmat INTEGER,
    gmat_range_low INTEGER,
    gmat_range_high INTEGER,
    mean_gre INTEGER,
    gre_range_low INTEGER,
    gre_range_high INTEGER,
    mean_gpa DECIMAL(3,2),
    gpa_range_low DECIMAL(3,2),
    gpa_range_high DECIMAL(3,2),
    
    -- Experience
    avg_work_experience_years DECIMAL(3,1),
    work_exp_range_low INTEGER,
    work_exp_range_high INTEGER,
    
    -- Industry Background
    top_industries JSONB, -- [{"industry": "Consulting", "percentage": 25}, ...]
    top_functions JSONB, -- [{"function": "Finance", "percentage": 20}, ...]
    
    -- Geographic Distribution
    geographic_distribution JSONB, -- [{"region": "North America", "percentage": 60}, ...]
    
    -- Other Metrics
    average_age DECIMAL(3,1),
    age_range_low INTEGER,
    age_range_high INTEGER,
    languages_spoken INTEGER,
    
    -- Meta
    academic_year VARCHAR(10), -- e.g., "2024-25"
    data_source VARCHAR(100),
    last_verified TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique constraint for one profile per school per academic year
CREATE UNIQUE INDEX IF NOT EXISTS idx_class_profile_school_year_unique 
ON class_profile_metrics(mba_school_id, academic_year);

-- 3. Create JSONB validation functions
CREATE OR REPLACE FUNCTION validate_application_deadlines_jsonb(deadlines JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if it's an array
    IF jsonb_typeof(deadlines) != 'array' THEN
        RETURN FALSE;
    END IF;
    
    -- Check each element has required fields
    FOR i IN 0..jsonb_array_length(deadlines) - 1 LOOP
        IF NOT (
            deadlines->i ? 'round' AND
            deadlines->i ? 'date' AND
            jsonb_typeof(deadlines->i->'round') = 'string' AND
            jsonb_typeof(deadlines->i->'date') = 'string'
        ) THEN
            RETURN FALSE;
        END IF;
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_notable_alumni_jsonb(alumni JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if it's an array
    IF jsonb_typeof(alumni) != 'array' THEN
        RETURN FALSE;
    END IF;
    
    -- Check each element has required fields
    FOR i IN 0..jsonb_array_length(alumni) - 1 LOOP
        IF NOT (
            alumni->i ? 'name' AND
            jsonb_typeof(alumni->i->'name') = 'string'
        ) THEN
            RETURN FALSE;
        END IF;
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 4. Add validation constraints to existing mba_schools table
ALTER TABLE mba_schools 
ADD CONSTRAINT validate_application_deadlines_structure 
CHECK (
    application_deadlines_structured IS NULL OR 
    validate_application_deadlines_jsonb(application_deadlines_structured)
);

ALTER TABLE mba_schools 
ADD CONSTRAINT validate_notable_alumni_structure 
CHECK (
    notable_alumni_structured IS NULL OR 
    validate_notable_alumni_jsonb(notable_alumni_structured)
);

-- 5. Create class profile parsing function
CREATE OR REPLACE FUNCTION parse_class_profile_text(profile_text TEXT, school_id UUID, year VARCHAR(10) DEFAULT '2024-25')
RETURNS UUID AS $$
DECLARE
    result_id UUID;
    international_pct DECIMAL(5,2);
    women_pct DECIMAL(5,2);
    minorities_pct DECIMAL(5,2);
    underrep_pct DECIMAL(5,2);
    countries_count INTEGER;
BEGIN
    -- Extract percentages using regex
    international_pct := (regexp_match(profile_text, '(\d+(?:\.\d+)?)%?\s*international', 'i'))[1]::DECIMAL(5,2);
    women_pct := (regexp_match(profile_text, '(\d+(?:\.\d+)?)%?\s*women', 'i'))[1]::DECIMAL(5,2);
    minorities_pct := (regexp_match(profile_text, '(\d+(?:\.\d+)?)%?\s*(?:U\.?S\.?\s*)?minorities', 'i'))[1]::DECIMAL(5,2);
    underrep_pct := (regexp_match(profile_text, '(\d+(?:\.\d+)?)%?\s*underrepresented', 'i'))[1]::DECIMAL(5,2);
    countries_count := (regexp_match(profile_text, '(\d+)\s*countries', 'i'))[1]::INTEGER;
    
    -- Insert or update the metrics
    INSERT INTO class_profile_metrics (
        mba_school_id,
        international_percentage,
        women_percentage,
        us_minorities_percentage,
        underrepresented_minorities_percentage,
        countries_represented,
        academic_year
    ) VALUES (
        school_id,
        international_pct,
        women_pct,
        minorities_pct,
        underrep_pct,
        countries_count,
        year
    )
    ON CONFLICT (mba_school_id, academic_year) 
    DO UPDATE SET
        international_percentage = EXCLUDED.international_percentage,
        women_percentage = EXCLUDED.women_percentage,
        us_minorities_percentage = EXCLUDED.us_minorities_percentage,
        underrepresented_minorities_percentage = EXCLUDED.underrepresented_minorities_percentage,
        countries_represented = EXCLUDED.countries_represented,
        updated_at = NOW()
    RETURNING id INTO result_id;
    
    RETURN result_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to migrate application deadlines to rounds table
CREATE OR REPLACE FUNCTION migrate_deadlines_to_rounds()
RETURNS INTEGER AS $$
DECLARE
    school_record RECORD;
    deadline_record JSONB;
    round_num INTEGER;
    deadlines_count INTEGER := 0;
BEGIN
    -- Loop through schools with structured deadline data
    FOR school_record IN 
        SELECT id, name, application_deadlines_structured, application_fee
        FROM mba_schools 
        WHERE application_deadlines_structured IS NOT NULL
    LOOP
        round_num := 1;
        
        -- Loop through each deadline for this school
        FOR deadline_record IN 
            SELECT * FROM jsonb_array_elements(school_record.application_deadlines_structured)
        LOOP
            INSERT INTO application_rounds (
                mba_school_id,
                round_number,
                round_name,
                application_deadline,
                application_fee
            ) VALUES (
                school_record.id,
                round_num,
                COALESCE(deadline_record->>'round', 'Round ' || round_num),
                (deadline_record->>'date')::DATE,
                CASE 
                    WHEN school_record.application_fee ~ '^\$?(\d+(?:\.\d{2})?)' 
                    THEN (regexp_match(school_record.application_fee, '^\$?(\d+(?:\.\d{2})?)')[1])::DECIMAL(10,2)
                    ELSE NULL 
                END
            )
            ON CONFLICT (mba_school_id, round_number) DO NOTHING;
            
            round_num := round_num + 1;
            deadlines_count := deadlines_count + 1;
        END LOOP;
    END LOOP;
    
    RETURN deadlines_count;
END;
$$ LANGUAGE plpgsql;

-- 7. Create function to parse all class profiles
CREATE OR REPLACE FUNCTION parse_all_class_profiles()
RETURNS INTEGER AS $$
DECLARE
    school_record RECORD;
    profiles_parsed INTEGER := 0;
BEGIN
    FOR school_record IN 
        SELECT id, class_profile 
        FROM mba_schools 
        WHERE class_profile IS NOT NULL AND class_profile != ''
    LOOP
        PERFORM parse_class_profile_text(school_record.class_profile, school_record.id);
        profiles_parsed := profiles_parsed + 1;
    END LOOP;
    
    RETURN profiles_parsed;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_application_rounds_updated_at
    BEFORE UPDATE ON application_rounds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_profile_metrics_updated_at
    BEFORE UPDATE ON class_profile_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Enable RLS (Row Level Security)
ALTER TABLE application_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_profile_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow read access to authenticated users)
CREATE POLICY "Allow read access to application_rounds" ON application_rounds
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to class_profile_metrics" ON class_profile_metrics
    FOR SELECT TO authenticated USING (true);

-- Admin policies for modification
CREATE POLICY "Allow admin full access to application_rounds" ON application_rounds
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Allow admin full access to class_profile_metrics" ON class_profile_metrics
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 10. Create helpful views
CREATE OR REPLACE VIEW mba_schools_with_rounds AS
SELECT 
    ms.*,
    json_agg(
        json_build_object(
            'round_number', ar.round_number,
            'round_name', ar.round_name,
            'application_deadline', ar.application_deadline,
            'notification_date', ar.notification_date,
            'application_fee', ar.application_fee,
            'priority_level', ar.priority_level
        ) ORDER BY ar.round_number
    ) FILTER (WHERE ar.id IS NOT NULL) as rounds
FROM mba_schools ms
LEFT JOIN application_rounds ar ON ms.id = ar.mba_school_id AND ar.status = 'active'
GROUP BY ms.id;

CREATE OR REPLACE VIEW mba_schools_with_metrics AS
SELECT 
    ms.*,
    cpm.international_percentage,
    cpm.women_percentage,
    cpm.us_minorities_percentage,
    cpm.underrepresented_minorities_percentage,
    cpm.countries_represented,
    cpm.mean_gmat as parsed_mean_gmat,
    cpm.mean_gre as parsed_mean_gre,
    cpm.mean_gpa as parsed_mean_gpa,
    cpm.avg_work_experience_years as parsed_avg_work_exp,
    cpm.top_industries,
    cpm.top_functions,
    cpm.geographic_distribution
FROM mba_schools ms
LEFT JOIN class_profile_metrics cpm ON ms.id = cpm.mba_school_id 
    AND cpm.academic_year = '2024-25';

-- Add comments for documentation
COMMENT ON TABLE application_rounds IS 'Detailed application round information for MBA schools, supporting up to 5 rounds per school';
COMMENT ON TABLE class_profile_metrics IS 'Structured class profile metrics extracted from text descriptions';
COMMENT ON FUNCTION validate_application_deadlines_jsonb IS 'Validates the structure of application deadlines JSONB data';
COMMENT ON FUNCTION validate_notable_alumni_jsonb IS 'Validates the structure of notable alumni JSONB data';
COMMENT ON FUNCTION parse_class_profile_text IS 'Extracts structured metrics from class profile text descriptions'; 