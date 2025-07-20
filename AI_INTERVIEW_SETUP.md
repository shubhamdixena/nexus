# AI Interview System - Setup and Troubleshooting Guide

## Overview
This document provides step-by-step instructions for setting up and troubleshooting the AI Interview system that was implemented to address the critical issues identified in the codebase.

## 🔧 Issues Fixed

### 1. Database Schema Mismatch ✅
- **Problem**: Frontend API used `ai_interview_transcripts` table, but backend used `ai_interview_conversation_turns`
- **Solution**: Updated all API routes to use the correct `ai_interview_conversation_turns` table schema
- **Files Changed**: 
  - `/app/api/ai-interview-adk/transcript/route.ts`
  - All transcript-related API endpoints

### 2. Empty Core Components ✅
- **Problem**: Critical components were completely empty
- **Solution**: Implemented full functionality for all core components
- **Files Created**:
  - `components/ai-interview-session.tsx` - Main interview interface
  - `components/ai-interview-evaluation.tsx` - Evaluation and results display
  - `components/admin-interview-dashboard.tsx` - Admin monitoring dashboard
  - `lib/ai-interview-service.ts` - Business logic service layer

### 3. API Route Conflicts ✅
- **Problem**: Two sets of API routes existed (empty vs functional)
- **Solution**: Consolidated to single functional API set and implemented missing routes
- **Files Updated**:
  - `/app/api/ai-interview/session/route.ts` - Session management
  - `/app/api/ai-interview/transcript/route.ts` - Transcript handling
  - `/app/api/ai-interview-adk/evaluation/route.ts` - Evaluation processing

### 4. Configuration Management ✅
- **Problem**: Hardcoded URLs and inconsistent configuration
- **Solution**: Created centralized configuration service
- **Files Created**:
  - `lib/ai-interview-config.ts` - Configuration management
  - `.env.example` - Environment variables template

### 5. Database Schema & Types ✅
- **Problem**: Missing database schema and type definitions
- **Solution**: Created complete schema and shared types
- **Files Created**:
  - `types/ai-interview.ts` - Shared TypeScript types
  - `supabase/migrations/20250117000001_ai_interview_schema.sql` - Database schema
  - `supabase/migrations/20250117000002_ai_interview_sample_data.sql` - Sample data

### 6. Python Agent Fixes ✅
- **Problem**: Incorrect persona configuration and database connection
- **Solution**: Fixed persona injection and improved database handling
- **Files Updated**:
  - `mba-interview-agent/app/server.py` - Fixed persona configuration and DB connection

## 🚀 Setup Instructions

### 1. Environment Configuration

1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. Fill in your actual values in `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_PASSWORD=your-database-password

# AI Interview Agent Configuration
NEXT_PUBLIC_AGENT_WS_URL=wss://your-agent-service.a.run.app/ws
```

### 2. Database Setup

1. Run the database migrations in Supabase:
```sql
-- Execute in Supabase SQL Editor
\i supabase/migrations/20250117000001_ai_interview_schema.sql
\i supabase/migrations/20250117000002_ai_interview_sample_data.sql
```

2. Verify tables are created:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'ai_interview%';
```

### 3. Python Agent Setup

1. Navigate to the agent directory:
```bash
cd mba-interview-agent
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set environment variables for the Python agent:
```bash
export GOOGLE_CLOUD_PROJECT=your-project-id
export NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_DB_PASSWORD=your-database-password
export GOOGLE_API_KEY=your-gemini-api-key
```

4. Run the agent locally:
```bash
python -m uvicorn app.server:app --host 0.0.0.0 --port 8000
```

### 4. Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Access the application:
- Main app: http://localhost:3000
- AI Interview: http://localhost:3000/ai-interview

## 🧪 Testing the System

### 1. End-to-End Test Flow

1. **Start the Python Agent** (locally or deployed)
2. **Create a New Interview Session**:
   - Navigate to AI Interview page
   - Select a school (Harvard, Wharton, Stanford, or Kellogg)
   - Click "Start Interview"

3. **Test Connection**:
   - System should try localhost:8000 first, then fallback to cloud URL
   - Connection status should show "Connected"

4. **Conduct Interview**:
   - Speak or type responses
   - Verify transcript updates in real-time
   - Check that conversation is saved to database

5. **Complete Interview**:
   - End the session
   - Verify evaluation is generated
   - Check results display

### 2. Database Verification

```sql
-- Check session creation
SELECT * FROM ai_interview_agent_sessions ORDER BY created_at DESC LIMIT 5;

-- Check conversation turns
SELECT * FROM ai_interview_conversation_turns 
WHERE session_id = 'your-session-id' 
ORDER BY turn_number;

-- Check evaluations
SELECT * FROM ai_interview_evaluations ORDER BY created_at DESC LIMIT 5;
```

### 3. API Testing

Test the APIs directly:

```bash
# Test session creation
curl -X POST http://localhost:3000/api/ai-interview-adk/session \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-123","schoolId":"harvard-business-school","status":"pending"}'

# Test transcript saving
curl -X POST http://localhost:3000/api/ai-interview-adk/transcript \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-123","speaker":"user","text":"Hello","timestamp":"2025-01-17T10:00:00Z"}'
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
**Symptoms**: Python agent crashes on startup with database connection error
**Solutions**:
- Verify `SUPABASE_DB_PASSWORD` is correct
- Check `NEXT_PUBLIC_SUPABASE_URL` format
- Ensure Supabase project allows external connections
- Test connection string manually

#### 2. WebSocket Connection Failed
**Symptoms**: Frontend shows "Failed to connect to interview service"
**Solutions**:
- Verify Python agent is running on port 8000
- Check firewall settings
- Confirm WebSocket URLs in environment variables
- Test WebSocket endpoint directly

#### 3. Authentication Errors
**Symptoms**: API returns 401 Unauthorized
**Solutions**:
- Verify user is logged in
- Check Supabase auth configuration
- Confirm API key permissions
- Test auth token validity

#### 4. Transcript Not Saving
**Symptoms**: Conversation appears in UI but not in database
**Solutions**:
- Check database table exists: `ai_interview_conversation_turns`
- Verify RLS policies allow user access
- Check API logs for errors
- Confirm session ID exists

#### 5. Persona Not Loading
**Symptoms**: Agent uses default persona instead of school-specific one
**Solutions**:
- Verify school personas exist in database
- Check school ID mapping
- Confirm agent persona configuration logic
- Test persona API endpoints

### Debug Commands

```bash
# Check Python agent logs
python -m uvicorn app.server:app --host 0.0.0.0 --port 8000 --log-level debug

# Test WebSocket connection
wscat -c ws://localhost:8000/ws

# Check Next.js logs
npm run dev

# Test database connection
psql "postgresql://postgres:password@db.your-project.supabase.co:5432/postgres"
```

### Performance Monitoring

1. **Monitor WebSocket Connections**:
   - Check connection stability
   - Monitor reconnection attempts
   - Track message throughput

2. **Database Performance**:
   - Monitor query execution times
   - Check connection pool usage
   - Track table sizes

3. **API Response Times**:
   - Monitor endpoint response times
   - Check error rates
   - Track concurrent users

## 📈 Production Deployment

### 1. Python Agent Deployment
Deploy to Cloud Run or similar service:
```bash
gcloud run deploy ai-interview-agent \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### 2. Environment Variables
Set production environment variables:
- Update `NEXT_PUBLIC_AGENT_WS_URL` to production URL
- Configure proper database connections
- Set appropriate timeouts and limits

### 3. Database Migrations
Run migrations in production:
```bash
supabase db push
```

### 4. Security Considerations
- Enable proper RLS policies
- Configure CORS for WebSocket
- Use service accounts for Python agent
- Secure API endpoints

## 🔍 System Architecture

```
Frontend (Next.js)
├── AI Interview Session Component
├── Configuration Service
├── Interview Service Layer
└── API Routes

Backend (Python Agent)
├── WebSocket Server
├── Persona Configuration
├── Gemini Live API Integration
└── Database Operations

Database (Supabase)
├── Sessions Table
├── Conversation Turns Table
├── Evaluations Table
├── School Personas Table
└── Question Banks Table
```

## 📚 Additional Resources

- [Gemini Live API Documentation](https://cloud.google.com/vertex-ai/docs/generative-ai/multimodal/live-api)
- [Supabase Real-time Documentation](https://supabase.com/docs/guides/realtime)
- [WebSocket API Reference](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## 🆘 Support

If you encounter issues not covered in this guide:

1. Check the browser console for errors
2. Review Python agent logs
3. Verify database schema and data
4. Test individual components in isolation
5. Create a minimal reproduction case

The system is now properly structured with:
- ✅ Consistent database schema
- ✅ Proper error handling and fallbacks
- ✅ Centralized configuration management
- ✅ Real-time transcript display
- ✅ Functional evaluation system
- ✅ Admin monitoring dashboard
- ✅ Shared TypeScript types
- ✅ Complete API implementation
