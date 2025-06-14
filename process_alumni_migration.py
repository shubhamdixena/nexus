#!/usr/bin/env python3
"""
Process the full alumni migration file and apply it to Supabase in chunks
"""

import re
import sys

def read_migration_file(filename):
    """Read the migration file and extract INSERT statements"""
    with open(filename, 'r') as f:
        content = f.read()
    
    # Split by INSERT statements
    insert_statements = []
    current_statement = ""
    lines = content.split('\n')
    
    for line in lines:
        if line.strip().startswith('INSERT INTO mba_school_alumni'):
            if current_statement:
                insert_statements.append(current_statement.strip())
            current_statement = line + '\n'
        elif current_statement and line.strip():
            current_statement += line + '\n'
        elif current_statement and not line.strip():
            # End of statement
            insert_statements.append(current_statement.strip())
            current_statement = ""
    
    # Add the last statement if exists
    if current_statement:
        insert_statements.append(current_statement.strip())
    
    return insert_statements

def create_batch_migration(statements, batch_size=50):
    """Create batched migration SQL"""
    batches = []
    for i in range(0, len(statements), batch_size):
        batch = statements[i:i+batch_size]
        # Add ON CONFLICT DO NOTHING to each statement to avoid duplicates
        modified_batch = []
        for stmt in batch:
            if 'ON CONFLICT DO NOTHING' not in stmt:
                stmt = stmt.rstrip(';') + '\nON CONFLICT DO NOTHING;'
            modified_batch.append(stmt)
        batches.append('\n\n'.join(modified_batch))
    return batches

if __name__ == "__main__":
    # Read and process the migration file
    statements = read_migration_file('full_alumni_migration.sql')
    print(f"Found {len(statements)} INSERT statements")
    
    # Create batches of 50 statements each
    batches = create_batch_migration(statements, 50)
    print(f"Created {len(batches)} batches")
    
    # Write each batch to a separate file
    for i, batch in enumerate(batches):
        filename = f"alumni_migration_batch_{i+1:02d}.sql"
        with open(filename, 'w') as f:
            f.write(batch)
        print(f"Created {filename}") 