#!/usr/bin/env python3
"""
Apply all alumni migration batches to Supabase
"""

import subprocess
import json
import os

def run_supabase_sql(project_id, query):
    """Execute SQL query using Supabase CLI"""
    try:
        # Create temp file for the query
        with open('temp_query.sql', 'w') as f:
            f.write(query)
        
        # Run supabase SQL command
        cmd = f"supabase sql --project-id {project_id} --file temp_query.sql"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        
        # Clean up temp file
        os.remove('temp_query.sql')
        
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def apply_batch(project_id, batch_file):
    """Apply a single batch file"""
    print(f"Applying {batch_file}...")
    
    with open(batch_file, 'r') as f:
        query = f.read()
    
    success, stdout, stderr = run_supabase_sql(project_id, query)
    
    if success:
        print(f"✅ {batch_file} applied successfully")
        return True
    else:
        print(f"❌ Error applying {batch_file}: {stderr}")
        return False

def main():
    project_id = "jzzpnldgmhkcslbecalw"
    batch_files = [
        "alumni_migration_batch_01.sql",
        "alumni_migration_batch_02.sql", 
        "alumni_migration_batch_03.sql",
        "alumni_migration_batch_04.sql",
        "alumni_migration_batch_05.sql"
    ]
    
    print("Starting alumni migration batch application...")
    
    # Check initial count
    success, stdout, stderr = run_supabase_sql(project_id, "SELECT COUNT(*) as count FROM mba_school_alumni;")
    if success:
        print(f"Initial alumni count: {stdout.strip()}")
    
    # Apply each batch
    successful_batches = 0
    for batch_file in batch_files:
        if os.path.exists(batch_file):
            if apply_batch(project_id, batch_file):
                successful_batches += 1
        else:
            print(f"⚠️  {batch_file} not found, skipping...")
    
    # Check final count
    success, stdout, stderr = run_supabase_sql(project_id, "SELECT COUNT(*) as count FROM mba_school_alumni;")
    if success:
        print(f"Final alumni count: {stdout.strip()}")
    
    print(f"\nMigration complete! Applied {successful_batches}/{len(batch_files)} batches successfully.")

if __name__ == "__main__":
    main() 