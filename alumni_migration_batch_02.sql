INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'George W. Bush' as name,
    'Former U.S. President' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Harvard University, Harvard Business School (Harvard / HBS)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Jamie Dimon' as name,
    'CEO, JPMorgan Chase' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Harvard University, Harvard Business School (Harvard / HBS)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Sonny Perdue' as name,
    'Former U.S. Secretary of Agriculture' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Georgia, Terry College of Business (UGA / Terry)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Alton Brown' as name,
    'TV Personality & Entrepreneur' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Georgia, Terry College of Business (UGA / Terry)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Michael Adams' as name,
    'Former President, University of Georgia' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Georgia, Terry College of Business (UGA / Terry)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Dan Amos' as name,
    'CEO, Aflac' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Georgia, Terry College of Business (UGA / Terry)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Chris Klaus' as name,
    'Founder, ISS' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Georgia Institute of Technology, Scheller College of Business (Georgia Tech / Scheller)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'David Dorman' as name,
    'Former CEO, AT&T' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Georgia Institute of Technology, Scheller College of Business (Georgia Tech / Scheller)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Mike Duke' as name,
    'Former CEO, Walmart' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Georgia Institute of Technology, Scheller College of Business (Georgia Tech / Scheller)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'John F. Brock' as name,
    'Former CEO, Coca-Cola Enterprises' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Georgia Institute of Technology, Scheller College of Business (Georgia Tech / Scheller)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Mark Cuban' as name,
    'Entrepreneur & Investor' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Indiana University Bloomington, Kelley School of Business (Indiana / Kelley)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'John Chambers' as name,
    'Former CEO, Cisco' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Indiana University Bloomington, Kelley School of Business (Indiana / Kelley)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Scott Dorsey' as name,
    'Co-founder, ExactTarget' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Indiana University Bloomington, Kelley School of Business (Indiana / Kelley)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Harold Arthur Poling' as name,
    'Former CEO, Ford Motor Company' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Indiana University Bloomington, Kelley School of Business (Indiana / Kelley)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Michael Bloomberg' as name,
    'Founder, Bloomberg LP' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Johns Hopkins University, Carey Business School (Johns Hopkins / Carey)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Wes Unseld Jr.' as name,
    'NBA Coach' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Johns Hopkins University, Carey Business School (Johns Hopkins / Carey)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Brian Rogers' as name,
    'Former Chairman, T. Rowe Price' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Johns Hopkins University, Carey Business School (Johns Hopkins / Carey)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ronald J. Daniels' as name,
    'President, Johns Hopkins University' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Johns Hopkins University, Carey Business School (Johns Hopkins / Carey)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Donald Trump Jr.' as name,
    'Executive VP, Trump Organization' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Pennsylvania, Lauder Institute of Management & International Studies (Penn / Lauder)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ivanka Trump' as name,
    'Former Advisor to U.S. President' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Pennsylvania, Lauder Institute of Management & International Studies (Penn / Lauder)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Alex Gorsky' as name,
    'Former CEO, Johnson & Johnson' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Pennsylvania, Lauder Institute of Management & International Studies (Penn / Lauder)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Elon Musk' as name,
    'CEO, Tesla & SpaceX' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Pennsylvania, Lauder Institute of Management & International Studies (Penn / Lauder)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Kevin Plank' as name,
    'Founder, Under Armour' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Maryland, Robert H. Smith School of Business (Maryland / Smith)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Larry Hogan' as name,
    'Former Governor, Maryland' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Maryland, Robert H. Smith School of Business (Maryland / Smith)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Barry Gossett' as name,
    'CEO, Acton Mobile' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Maryland, Robert H. Smith School of Business (Maryland / Smith)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Stephen M. Ross' as name,
    'Real Estate Developer' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Michigan, Ross School of Business (Michigan / Ross)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'John DeLorean' as name,
    'Automotive Engineer' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Michigan, Ross School of Business (Michigan / Ross)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Larry Page' as name,
    'Co-founder, Google' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Michigan, Ross School of Business (Michigan / Ross)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Dan Gilbert' as name,
    'Owner, Cleveland Cavaliers' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Michigan State University, Broad College of Business (Michigan State / Broad)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Eli Broad' as name,
    'Philanthropist & Businessman' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Michigan State University, Broad College of Business (Michigan State / Broad)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Robert Stempel' as name,
    'Former CEO, General Motors' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Michigan State University, Broad College of Business (Michigan State / Broad)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Richard Schulze' as name,
    'Founder, Best Buy' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Minnesota, Carlson School of Management (Minnesota / Carlson)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Marilyn Carlson Nelson' as name,
    'Former CEO, Carlson Companies' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Minnesota, Carlson School of Management (Minnesota / Carlson)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'William Norris' as name,
    'Founder, Control Data Corporation' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Minnesota, Carlson School of Management (Minnesota / Carlson)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Bill Ford' as name,
    'Executive Chairman, Ford Motor Company' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'MIT Sloan School of Management (MIT / Sloan)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Carly Fiorina' as name,
    'Former CEO, HP' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'MIT Sloan School of Management (MIT / Sloan)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Benjamin Netanyahu' as name,
    'Prime Minister, Israel' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'MIT Sloan School of Management (MIT / Sloan)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ted Phillips' as name,
    'CEO, Chicago Bears' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Northwestern University, Kellogg School of Management (Northwestern / Kellogg)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Arthur Martinez' as name,
    'Former CEO, Sears' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Northwestern University, Kellogg School of Management (Northwestern / Kellogg)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Susan E. Arnold' as name,
    'Former Chair, Disney' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Northwestern University, Kellogg School of Management (Northwestern / Kellogg)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Joe Kernan' as name,
    'Former Governor, Indiana' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Notre Dame, Mendoza College of Business (Notre Dame / Mendoza)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Regis Philbin' as name,
    'TV Host' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Notre Dame, Mendoza College of Business (Notre Dame / Mendoza)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Condoleezza Rice' as name,
    'Former U.S. Secretary of State' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Notre Dame, Mendoza College of Business (Notre Dame / Mendoza)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Henry Kravis' as name,
    'Co-founder, KKR' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'New York University, Stern School of Business (NYU / Stern)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Alan Greenspan' as name,
    'Former Chairman, Federal Reserve' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'New York University, Stern School of Business (NYU / Stern)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Richard S. Fuld Jr.' as name,
    'Former CEO, Lehman Brothers' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'New York University, Stern School of Business (NYU / Stern)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Les Wexner' as name,
    'Founder, L Brands' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Ohio State University, Fisher College of Business (Ohio State / Fisher)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Chris Spielman' as name,
    'NFL Analyst & Former Player' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Ohio State University, Fisher College of Business (Ohio State / Fisher)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Jim Tressel' as name,
    'Former Ohio State Football Coach' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Ohio State University, Fisher College of Business (Ohio State / Fisher)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'John Doerr' as name,
    'Venture Capitalist, Kleiner Perkins' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Rice University, Jones Graduate School of Business (Rice / Jones)'
ON CONFLICT DO NOTHING;