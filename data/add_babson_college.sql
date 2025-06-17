-- SQL to add Babson College MBA data
-- This can be executed directly in the Supabase SQL Editor

-- Check if Babson College already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.mba_schools 
        WHERE name ILIKE '%Babson College%' OR business_school ILIKE '%Olin Graduate School%'
    ) THEN
        -- Insert the new record
        INSERT INTO public.mba_schools (
            name,
            business_school,
            location,
            country,
            type,
            status,
            core_curriculum,
            program_duration,
            credits_required,
            key_features,
            created_at,
            updated_at
        ) VALUES (
            'Babson College, F.W. Olin Graduate School of Business',
            'F.W. Olin Graduate School of Business',
            'Wellesley, Massachusetts',
            'USA',
            'Full-time MBA',
            'active',
            '15 credits via nine core courses including Strategy, Business Analytics, Finance, Entrepreneurship, Managing People & Organizations, Financial Reporting.',
            'One-year (12 months) or two-year (21 months) options; Online MBA 3-4 years',
            '45 credits',
            '#1 MBA for Entrepreneurship for 32 consecutive years, Babson Consulting Experience, Real-world learning with 80+ partner organizations',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Babson College MBA data added successfully';
    ELSE
        RAISE NOTICE 'Babson College already exists in the database, skipping insertion';
    END IF;
END $$; 