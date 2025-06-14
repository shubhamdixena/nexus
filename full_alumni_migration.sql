-- Complete Alumni Data Migration
-- Generated from CSV data with correct school names

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Arthur Blank' as name,
    'Co-founder, Home Depot' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Babson College, F.W. Olin Graduate School of Business (Babson / Olin)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Roger Enrico' as name,
    'Former CEO, PepsiCo' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Babson College, F.W. Olin Graduate School of Business (Babson / Olin)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'William Green' as name,
    'Former CEO, Accenture' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Babson College, F.W. Olin Graduate School of Business (Babson / Olin)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Matt Coffin' as name,
    'Founder, LowerMyBills.com' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Babson College, F.W. Olin Graduate School of Business (Babson / Olin)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Shantanu Narayen' as name,
    'CEO, Adobe' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of California, Berkeley, Haas School of Business (UC Berkeley / Haas)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Paul Otellini' as name,
    'Former CEO, Intel' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of California, Berkeley, Haas School of Business (UC Berkeley / Haas)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Barbara Desoer' as name,
    'Former CEO, Citibank' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of California, Berkeley, Haas School of Business (UC Berkeley / Haas)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Walter Haas Jr.' as name,
    'Chairman, Levi Strauss & Co.' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of California, Berkeley, Haas School of Business (UC Berkeley / Haas)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Peter Lynch' as name,
    'Investor, Fidelity' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Boston College, Carroll School of Management (Boston College / Carroll)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'John Kerry' as name,
    'U.S. Senator & ex-Sec. of State' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Boston College, Carroll School of Management (Boston College / Carroll)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Amy Poehler' as name,
    'Actress & Entrepreneur' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Boston College, Carroll School of Management (Boston College / Carroll)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Marty Walsh' as name,
    'Former U.S. Sec. of Labor' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Boston College, Carroll School of Management (Boston College / Carroll)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Mitt Romney' as name,
    'U.S. Senator & ex-Presidential Candidate' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Brigham Young University, Marriott School of Business (BYU / Marriott)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Kevin Rollins' as name,
    'Former CEO, Dell' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Brigham Young University, Marriott School of Business (BYU / Marriott)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Clayton Christensen' as name,
    'Harvard Professor & Author' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Brigham Young University, Marriott School of Business (BYU / Marriott)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'David Neeleman' as name,
    'Founder, JetBlue' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Brigham Young University, Marriott School of Business (BYU / Marriott)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Satya Nadella' as name,
    'CEO, Microsoft' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Chicago, Booth School of Business (Chicago / Booth)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Susan Wagner' as name,
    'Co-founder, BlackRock' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Chicago, Booth School of Business (Chicago / Booth)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'David Booth' as name,
    'Co-founder, Dimensional Fund Advisors' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Chicago, Booth School of Business (Chicago / Booth)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Eric Gleacher' as name,
    'Founder, Gleacher & Co.' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Chicago, Booth School of Business (Chicago / Booth)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'David Coulter' as name,
    'Non-Exec Chair, Bank of America' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Carnegie Mellon University, Tepper School of Business (Carnegie Mellon / Tepper)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Jim Rohr' as name,
    'Former CEO, PNC Financial' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Carnegie Mellon University, Tepper School of Business (Carnegie Mellon / Tepper)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Rajiv L. Gupta' as name,
    'Former Chair, DuPont' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Carnegie Mellon University, Tepper School of Business (Carnegie Mellon / Tepper)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Mark Cuban' as name,
    'Entrepreneur & Investor' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Carnegie Mellon University, Tepper School of Business (Carnegie Mellon / Tepper)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Warren Buffett' as name,
    'CEO, Berkshire Hathaway' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Columbia Business School (Columbia)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Henry Kravis' as name,
    'Co-founder, KKR' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Columbia Business School (Columbia)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Sallie Krawcheck' as name,
    'CEO, Ellevest' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Columbia Business School (Columbia)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Vikram Pandit' as name,
    'Former CEO, Citigroup' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Columbia Business School (Columbia)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ratan Tata' as name,
    'Chairman, Tata Group' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Cornell University, Johnson Graduate School of Management (Cornell / Johnson)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Irene Rosenfeld' as name,
    'Former CEO, Mondelez' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Cornell University, Johnson Graduate School of Management (Cornell / Johnson)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Sandy Weill' as name,
    'Former CEO, Citigroup' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Cornell University, Johnson Graduate School of Management (Cornell / Johnson)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Christopher A. Sinclair' as name,
    'Former CEO, PepsiCo' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Dartmouth College, Tuck School of Business (Dartmouth / Tuck)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Janet L. Robinson' as name,
    'Former CEO, The New York Times' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Dartmouth College, Tuck School of Business (Dartmouth / Tuck)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Kevin McGrath' as name,
    'Managing Director, Morgan Stanley' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Dartmouth College, Tuck School of Business (Dartmouth / Tuck)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Peter R. Dolan' as name,
    'Former CEO, Bristol-Myers Squibb' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Dartmouth College, Tuck School of Business (Dartmouth / Tuck)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Tim Cook' as name,
    'CEO, Apple' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Duke University, Fuqua School of Business (Duke / Fuqua)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Melinda Gates' as name,
    'Co-chair, Gates Foundation' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Duke University, Fuqua School of Business (Duke / Fuqua)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'John Allison' as name,
    'Former CEO, BB&T' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Duke University, Fuqua School of Business (Duke / Fuqua)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'David Rubenstein' as name,
    'Co-founder, Carlyle Group' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Duke University, Fuqua School of Business (Duke / Fuqua)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Roberto Goizueta' as name,
    'Former CEO, Coca-Cola' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Emory University, Goizueta Business School (Emory / Goizueta)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'John Brock' as name,
    'Former CEO, Coca-Cola Enterprises' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Emory University, Goizueta Business School (Emory / Goizueta)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'J. Paul Raines' as name,
    'Former CEO, GameStop' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Emory University, Goizueta Business School (Emory / Goizueta)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Susan Blakely' as name,
    'Founder, Career Success Strategies' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Emory University, Goizueta Business School (Emory / Goizueta)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Warrington alumni are highly placed in finance and consulting, but specific notable names are limited' as name,
    '' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Florida, Warrington College of Business (UF / Warrington)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ivanka Trump' as name,
    'Former Advisor to U.S. President' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Georgetown University, McDonough School of Business (Georgetown / McDonough)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Mike Grier' as name,
    'GM, San Jose Sharks' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Georgetown University, McDonough School of Business (Georgetown / McDonough)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ted Leonsis' as name,
    'Owner, Washington Capitals' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Georgetown University, McDonough School of Business (Georgetown / McDonough)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Jim Kim' as name,
    'Former President, World Bank' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Georgetown University, McDonough School of Business (Georgetown / McDonough)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Sheryl Sandberg' as name,
    'Former COO, Meta' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Harvard University, Harvard Business School (Harvard / HBS)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Michael Bloomberg' as name,
    'Founder, Bloomberg LP' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Harvard University, Harvard Business School (Harvard / HBS)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'George W. Bush' as name,
    'Former U.S. President' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Harvard University, Harvard Business School (Harvard / HBS)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Jamie Dimon' as name,
    'CEO, JPMorgan Chase' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Harvard University, Harvard Business School (Harvard / HBS)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Sonny Perdue' as name,
    'Former U.S. Secretary of Agriculture' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Georgia, Terry College of Business (UGA / Terry)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Alton Brown' as name,
    'TV Personality & Entrepreneur' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Georgia, Terry College of Business (UGA / Terry)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Michael Adams' as name,
    'Former President, University of Georgia' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Georgia, Terry College of Business (UGA / Terry)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Dan Amos' as name,
    'CEO, Aflac' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Georgia, Terry College of Business (UGA / Terry)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Chris Klaus' as name,
    'Founder, ISS' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Georgia Institute of Technology, Scheller College of Business (Georgia Tech / Scheller)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'David Dorman' as name,
    'Former CEO, AT&T' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Georgia Institute of Technology, Scheller College of Business (Georgia Tech / Scheller)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Mike Duke' as name,
    'Former CEO, Walmart' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Georgia Institute of Technology, Scheller College of Business (Georgia Tech / Scheller)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'John F. Brock' as name,
    'Former CEO, Coca-Cola Enterprises' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Georgia Institute of Technology, Scheller College of Business (Georgia Tech / Scheller)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Mark Cuban' as name,
    'Entrepreneur & Investor' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Indiana University Bloomington, Kelley School of Business (Indiana / Kelley)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'John Chambers' as name,
    'Former CEO, Cisco' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Indiana University Bloomington, Kelley School of Business (Indiana / Kelley)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Scott Dorsey' as name,
    'Co-founder, ExactTarget' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Indiana University Bloomington, Kelley School of Business (Indiana / Kelley)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Harold Arthur Poling' as name,
    'Former CEO, Ford Motor Company' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Indiana University Bloomington, Kelley School of Business (Indiana / Kelley)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Michael Bloomberg' as name,
    'Founder, Bloomberg LP' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Johns Hopkins University, Carey Business School (Johns Hopkins / Carey)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Wes Unseld Jr.' as name,
    'NBA Coach' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Johns Hopkins University, Carey Business School (Johns Hopkins / Carey)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Brian Rogers' as name,
    'Former Chairman, T. Rowe Price' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Johns Hopkins University, Carey Business School (Johns Hopkins / Carey)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ronald J. Daniels' as name,
    'President, Johns Hopkins University' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Johns Hopkins University, Carey Business School (Johns Hopkins / Carey)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Donald Trump Jr.' as name,
    'Executive VP, Trump Organization' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Pennsylvania, Lauder Institute of Management & International Studies (Penn / Lauder)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ivanka Trump' as name,
    'Former Advisor to U.S. President' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Pennsylvania, Lauder Institute of Management & International Studies (Penn / Lauder)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Alex Gorsky' as name,
    'Former CEO, Johnson & Johnson' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Pennsylvania, Lauder Institute of Management & International Studies (Penn / Lauder)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Elon Musk' as name,
    'CEO, Tesla & SpaceX' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Pennsylvania, Lauder Institute of Management & International Studies (Penn / Lauder)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Kevin Plank' as name,
    'Founder, Under Armour' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Maryland, Robert H. Smith School of Business (Maryland / Smith)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Larry Hogan' as name,
    'Former Governor, Maryland' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Maryland, Robert H. Smith School of Business (Maryland / Smith)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Barry Gossett' as name,
    'CEO, Acton Mobile' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Maryland, Robert H. Smith School of Business (Maryland / Smith)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Stephen M. Ross' as name,
    'Real Estate Developer' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Michigan, Ross School of Business (Michigan / Ross)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'John DeLorean' as name,
    'Automotive Engineer' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Michigan, Ross School of Business (Michigan / Ross)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Larry Page' as name,
    'Co-founder, Google' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Michigan, Ross School of Business (Michigan / Ross)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Dan Gilbert' as name,
    'Owner, Cleveland Cavaliers' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Michigan State University, Broad College of Business (Michigan State / Broad)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Eli Broad' as name,
    'Philanthropist & Businessman' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Michigan State University, Broad College of Business (Michigan State / Broad)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Robert Stempel' as name,
    'Former CEO, General Motors' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Michigan State University, Broad College of Business (Michigan State / Broad)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Richard Schulze' as name,
    'Founder, Best Buy' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Minnesota, Carlson School of Management (Minnesota / Carlson)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Marilyn Carlson Nelson' as name,
    'Former CEO, Carlson Companies' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Minnesota, Carlson School of Management (Minnesota / Carlson)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'William Norris' as name,
    'Founder, Control Data Corporation' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Minnesota, Carlson School of Management (Minnesota / Carlson)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Bill Ford' as name,
    'Executive Chairman, Ford Motor Company' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'MIT Sloan School of Management (MIT / Sloan)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Carly Fiorina' as name,
    'Former CEO, HP' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'MIT Sloan School of Management (MIT / Sloan)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Benjamin Netanyahu' as name,
    'Prime Minister, Israel' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'MIT Sloan School of Management (MIT / Sloan)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ted Phillips' as name,
    'CEO, Chicago Bears' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Northwestern University, Kellogg School of Management (Northwestern / Kellogg)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Arthur Martinez' as name,
    'Former CEO, Sears' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Northwestern University, Kellogg School of Management (Northwestern / Kellogg)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Susan E. Arnold' as name,
    'Former Chair, Disney' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Northwestern University, Kellogg School of Management (Northwestern / Kellogg)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Joe Kernan' as name,
    'Former Governor, Indiana' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Notre Dame, Mendoza College of Business (Notre Dame / Mendoza)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Regis Philbin' as name,
    'TV Host' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Notre Dame, Mendoza College of Business (Notre Dame / Mendoza)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Condoleezza Rice' as name,
    'Former U.S. Secretary of State' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Notre Dame, Mendoza College of Business (Notre Dame / Mendoza)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Henry Kravis' as name,
    'Co-founder, KKR' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'New York University, Stern School of Business (NYU / Stern)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Alan Greenspan' as name,
    'Former Chairman, Federal Reserve' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'New York University, Stern School of Business (NYU / Stern)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Richard S. Fuld Jr.' as name,
    'Former CEO, Lehman Brothers' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'New York University, Stern School of Business (NYU / Stern)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Les Wexner' as name,
    'Founder, L Brands' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Ohio State University, Fisher College of Business (Ohio State / Fisher)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Chris Spielman' as name,
    'NFL Analyst & Former Player' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Ohio State University, Fisher College of Business (Ohio State / Fisher)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Jim Tressel' as name,
    'Former Ohio State Football Coach' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Ohio State University, Fisher College of Business (Ohio State / Fisher)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'John Doerr' as name,
    'Venture Capitalist, Kleiner Perkins' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Rice University, Jones Graduate School of Business (Rice / Jones)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Bobby Tudor' as name,
    'Founder, Tudor, Pickering, Holt & Co.' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Rice University, Jones Graduate School of Business (Rice / Jones)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Jim Hackett' as name,
    'Former CEO, Ford Motor Company' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Rice University, Jones Graduate School of Business (Rice / Jones)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Chuck Zegar' as name,
    'Co-founder, Bloomberg LP' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Rochester, Simon Business School (Rochester / Simon)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Richard B. Handler' as name,
    'CEO, Jefferies' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Rochester, Simon Business School (Rochester / Simon)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Antonio Pérez' as name,
    'Former CEO, Kodak' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Rochester, Simon Business School (Rochester / Simon)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Gerald J. Ford' as name,
    'Billionaire Banker' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Southern Methodist University, Cox School of Business (SMU / Cox)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Lamar Hunt' as name,
    'Founder, American Football League' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Southern Methodist University, Cox School of Business (SMU / Cox)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ray L. Hunt' as name,
    'CEO, Hunt Oil Company' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Southern Methodist University, Cox School of Business (SMU / Cox)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Elon Musk' as name,
    'CEO, Tesla & SpaceX' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Stanford Graduate School of Business (Stanford)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Phil Knight' as name,
    'Founder, Nike' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Stanford Graduate School of Business (Stanford)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Mary Barra' as name,
    'CEO, General Motors' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Stanford Graduate School of Business (Stanford)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Sundar Pichai' as name,
    'CEO, Google' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Stanford Graduate School of Business (Stanford)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Paul Merage' as name,
    'Founder, Hot Pockets' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of California, Irvine, Paul Merage School of Business (UC Irvine / Merage)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Kelly Coffey' as name,
    'CEO, City National Bank' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of California, Irvine, Paul Merage School of Business (UC Irvine / Merage)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Scott Boras' as name,
    'Sports Agent' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of California, Irvine, Paul Merage School of Business (UC Irvine / Merage)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Susan Wojcicki' as name,
    'Former CEO, YouTube' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of California, Los Angeles, Anderson School of Management (UCLA / Anderson)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Larry Fink' as name,
    'CEO, BlackRock' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of California, Los Angeles, Anderson School of Management (UCLA / Anderson)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Bill Gross' as name,
    'Founder, Idealab' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of California, Los Angeles, Anderson School of Management (UCLA / Anderson)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Julian Robertson' as name,
    'Founder, Tiger Management' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of North Carolina at Chapel Hill, Kenan–Flagler Business School (UNC / Kenan-Flagler)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Jason Kilar' as name,
    'Former CEO, Hulu' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of North Carolina at Chapel Hill, Kenan–Flagler Business School (UNC / Kenan-Flagler)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'John Swofford' as name,
    'Former Commissioner, ACC' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of North Carolina at Chapel Hill, Kenan–Flagler Business School (UNC / Kenan-Flagler)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Donald Trump' as name,
    'Former U.S. President' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Pennsylvania, Wharton School (Penn / Wharton)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Elon Musk' as name,
    'CEO, Tesla & SpaceX' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Pennsylvania, Wharton School (Penn / Wharton)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Warren Buffett' as name,
    'CEO, Berkshire Hathaway' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Pennsylvania, Wharton School (Penn / Wharton)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ivanka Trump' as name,
    'Former Advisor to U.S. President' as position,
    '' as company,
    '' as description,
    4 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Pennsylvania, Wharton School (Penn / Wharton)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Marc Benioff' as name,
    'CEO, Salesforce' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Southern California, Marshall School of Business (USC / Marshall)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'George Lucas' as name,
    'Creator, Star Wars' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Southern California, Marshall School of Business (USC / Marshall)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Shonda Rhimes' as name,
    'TV Producer, Grey’s Anatomy' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Southern California, Marshall School of Business (USC / Marshall)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Rex Tillerson' as name,
    'Former U.S. Secretary of State' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Texas at Austin, McCombs School of Business (UT Austin / McCombs)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Michael Dell' as name,
    'Founder, Dell Technologies' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Texas at Austin, McCombs School of Business (UT Austin / McCombs)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Gary Kelly' as name,
    'CEO, Southwest Airlines' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Texas at Austin, McCombs School of Business (UT Austin / McCombs)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'John D. Arnold' as name,
    'Billionaire Investor' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Virginia, Darden School of Business (UVA / Darden)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Peter Kiernan' as name,
    'Former Partner, Goldman Sachs' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Virginia, Darden School of Business (UVA / Darden)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Frank Batten' as name,
    'Founder, Weather Channel' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Virginia, Darden School of Business (UVA / Darden)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'William H. Macy' as name,
    'Actor' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Vanderbilt University, Owen Graduate School of Management (Vanderbilt / Owen)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Lamar Alexander' as name,
    'Former U.S. Senator' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Vanderbilt University, Owen Graduate School of Management (Vanderbilt / Owen)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'John Ingram' as name,
    'Chairman, Ingram Industries' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Vanderbilt University, Owen Graduate School of Management (Vanderbilt / Owen)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'David Bonderman' as name,
    'Founder, TPG Capital' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Washington, Foster School of Business (UW / Foster)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Orin Smith' as name,
    'Former CEO, Starbucks' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Washington, Foster School of Business (UW / Foster)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Tom Alberg' as name,
    'Co-founder, Madrona Venture Group' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Washington, Foster School of Business (UW / Foster)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Andrew C. Taylor' as name,
    'Executive Chairman, Enterprise Holdings' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Washington University in St. Louis, Olin Business School (WashU / Olin)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'John Bachmann' as name,
    'Former Managing Partner, Edward Jones' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Washington University in St. Louis, Olin Business School (WashU / Olin)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Maxine Clark' as name,
    'Founder, Build-A-Bear Workshop' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Washington University in St. Louis, Olin Business School (WashU / Olin)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Indra Nooyi' as name,
    'Former CEO, PepsiCo' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Yale University, School of Management (Yale / SOM)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Janet Yellen' as name,
    'U.S. Secretary of the Treasury' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Yale University, School of Management (Yale / SOM)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Tim Geithner' as name,
    'Former U.S. Treasury Secretary' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Yale University, School of Management (Yale / SOM)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Richard Wyatt' as name,
    'Investment Banker' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Bath, School of Management (Bath)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Amy Williams' as name,
    'Olympic Gold Medalist' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Bath, School of Management (Bath)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Nigel Sharrocks' as name,
    'Chairman, MediaCom' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Bath, School of Management (Bath)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Sir Martin Sorrell' as name,
    'Founder, WPP' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Cambridge, Judge Business School (Cambridge / Judge)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ian Davis' as name,
    'Former Managing Director, McKinsey' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Cambridge, Judge Business School (Cambridge / Judge)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Dame Sandra Dawson' as name,
    'Former Director, Judge Business School' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Cambridge, Judge Business School (Cambridge / Judge)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Li Ming' as name,
    'Founder, Sino Biopharmaceutical' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'China Europe International Business School (CEIBS)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Zhang Ruimin' as name,
    'CEO, Haier Group' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'China Europe International Business School (CEIBS)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Chen Dongsheng' as name,
    'Founder, Taikang Insurance Group' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'China Europe International Business School (CEIBS)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Sir Tom Hunter' as name,
    'Entrepreneur & Philanthropist' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Edinburgh Business School (Edinburgh)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ian Marchant' as name,
    'Former CEO, Scottish & Southern Energy' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Edinburgh Business School (Edinburgh)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ewan McGregor' as name,
    'Actor' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Edinburgh Business School (Edinburgh)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Jean-Paul Agon' as name,
    'Former CEO, L’Oréal' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'EMLYON Business School (EMLYON)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Patrick Ponsolle' as name,
    'Former Chairman, Eurostar' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'EMLYON Business School (EMLYON)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Pierre Kosciusko-Morizet' as name,
    'Founder, PriceMinister' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'EMLYON Business School (EMLYON)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Javier Faus' as name,
    'Founder, Meridia Capital' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'ESADE Business School (ESADE)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Luis Maroto' as name,
    'CEO, Amadeus IT Group' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'ESADE Business School (ESADE)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Joaquín Duato' as name,
    'CEO, Johnson & Johnson' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'ESADE Business School (ESADE)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Patrick Cescau' as name,
    'Former CEO, Unilever' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'ESCP Business School (ESCP)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Jean-Pierre Raffarin' as name,
    'Former Prime Minister, France' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'ESCP Business School (ESCP)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Philippe Houzé' as name,
    'Chairman, Galeries Lafayette Group' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'ESCP Business School (ESCP)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Christoph Brand' as name,
    'CEO, Axpo Group' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'ESMT Berlin (ESMT)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Jörg Rocholl' as name,
    'President, ESMT Berlin' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'ESMT Berlin (ESMT)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Rolf Schrömgens' as name,
    'Co-founder, Trivago' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'ESMT Berlin (ESMT)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'François-Henri Pinault' as name,
    'CEO, Kering' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'HEC Paris (HEC)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Jean-Paul Agon' as name,
    'Former CEO, L’Oréal' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'HEC Paris (HEC)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Dominique Strauss-Kahn' as name,
    'Former IMF Managing Director' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'HEC Paris (HEC)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ángel Cano' as name,
    'Former CEO, BBVA' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'IE Business School (IE)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Rafael del Pino' as name,
    'Chairman, Ferrovial' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'IE Business School (IE)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'José María Álvarez-Pallete' as name,
    'CEO, Telefónica' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'IE Business School (IE)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Antonio Garrigues Walker' as name,
    'Chairman, Garrigues' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'IESE Business School (IESE)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Pablo Isla' as name,
    'Former CEO, Inditex' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'IESE Business School (IESE)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Luis de Guindos' as name,
    'Vice President, ECB' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'IESE Business School (IESE)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Sir Keith O’Nions' as name,
    'Former President, Imperial College' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Imperial College Business School (Imperial)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Alice Gast' as name,
    'Former President, Imperial College' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Imperial College Business School (Imperial)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'James Stirling' as name,
    'Physicist & Academic Leader' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Imperial College Business School (Imperial)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ajay Banga' as name,
    'President, World Bank' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Indian School of Business (ISB)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Shantanu Narayen' as name,
    'CEO, Adobe' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Indian School of Business (ISB)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Nikesh Arora' as name,
    'CEO, Palo Alto Networks' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'Indian School of Business (ISB)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Henry Engelhardt' as name,
    'Founder, Admiral Group' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'INSEAD (INSEAD)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Tidjane Thiam' as name,
    'Former CEO, Credit Suisse' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'INSEAD (INSEAD)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Ilian Mihov' as name,
    'Dean, INSEAD' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'INSEAD (INSEAD)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Sir Martin Sorrell' as name,
    'Founder, WPP' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'London Business School (LBS)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Richard Sharp' as name,
    'Former Chairman, BBC' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'London Business School (LBS)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Naguib Sawiris' as name,
    'Egyptian Business Tycoon' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'London Business School (LBS)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Sir Terry Leahy' as name,
    'Former CEO, Tesco' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Manchester, Alliance Manchester Business School (Manchester)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Andy Duncan' as name,
    'Former CEO, Channel 4' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Manchester, Alliance Manchester Business School (Manchester)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Paul Walsh' as name,
    'Former CEO, Diageo' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Manchester, Alliance Manchester Business School (Manchester)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Timothy Cook' as name,
    'CEO, Apple' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Oxford, Saïd Business School (Oxford / Saïd)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Patrick Pichette' as name,
    'Former CFO, Google' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Oxford, Saïd Business School (Oxford / Saïd)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Alexander Nix' as name,
    'Former CEO, Cambridge Analytica' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Oxford, Saïd Business School (Oxford / Saïd)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Andrea Illy' as name,
    'Chairman, Illycaffè' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'SDA Bocconi School of Management (Bocconi)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Vittorio Colao' as name,
    'Former CEO, Vodafone' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'SDA Bocconi School of Management (Bocconi)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Federico Marchetti' as name,
    'Founder, Yoox Net-a-Porter' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'SDA Bocconi School of Management (Bocconi)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'John Cassaday' as name,
    'Former CEO, Corus Entertainment' as position,
    '' as company,
    '' as description,
    1 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Toronto, Rotman School of Management (Toronto / Rotman)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Kevin O’Leary' as name,
    'Investor & TV Personality' as position,
    '' as company,
    '' as description,
    2 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Toronto, Rotman School of Management (Toronto / Rotman)';

INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    'Roger Martin' as name,
    'Former Dean, Rotman School' as position,
    '' as company,
    '' as description,
    3 as alumni_order
FROM mba_schools ms
WHERE ms.name = 'University of Toronto, Rotman School of Management (Toronto / Rotman)';



-- Verify the insertion
SELECT 
    COUNT(*) as total_alumni,
    COUNT(DISTINCT school_id) as schools_with_alumni
FROM mba_school_alumni;

SELECT 
    ms.name as school_name,
    COUNT(a.id) as alumni_count
FROM mba_schools ms
LEFT JOIN mba_school_alumni a ON ms.id = a.school_id
GROUP BY ms.id, ms.name
ORDER BY alumni_count DESC, ms.name;