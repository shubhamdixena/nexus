INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Bobby Tudor' as name,
    'Founder, Tudor, Pickering, Holt & Co.' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Rice University, Jones Graduate School of Business (Rice / Jones)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Jim Hackett' as name,
    'Former CEO, Ford Motor Company' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Rice University, Jones Graduate School of Business (Rice / Jones)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Chuck Zegar' as name,
    'Co-founder, Bloomberg LP' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Rochester, Simon Business School (Rochester / Simon)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Richard B. Handler' as name,
    'CEO, Jefferies' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Rochester, Simon Business School (Rochester / Simon)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Antonio Pérez' as name,
    'Former CEO, Kodak' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Rochester, Simon Business School (Rochester / Simon)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Gerald J. Ford' as name,
    'Billionaire Banker' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Southern Methodist University, Cox School of Business (SMU / Cox)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Lamar Hunt' as name,
    'Founder, American Football League' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Southern Methodist University, Cox School of Business (SMU / Cox)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ray L. Hunt' as name,
    'CEO, Hunt Oil Company' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Southern Methodist University, Cox School of Business (SMU / Cox)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Elon Musk' as name,
    'CEO, Tesla & SpaceX' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Stanford Graduate School of Business (Stanford)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Phil Knight' as name,
    'Founder, Nike' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Stanford Graduate School of Business (Stanford)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Mary Barra' as name,
    'CEO, General Motors' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Stanford Graduate School of Business (Stanford)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Sundar Pichai' as name,
    'CEO, Google' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Stanford Graduate School of Business (Stanford)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Paul Merage' as name,
    'Founder, Hot Pockets' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of California, Irvine, Paul Merage School of Business (UC Irvine / Merage)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Kelly Coffey' as name,
    'CEO, City National Bank' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of California, Irvine, Paul Merage School of Business (UC Irvine / Merage)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Scott Boras' as name,
    'Sports Agent' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of California, Irvine, Paul Merage School of Business (UC Irvine / Merage)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Susan Wojcicki' as name,
    'Former CEO, YouTube' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of California, Los Angeles, Anderson School of Management (UCLA / Anderson)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Larry Fink' as name,
    'CEO, BlackRock' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of California, Los Angeles, Anderson School of Management (UCLA / Anderson)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Bill Gross' as name,
    'Founder, Idealab' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of California, Los Angeles, Anderson School of Management (UCLA / Anderson)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Julian Robertson' as name,
    'Founder, Tiger Management' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of North Carolina at Chapel Hill, Kenan–Flagler Business School (UNC / Kenan-Flagler)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Jason Kilar' as name,
    'Former CEO, Hulu' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of North Carolina at Chapel Hill, Kenan–Flagler Business School (UNC / Kenan-Flagler)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'John Swofford' as name,
    'Former Commissioner, ACC' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of North Carolina at Chapel Hill, Kenan–Flagler Business School (UNC / Kenan-Flagler)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Donald Trump' as name,
    'Former U.S. President' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Pennsylvania, Wharton School (Penn / Wharton)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Elon Musk' as name,
    'CEO, Tesla & SpaceX' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Pennsylvania, Wharton School (Penn / Wharton)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Warren Buffett' as name,
    'CEO, Berkshire Hathaway' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Pennsylvania, Wharton School (Penn / Wharton)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ivanka Trump' as name,
    'Former Advisor to U.S. President' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Pennsylvania, Wharton School (Penn / Wharton)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Marc Benioff' as name,
    'CEO, Salesforce' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Southern California, Marshall School of Business (USC / Marshall)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'George Lucas' as name,
    'Creator, Star Wars' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Southern California, Marshall School of Business (USC / Marshall)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Shonda Rhimes' as name,
    'TV Producer, Grey’s Anatomy' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Southern California, Marshall School of Business (USC / Marshall)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Rex Tillerson' as name,
    'Former U.S. Secretary of State' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Texas at Austin, McCombs School of Business (UT Austin / McCombs)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Michael Dell' as name,
    'Founder, Dell Technologies' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Texas at Austin, McCombs School of Business (UT Austin / McCombs)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Gary Kelly' as name,
    'CEO, Southwest Airlines' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Texas at Austin, McCombs School of Business (UT Austin / McCombs)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'John D. Arnold' as name,
    'Billionaire Investor' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Virginia, Darden School of Business (UVA / Darden)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Peter Kiernan' as name,
    'Former Partner, Goldman Sachs' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Virginia, Darden School of Business (UVA / Darden)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Frank Batten' as name,
    'Founder, Weather Channel' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Virginia, Darden School of Business (UVA / Darden)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'William H. Macy' as name,
    'Actor' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Vanderbilt University, Owen Graduate School of Management (Vanderbilt / Owen)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Lamar Alexander' as name,
    'Former U.S. Senator' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Vanderbilt University, Owen Graduate School of Management (Vanderbilt / Owen)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'John Ingram' as name,
    'Chairman, Ingram Industries' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Vanderbilt University, Owen Graduate School of Management (Vanderbilt / Owen)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'David Bonderman' as name,
    'Founder, TPG Capital' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Washington, Foster School of Business (UW / Foster)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Orin Smith' as name,
    'Former CEO, Starbucks' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Washington, Foster School of Business (UW / Foster)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Tom Alberg' as name,
    'Co-founder, Madrona Venture Group' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Washington, Foster School of Business (UW / Foster)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Andrew C. Taylor' as name,
    'Executive Chairman, Enterprise Holdings' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Washington University in St. Louis, Olin Business School (WashU / Olin)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'John Bachmann' as name,
    'Former Managing Partner, Edward Jones' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Washington University in St. Louis, Olin Business School (WashU / Olin)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Maxine Clark' as name,
    'Founder, Build-A-Bear Workshop' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Washington University in St. Louis, Olin Business School (WashU / Olin)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Indra Nooyi' as name,
    'Former CEO, PepsiCo' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Yale University, School of Management (Yale / SOM)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Janet Yellen' as name,
    'U.S. Secretary of the Treasury' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Yale University, School of Management (Yale / SOM)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Tim Geithner' as name,
    'Former U.S. Treasury Secretary' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Yale University, School of Management (Yale / SOM)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Richard Wyatt' as name,
    'Investment Banker' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Bath, School of Management (Bath)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Amy Williams' as name,
    'Olympic Gold Medalist' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Bath, School of Management (Bath)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Nigel Sharrocks' as name,
    'Chairman, MediaCom' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Bath, School of Management (Bath)'
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
WHERE ms.name = 'University of Cambridge, Judge Business School (Cambridge / Judge)'
ON CONFLICT DO NOTHING;