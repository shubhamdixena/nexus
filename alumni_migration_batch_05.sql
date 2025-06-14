INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'John Cassaday' as name,
    'Former CEO, Corus Entertainment' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Toronto, Rotman School of Management (Toronto / Rotman)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Kevin O’Leary' as name,
    'Investor & TV Personality' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Toronto, Rotman School of Management (Toronto / Rotman)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Roger Martin' as name,
    'Former Dean, Rotman School' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Toronto, Rotman School of Management (Toronto / Rotman)'
ON CONFLICT DO NOTHING;