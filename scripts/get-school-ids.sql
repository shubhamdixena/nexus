-- Query to get MBA school IDs for AI interview system migration
-- Run this to get the actual UUIDs for schools we want to use

SELECT 
    id,
    school_name,
    location,
    country
FROM mba_schools 
WHERE school_name ILIKE ANY (ARRAY[
    '%Harvard%Business%School%',
    '%Wharton%',
    '%Stanford%Graduate%School%Business%',
    '%Kellogg%'
])
ORDER BY school_name;

-- Alternative query if the above doesn't match well
SELECT 
    id,
    school_name,
    location,
    country
FROM mba_schools 
WHERE 
    school_name ILIKE '%Harvard%' OR
    school_name ILIKE '%Wharton%' OR 
    school_name ILIKE '%Stanford%' OR
    school_name ILIKE '%Kellogg%'
ORDER BY school_name;
