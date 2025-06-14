INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Arthur Blank' as name,
    'Co-founder, Home Depot' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Babson College, F.W. Olin Graduate School of Business (Babson / Olin)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Roger Enrico' as name,
    'Former CEO, PepsiCo' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Babson College, F.W. Olin Graduate School of Business (Babson / Olin)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'William Green' as name,
    'Former CEO, Accenture' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Babson College, F.W. Olin Graduate School of Business (Babson / Olin)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Matt Coffin' as name,
    'Founder, LowerMyBills.com' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Babson College, F.W. Olin Graduate School of Business (Babson / Olin)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Shantanu Narayen' as name,
    'CEO, Adobe' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of California, Berkeley, Haas School of Business (UC Berkeley / Haas)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Paul Otellini' as name,
    'Former CEO, Intel' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of California, Berkeley, Haas School of Business (UC Berkeley / Haas)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Barbara Desoer' as name,
    'Former CEO, Citibank' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of California, Berkeley, Haas School of Business (UC Berkeley / Haas)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Walter Haas Jr.' as name,
    'Chairman, Levi Strauss & Co.' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of California, Berkeley, Haas School of Business (UC Berkeley / Haas)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Peter Lynch' as name,
    'Investor, Fidelity' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Boston College, Carroll School of Management (Boston College / Carroll)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'John Kerry' as name,
    'U.S. Senator & ex-Sec. of State' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Boston College, Carroll School of Management (Boston College / Carroll)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Amy Poehler' as name,
    'Actress & Entrepreneur' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Boston College, Carroll School of Management (Boston College / Carroll)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Marty Walsh' as name,
    'Former U.S. Sec. of Labor' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Boston College, Carroll School of Management (Boston College / Carroll)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Mitt Romney' as name,
    'U.S. Senator & ex-Presidential Candidate' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Brigham Young University, Marriott School of Business (BYU / Marriott)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Kevin Rollins' as name,
    'Former CEO, Dell' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Brigham Young University, Marriott School of Business (BYU / Marriott)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Clayton Christensen' as name,
    'Harvard Professor & Author' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Brigham Young University, Marriott School of Business (BYU / Marriott)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'David Neeleman' as name,
    'Founder, JetBlue' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Brigham Young University, Marriott School of Business (BYU / Marriott)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Satya Nadella' as name,
    'CEO, Microsoft' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Chicago, Booth School of Business (Chicago / Booth)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Susan Wagner' as name,
    'Co-founder, BlackRock' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Chicago, Booth School of Business (Chicago / Booth)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'David Booth' as name,
    'Co-founder, Dimensional Fund Advisors' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Chicago, Booth School of Business (Chicago / Booth)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Eric Gleacher' as name,
    'Founder, Gleacher & Co.' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Chicago, Booth School of Business (Chicago / Booth)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'David Coulter' as name,
    'Non-Exec Chair, Bank of America' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Carnegie Mellon University, Tepper School of Business (Carnegie Mellon / Tepper)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Jim Rohr' as name,
    'Former CEO, PNC Financial' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Carnegie Mellon University, Tepper School of Business (Carnegie Mellon / Tepper)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Rajiv L. Gupta' as name,
    'Former Chair, DuPont' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Carnegie Mellon University, Tepper School of Business (Carnegie Mellon / Tepper)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Mark Cuban' as name,
    'Entrepreneur & Investor' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Carnegie Mellon University, Tepper School of Business (Carnegie Mellon / Tepper)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Warren Buffett' as name,
    'CEO, Berkshire Hathaway' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Columbia Business School (Columbia)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Henry Kravis' as name,
    'Co-founder, KKR' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Columbia Business School (Columbia)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Sallie Krawcheck' as name,
    'CEO, Ellevest' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Columbia Business School (Columbia)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Vikram Pandit' as name,
    'Former CEO, Citigroup' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Columbia Business School (Columbia)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ratan Tata' as name,
    'Chairman, Tata Group' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Cornell University, Johnson Graduate School of Management (Cornell / Johnson)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Irene Rosenfeld' as name,
    'Former CEO, Mondelez' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Cornell University, Johnson Graduate School of Management (Cornell / Johnson)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Sandy Weill' as name,
    'Former CEO, Citigroup' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Cornell University, Johnson Graduate School of Management (Cornell / Johnson)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Christopher A. Sinclair' as name,
    'Former CEO, PepsiCo' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Dartmouth College, Tuck School of Business (Dartmouth / Tuck)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Janet L. Robinson' as name,
    'Former CEO, The New York Times' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Dartmouth College, Tuck School of Business (Dartmouth / Tuck)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Kevin McGrath' as name,
    'Managing Director, Morgan Stanley' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Dartmouth College, Tuck School of Business (Dartmouth / Tuck)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Peter R. Dolan' as name,
    'Former CEO, Bristol-Myers Squibb' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Dartmouth College, Tuck School of Business (Dartmouth / Tuck)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Tim Cook' as name,
    'CEO, Apple' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Duke University, Fuqua School of Business (Duke / Fuqua)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Melinda Gates' as name,
    'Co-chair, Gates Foundation' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Duke University, Fuqua School of Business (Duke / Fuqua)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'John Allison' as name,
    'Former CEO, BB&T' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Duke University, Fuqua School of Business (Duke / Fuqua)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'David Rubenstein' as name,
    'Co-founder, Carlyle Group' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Duke University, Fuqua School of Business (Duke / Fuqua)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Roberto Goizueta' as name,
    'Former CEO, Coca-Cola' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Emory University, Goizueta Business School (Emory / Goizueta)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'John Brock' as name,
    'Former CEO, Coca-Cola Enterprises' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Emory University, Goizueta Business School (Emory / Goizueta)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'J. Paul Raines' as name,
    'Former CEO, GameStop' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Emory University, Goizueta Business School (Emory / Goizueta)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Susan Blakely' as name,
    'Founder, Career Success Strategies' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Emory University, Goizueta Business School (Emory / Goizueta)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Warrington alumni are highly placed in finance and consulting, but specific notable names are limited' as name,
    '' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Florida, Warrington College of Business (UF / Warrington)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ivanka Trump' as name,
    'Former Advisor to U.S. President' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Georgetown University, McDonough School of Business (Georgetown / McDonough)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Mike Grier' as name,
    'GM, San Jose Sharks' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Georgetown University, McDonough School of Business (Georgetown / McDonough)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ted Leonsis' as name,
    'Owner, Washington Capitals' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Georgetown University, McDonough School of Business (Georgetown / McDonough)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Jim Kim' as name,
    'Former President, World Bank' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Georgetown University, McDonough School of Business (Georgetown / McDonough)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Sheryl Sandberg' as name,
    'Former COO, Meta' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Harvard University, Harvard Business School (Harvard / HBS)'
ON CONFLICT DO NOTHING;

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Michael Bloomberg' as name,
    'Founder, Bloomberg LP' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Harvard University, Harvard Business School (Harvard / HBS)'
ON CONFLICT DO NOTHING;