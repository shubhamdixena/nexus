# Analytics System Setup

## Step 1: Apply User Activity Logs Migration

You need to apply the migration file: `supabase/migrations/create_user_activity_logs.sql`

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `supabase/migrations/create_user_activity_logs.sql`
3. Execute the migration

## Step 2: What This Migration Creates

### Tables:
- `user_activity_logs` - Stores all user actions for analytics

### Database Functions:
- `get_activity_analytics(days)` - Main analytics function used by admin dashboard
- `get_user_activity_summary(user_id, days)` - Individual user analytics
- `cleanup_old_activity_logs()` - Maintenance function

### Features Enabled:
- User activity tracking
- Daily/hourly activity trends  
- Top actions and resources analytics
- User engagement metrics
- Activity distribution charts

## Step 3: Verify Installation

After applying the migration, test with:

```sql
-- Test the analytics function
SELECT * FROM get_activity_analytics(30);

-- Check if table was created
SELECT * FROM user_activity_logs LIMIT 5;
```

## Current Status
✅ Data Correction System - Ready to deploy (`safe_data_corrections_migration.sql`)
🔧 Analytics System - Migration available (`create_user_activity_logs.sql`)
🔍 Real-time Features - Needs Supabase configuration review