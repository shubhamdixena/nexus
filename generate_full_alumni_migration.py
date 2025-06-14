#!/usr/bin/env python3
"""
Script to generate complete alumni migration SQL for Supabase
This script creates SQL to insert all alumni data from the CSV
"""

import csv
import re

# Mapping from CSV school names to database school names
SCHOOL_NAME_MAPPING = {
    'Babson College, F.W. Olin Graduate School of Business': 'Babson College, F.W. Olin Graduate School of Business (Babson / Olin)',
    'University of California, Berkeley, Haas School of Business': 'University of California, Berkeley, Haas School of Business (UC Berkeley / Haas)',
    'Boston College, Carroll School of Management': 'Boston College, Carroll School of Management (Boston College / Carroll)',
    'Brigham Young University, Marriott School of Business': 'Brigham Young University, Marriott School of Business (BYU / Marriott)',
    'University of Chicago, Booth School of Business': 'University of Chicago, Booth School of Business (Chicago / Booth)',
    'Carnegie Mellon University, Tepper School of Business': 'Carnegie Mellon University, Tepper School of Business (Carnegie Mellon / Tepper)',
    'Columbia Business School': 'Columbia Business School (Columbia)',
    'Cornell University, Johnson Graduate School of Management': 'Cornell University, Johnson Graduate School of Management (Cornell / Johnson)',
    'Dartmouth College, Tuck School of Business': 'Dartmouth College, Tuck School of Business (Dartmouth / Tuck)',
    'Duke University, Fuqua School of Business': 'Duke University, Fuqua School of Business (Duke / Fuqua)',
    'Emory University, Goizueta Business School': 'Emory University, Goizueta Business School (Emory / Goizueta)',
    'University of Florida, Warrington College of Business': 'University of Florida, Warrington College of Business (UF / Warrington)',
    'Georgetown University, McDonough School of Business': 'Georgetown University, McDonough School of Business (Georgetown / McDonough)',
    'Harvard University, Harvard Business School': 'Harvard University, Harvard Business School (Harvard / HBS)',
    'University of Georgia, Terry College of Business': 'University of Georgia, Terry College of Business (UGA / Terry)',
    'Georgia Institute of Technology, Scheller College of Business': 'Georgia Institute of Technology, Scheller College of Business (Georgia Tech / Scheller)',
    'Indiana University Bloomington, Kelley School of Business': 'Indiana University Bloomington, Kelley School of Business (Indiana / Kelley)',
    'Johns Hopkins University, Carey Business School': 'Johns Hopkins University, Carey Business School (Johns Hopkins / Carey)',
    'University of Pennsylvania, Lauder Institute of Management & International Studies': 'University of Pennsylvania, Lauder Institute of Management & International Studies (Penn / Lauder)',
    'University of Maryland, Robert H. Smith School of Business': 'University of Maryland, Robert H. Smith School of Business (Maryland / Smith)',
    'University of Michigan, Ross School of Business': 'University of Michigan, Ross School of Business (Michigan / Ross)',
    'Michigan State University, Broad College of Business': 'Michigan State University, Broad College of Business (Michigan State / Broad)',
    'University of Minnesota, Carlson School of Management': 'University of Minnesota, Carlson School of Management (Minnesota / Carlson)',
    'MIT Sloan School of Management': 'MIT Sloan School of Management (MIT / Sloan)',
    'Northwestern University, Kellogg School of Management': 'Northwestern University, Kellogg School of Management (Northwestern / Kellogg)',
    'University of Notre Dame, Mendoza College of Business': 'University of Notre Dame, Mendoza College of Business (Notre Dame / Mendoza)',
    'New York University, Stern School of Business': 'New York University, Stern School of Business (NYU / Stern)',
    'Ohio State University, Fisher College of Business': 'Ohio State University, Fisher College of Business (Ohio State / Fisher)',
    'Rice University, Jones Graduate School of Business': 'Rice University, Jones Graduate School of Business (Rice / Jones)',
    'University of Rochester, Simon Business School': 'University of Rochester, Simon Business School (Rochester / Simon)',
    'Southern Methodist University, Cox School of Business': 'Southern Methodist University, Cox School of Business (SMU / Cox)',
    'Stanford Graduate School of Business': 'Stanford Graduate School of Business (Stanford)',
    'University of California, Irvine, Paul Merage School of Business': 'University of California, Irvine, Paul Merage School of Business (UC Irvine / Merage)',
    'University of California, Los Angeles, Anderson School of Management': 'University of California, Los Angeles, Anderson School of Management (UCLA / Anderson)',
    'University of North Carolina at Chapel Hill, Kenan–Flagler Business School': 'University of North Carolina at Chapel Hill, Kenan–Flagler Business School (UNC / Kenan-Flagler)',
    'University of Pennsylvania, Wharton School': 'University of Pennsylvania, Wharton School (Penn / Wharton)',
    'University of Southern California, Marshall School of Business': 'University of Southern California, Marshall School of Business (USC / Marshall)',
    'University of Texas at Austin, McCombs School of Business': 'University of Texas at Austin, McCombs School of Business (UT Austin / McCombs)',
    'University of Virginia, Darden School of Business': 'University of Virginia, Darden School of Business (UVA / Darden)',
    'Vanderbilt University, Owen Graduate School of Management': 'Vanderbilt University, Owen Graduate School of Management (Vanderbilt / Owen)',
    'University of Washington, Foster School of Business': 'University of Washington, Foster School of Business (UW / Foster)',
    'Washington University in St. Louis, Olin Business School': 'Washington University in St. Louis, Olin Business School (WashU / Olin)',
    'Yale University, School of Management': 'Yale University, School of Management (Yale / SOM)',
    # International schools
    'University of Bath, School of Management': 'University of Bath, School of Management (Bath)',
    'University of Cambridge, Judge Business School': 'University of Cambridge, Judge Business School (Cambridge / Judge)',
    'China Europe International Business School': 'China Europe International Business School (CEIBS)',
    'University of Edinburgh Business School': 'University of Edinburgh Business School (Edinburgh)',
    'EMLYON Business School': 'EMLYON Business School (EMLYON)',
    'ESADE Business School': 'ESADE Business School (ESADE)',
    'ESCP Business School': 'ESCP Business School (ESCP)',
    'ESMT Berlin': 'ESMT Berlin (ESMT)',
    'HEC Paris': 'HEC Paris (HEC)',
    'IE Business School': 'IE Business School (IE)',
    'IESE Business School': 'IESE Business School (IESE)',
    'Imperial College Business School': 'Imperial College Business School (Imperial)',
    'Indian School of Business': 'Indian School of Business (ISB)',
    'INSEAD': 'INSEAD (INSEAD)',
    'London Business School': 'London Business School (LBS)',
    'University of Manchester, Alliance Manchester Business School': 'University of Manchester, Alliance Manchester Business School (Manchester)',
    'University of Oxford, Saïd Business School': 'University of Oxford, Saïd Business School (Oxford / Saïd)',
    'SDA Bocconi School of Management': 'SDA Bocconi School of Management (Bocconi)',
    'University of Toronto, Rotman School of Management': 'University of Toronto, Rotman School of Management (Toronto / Rotman)'
}

def clean_alumni_name(name):
    """Clean and extract alumni name, removing parenthetical descriptions"""
    if not name or name.strip() == '' or name == 'N/A':
        return None, None
    
    # Extract name and description from format: "Name (Description)"
    match = re.match(r'^([^(]+)\s*\(([^)]+)\)$', name.strip())
    if match:
        return match.group(1).strip(), match.group(2).strip()
    else:
        return name.strip(), None

def escape_sql_string(s):
    """Escape single quotes in SQL strings"""
    if s is None:
        return ''
    return str(s).replace("'", "''")

def generate_full_alumni_migration():
    """Generate complete SQL migration for all alumni data"""
    
    sql_statements = []
    
    # Read CSV and generate INSERT statements
    with open('data/mba-schools-data.csv', 'r', encoding='utf-8') as file:
        csv_reader = csv.DictReader(file)
        
        for row in csv_reader:
            csv_school_name = row['Business School']
            db_school_name = SCHOOL_NAME_MAPPING.get(csv_school_name, csv_school_name)
            
            # Process each alumnus (1-4)
            for i in range(1, 5):
                alumnus_col = f'Alumnus {i}'
                if alumnus_col in row and row[alumnus_col]:
                    name, position = clean_alumni_name(row[alumnus_col])
                    
                    if name:
                        # Generate SQL INSERT statement
                        sql = f"""INSERT INTO mba_school_alumni (school_id, name, position, company, description, alumni_order)
SELECT 
    ms.id as school_id,
    '{escape_sql_string(name)}' as name,
    '{escape_sql_string(position)}' as position,
    '' as company,
    '' as description,
    {i} as alumni_order
FROM mba_schools ms
WHERE ms.name = '{escape_sql_string(db_school_name)}';

"""
                        
                        sql_statements.append(sql)
    
    return ''.join(sql_statements)

if __name__ == "__main__":
    # Generate the complete alumni migration
    alumni_sql = generate_full_alumni_migration()
    
    # Write to file
    with open('full_alumni_migration.sql', 'w', encoding='utf-8') as f:
        f.write(f"""-- Complete Alumni Data Migration
-- Generated from CSV data with correct school names

{alumni_sql}

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
ORDER BY alumni_count DESC, ms.name;""")
    
    print("✅ Generated full_alumni_migration.sql")
    print("📊 This file contains INSERT statements for all alumni from the CSV")
    print("💾 Ready to apply to Supabase database")
    print(f"📈 Generated {len(alumni_sql.split('INSERT'))-1} INSERT statements")