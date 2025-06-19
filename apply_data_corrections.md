# Data Corrections System Setup

## Step 1: Apply Migration via Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `safe_data_corrections_migration.sql`
4. Execute the migration

## Step 2: Verify Installation

```sql
-- Check if tables were created
SELECT 
    schemaname, 
    tablename, 
    tableowner 
FROM pg_tables 
WHERE tablename LIKE '%data_correction%' 
ORDER BY tablename;
```

Expected tables:
- `data_correction_reports`
- `data_correction_analytics` 
- `data_correction_history`

## Step 3: Test the Component

Visit your admin dashboard at `/settings` and check the "Data Corrections" section.

## Migration Contents Overview

The migration creates:
- **Reports Table**: Stores user-reported data issues
- **Analytics Table**: Tracks frequently reported issues
- **History Table**: Logs all admin actions
- **RLS Policies**: Proper security for user/admin access
- **Triggers**: Auto-updates for timestamps and analytics
- **Indexes**: Performance optimization