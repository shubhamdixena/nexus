# Real-time Features Setup

## Current Status
✅ Real-time service classes implemented
✅ Subscription management with leak prevention  
✅ Connection pooling and error handling
🔧 **NEEDS**: Supabase realtime publication setup

## Step 1: Enable Realtime in Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to Database → Replication
3. Enable realtime for these tables:

### Critical Tables for Admin Dashboard:
```sql
-- Enable realtime for user management
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE user_activity_logs;

-- Enable realtime for data corrections  
ALTER PUBLICATION supabase_realtime ADD TABLE data_correction_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE data_correction_analytics;
ALTER PUBLICATION supabase_realtime ADD TABLE data_correction_history;

-- Enable realtime for content management
ALTER PUBLICATION supabase_realtime ADD TABLE mba_schools;
ALTER PUBLICATION supabase_realtime ADD TABLE universities;
ALTER PUBLICATION supabase_realtime ADD TABLE scholarships;
ALTER PUBLICATION supabase_realtime ADD TABLE applications;

-- Enable realtime for system settings
ALTER PUBLICATION supabase_realtime ADD TABLE system_settings;
```

## Step 2: Test Real-time Functionality

After enabling, test these features:

### In Admin Dashboard:
- User management updates
- Data correction notifications
- System settings changes
- Content updates (schools, scholarships)

### In User Interface:
- Live bookmark updates
- Real-time deadline notifications
- Activity feed updates

## Step 3: Verify Realtime Health

Use the existing health check: `/supabase-health`

## Alternative: SQL Command Method

If you prefer SQL commands over the dashboard:

```sql
-- Check current publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Add tables to publication
ALTER PUBLICATION supabase_realtime ADD TABLE data_correction_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE user_activity_logs;
-- ... (add all tables above)
```

## Current Realtime Services Ready:
- 📊 Analytics Dashboard
- 👥 User Management  
- 🔧 Data Corrections
- 🏫 Schools Management
- 🎓 Scholarships
- 📋 Applications
- ⚙️ System Settings