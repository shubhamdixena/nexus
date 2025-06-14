INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ian Davis' as name,
    'Former Managing Director, McKinsey' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Cambridge, Judge Business School (Cambridge / Judge)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Dame Sandra Dawson' as name,
    'Former Director, Judge Business School' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Cambridge, Judge Business School (Cambridge / Judge)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Li Ming' as name,
    'Founder, Sino Biopharmaceutical' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'China Europe International Business School (CEIBS)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Zhang Ruimin' as name,
    'CEO, Haier Group' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'China Europe International Business School (CEIBS)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Chen Dongsheng' as name,
    'Founder, Taikang Insurance Group' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'China Europe International Business School (CEIBS)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Sir Tom Hunter' as name,
    'Entrepreneur & Philanthropist' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Edinburgh Business School (Edinburgh)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ian Marchant' as name,
    'Former CEO, Scottish & Southern Energy' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Edinburgh Business School (Edinburgh)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ewan McGregor' as name,
    'Actor' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Edinburgh Business School (Edinburgh)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Jean-Paul Agon' as name,
    'Former CEO, L’Oréal' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'EMLYON Business School (EMLYON)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Patrick Ponsolle' as name,
    'Former Chairman, Eurostar' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'EMLYON Business School (EMLYON)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Pierre Kosciusko-Morizet' as name,
    'Founder, PriceMinister' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'EMLYON Business School (EMLYON)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Javier Faus' as name,
    'Founder, Meridia Capital' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'ESADE Business School (ESADE)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Luis Maroto' as name,
    'CEO, Amadeus IT Group' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'ESADE Business School (ESADE)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Joaquín Duato' as name,
    'CEO, Johnson & Johnson' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'ESADE Business School (ESADE)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Patrick Cescau' as name,
    'Former CEO, Unilever' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'ESCP Business School (ESCP)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Jean-Pierre Raffarin' as name,
    'Former Prime Minister, France' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'ESCP Business School (ESCP)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Philippe Houzé' as name,
    'Chairman, Galeries Lafayette Group' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'ESCP Business School (ESCP)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Christoph Brand' as name,
    'CEO, Axpo Group' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'ESMT Berlin (ESMT)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Jörg Rocholl' as name,
    'President, ESMT Berlin' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'ESMT Berlin (ESMT)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Rolf Schrömgens' as name,
    'Co-founder, Trivago' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'ESMT Berlin (ESMT)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'François-Henri Pinault' as name,
    'CEO, Kering' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'HEC Paris (HEC)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Jean-Paul Agon' as name,
    'Former CEO, L’Oréal' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'HEC Paris (HEC)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Dominique Strauss-Kahn' as name,
    'Former IMF Managing Director' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'HEC Paris (HEC)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ángel Cano' as name,
    'Former CEO, BBVA' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'IE Business School (IE)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Rafael del Pino' as name,
    'Chairman, Ferrovial' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'IE Business School (IE)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'José María Álvarez-Pallete' as name,
    'CEO, Telefónica' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'IE Business School (IE)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Antonio Garrigues Walker' as name,
    'Chairman, Garrigues' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'IESE Business School (IESE)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Pablo Isla' as name,
    'Former CEO, Inditex' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'IESE Business School (IESE)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Luis de Guindos' as name,
    'Vice President, ECB' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'IESE Business School (IESE)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Sir Keith O’Nions' as name,
    'Former President, Imperial College' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Imperial College Business School (Imperial)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Alice Gast' as name,
    'Former President, Imperial College' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Imperial College Business School (Imperial)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'James Stirling' as name,
    'Physicist & Academic Leader' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Imperial College Business School (Imperial)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ajay Banga' as name,
    'President, World Bank' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Indian School of Business (ISB)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Shantanu Narayen' as name,
    'CEO, Adobe' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Indian School of Business (ISB)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Nikesh Arora' as name,
    'CEO, Palo Alto Networks' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Indian School of Business (ISB)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Henry Engelhardt' as name,
    'Founder, Admiral Group' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'INSEAD (INSEAD)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Tidjane Thiam' as name,
    'Former CEO, Credit Suisse' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'INSEAD (INSEAD)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ilian Mihov' as name,
    'Dean, INSEAD' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'INSEAD (INSEAD)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Sir Martin Sorrell' as name,
    'Founder, WPP' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'London Business School (LBS)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Richard Sharp' as name,
    'Former Chairman, BBC' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'London Business School (LBS)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Naguib Sawiris' as name,
    'Egyptian Business Tycoon' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'London Business School (LBS)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Sir Terry Leahy' as name,
    'Former CEO, Tesco' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Manchester, Alliance Manchester Business School (Manchester)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Andy Duncan' as name,
    'Former CEO, Channel 4' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Manchester, Alliance Manchester Business School (Manchester)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Paul Walsh' as name,
    'Former CEO, Diageo' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Manchester, Alliance Manchester Business School (Manchester)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Timothy Cook' as name,
    'CEO, Apple' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Oxford, Saïd Business School (Oxford / Saïd)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Patrick Pichette' as name,
    'Former CFO, Google' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Oxford, Saïd Business School (Oxford / Saïd)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Alexander Nix' as name,
    'Former CEO, Cambridge Analytica' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Oxford, Saïd Business School (Oxford / Saïd)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Andrea Illy' as name,
    'Chairman, Illycaffè' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'SDA Bocconi School of Management (Bocconi)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Vittorio Colao' as name,
    'Former CEO, Vodafone' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'SDA Bocconi School of Management (Bocconi)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Federico Marchetti' as name,
    'Founder, Yoox Net-a-Porter' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'SDA Bocconi School of Management (Bocconi)'
ON CONFLICT DO NOTHING;