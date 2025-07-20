-- AI Interview System Database Schema
-- This script creates the necessary tables for the AI interview system

-- AI Interview Agent Sessions table
CREATE TABLE IF NOT EXISTS ai_interview_agent_sessions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES mba_schools(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    persona_used JSONB,
    questions_context JSONB,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    total_turns INTEGER DEFAULT 0,
    duration_seconds INTEGER,
    completion_percentage INTEGER DEFAULT 0,
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Interview Conversation Turns table
CREATE TABLE IF NOT EXISTS ai_interview_conversation_turns (
    id SERIAL PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES ai_interview_agent_sessions(id) ON DELETE CASCADE,
    turn_number INTEGER NOT NULL,
    speaker TEXT NOT NULL CHECK (speaker IN ('user', 'agent', 'system')),
    message_text TEXT NOT NULL,
    message_metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, turn_number)
);

-- AI Interview Evaluations table
CREATE TABLE IF NOT EXISTS ai_interview_evaluations (
    id SERIAL PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES ai_interview_agent_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    evaluation_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id)
);

-- AI Interview School Personas table
CREATE TABLE IF NOT EXISTS ai_interview_school_personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES mba_schools(id) ON DELETE CASCADE,
    interviewer_name TEXT NOT NULL,
    interviewer_title TEXT NOT NULL,
    tone TEXT NOT NULL DEFAULT 'warm_professional',
    background TEXT,
    greeting TEXT NOT NULL,
    closing TEXT NOT NULL,
    school_context TEXT NOT NULL,
    behavioral_notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Interview Question Banks table
CREATE TABLE IF NOT EXISTS ai_interview_question_banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES mba_schools(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_category TEXT NOT NULL,
    priority INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_interview_sessions_user_id ON ai_interview_agent_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interview_sessions_school_id ON ai_interview_agent_sessions(school_id);
CREATE INDEX IF NOT EXISTS idx_ai_interview_sessions_status ON ai_interview_agent_sessions(status);
CREATE INDEX IF NOT EXISTS idx_ai_interview_sessions_created_at ON ai_interview_agent_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_interview_turns_session_id ON ai_interview_conversation_turns(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_interview_turns_timestamp ON ai_interview_conversation_turns(timestamp);

CREATE INDEX IF NOT EXISTS idx_ai_interview_evaluations_user_id ON ai_interview_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interview_evaluations_session_id ON ai_interview_evaluations(session_id);

CREATE INDEX IF NOT EXISTS idx_ai_interview_personas_school_id ON ai_interview_school_personas(school_id);
CREATE INDEX IF NOT EXISTS idx_ai_interview_personas_active ON ai_interview_school_personas(is_active);

CREATE INDEX IF NOT EXISTS idx_ai_interview_questions_school_id ON ai_interview_question_banks(school_id);
CREATE INDEX IF NOT EXISTS idx_ai_interview_questions_active ON ai_interview_question_banks(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_interview_questions_priority ON ai_interview_question_banks(priority);

-- Row Level Security (RLS) policies
ALTER TABLE ai_interview_agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interview_conversation_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interview_evaluations ENABLE ROW LEVEL SECURITY;

-- Policies for ai_interview_agent_sessions
CREATE POLICY "Users can view their own interview sessions" ON ai_interview_agent_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interview sessions" ON ai_interview_agent_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview sessions" ON ai_interview_agent_sessions
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies for ai_interview_conversation_turns
CREATE POLICY "Users can view conversation turns for their sessions" ON ai_interview_conversation_turns
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ai_interview_agent_sessions 
            WHERE id = session_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert conversation turns for their sessions" ON ai_interview_conversation_turns
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM ai_interview_agent_sessions 
            WHERE id = session_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete conversation turns for their sessions" ON ai_interview_conversation_turns
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM ai_interview_agent_sessions 
            WHERE id = session_id AND user_id = auth.uid()
        )
    );

-- Policies for ai_interview_evaluations
CREATE POLICY "Users can view their own evaluations" ON ai_interview_evaluations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own evaluations" ON ai_interview_evaluations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own evaluations" ON ai_interview_evaluations
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Public read access for school personas and questions (they are reference data)
CREATE POLICY "Anyone can read active school personas" ON ai_interview_school_personas
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can read active interview questions" ON ai_interview_question_banks
    FOR SELECT USING (is_active = true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update the updated_at column
CREATE TRIGGER update_ai_interview_sessions_updated_at 
    BEFORE UPDATE ON ai_interview_agent_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_interview_evaluations_updated_at 
    BEFORE UPDATE ON ai_interview_evaluations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_interview_personas_updated_at 
    BEFORE UPDATE ON ai_interview_school_personas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_interview_questions_updated_at 
    BEFORE UPDATE ON ai_interview_question_banks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
