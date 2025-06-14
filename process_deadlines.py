import pandas as pd
import re

# Read the CSV file
df = pd.read_csv('data/mba-schools-data.csv')

# Remove row 55 (IMD Business School) - note that row 55 in the data corresponds to index 54 (0-based)
df = df.drop(df.index[54])

# Function to parse application deadlines
def parse_deadlines(deadline_str):
    rounds = {'R1': None, 'R2': None, 'R3': None, 'R4': None, 'R5': None}
    
    if pd.isna(deadline_str) or deadline_str == '':
        return rounds
    
    # Handle special cases
    deadline_str = str(deadline_str)
    
    # Look for round patterns
    round_patterns = [
        r'R1:\s*([^;]+)',
        r'R2:\s*([^;]+)', 
        r'R3:\s*([^;]+)',
        r'R4:\s*([^;]+)',
        r'R5:\s*([^;]+)'
    ]
    
    for i, pattern in enumerate(round_patterns, 1):
        match = re.search(pattern, deadline_str)
        if match:
            deadline = match.group(1).strip()
            # Clean up the deadline - remove any extra text after the date
            deadline = re.sub(r'\s*\([^)]*\)', '', deadline)  # Remove parenthetical info
            deadline = re.sub(r'\s*(;.*)', '', deadline)  # Remove semicolon and anything after
            deadline = deadline.strip()
            rounds[f'R{i}'] = deadline
    
    return rounds

# Parse deadlines for each row
deadline_data = []
for _, row in df.iterrows():
    parsed = parse_deadlines(row['Application Deadlines'])
    deadline_data.append(parsed)

# Create new columns for rounds
rounds_df = pd.DataFrame(deadline_data)

# Find the index of the Application Deadlines column
deadline_col_index = df.columns.get_loc('Application Deadlines')

# Split the dataframe to insert new columns
left_part = df.iloc[:, :deadline_col_index]
right_part = df.iloc[:, deadline_col_index+1:]

# Combine with new round columns
new_df = pd.concat([left_part, rounds_df, right_part], axis=1)

# Replace empty strings with NULL values in the round columns
round_columns = ['R1', 'R2', 'R3', 'R4', 'R5']
for col in round_columns:
    new_df[col] = new_df[col].replace('', None)

# Reset index after dropping row 55
new_df = new_df.reset_index(drop=True)

# Update the row numbers in the first column
new_df.iloc[:, 0] = range(1, len(new_df) + 1)

# Save the updated CSV
new_df.to_csv('data/mba-schools-data.csv', index=False)

print("CSV file updated successfully!")
print(f"Removed row 55 (IMD Business School)")
print(f"Split Application Deadlines into separate columns: {', '.join(round_columns)}")
print(f"New CSV has {len(new_df)} rows") 