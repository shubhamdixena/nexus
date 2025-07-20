-- Sample data for AI Interview System
-- This populates the database with initial school personas and question banks

-- Sample School Personas (using actual school IDs from mba_schools table)
INSERT INTO ai_interview_school_personas (
    school_id, interviewer_name, interviewer_title, tone, background,
    greeting, closing, school_context, behavioral_notes
) VALUES 
(
    '56753ca6-19ca-4c1a-ad76-8be7e4267126', -- Harvard University, Harvard Business School
    'Dr. Sarah Mitchell',
    'Senior Admissions Director',
    'warm_professional',
    'A seasoned business leader with 15 years at HBS, focusing on identifying future leaders who can create positive change.',
    'Welcome! I''m Dr. Sarah Mitchell from Harvard Business School. I''m excited to learn about your leadership journey and aspirations.',
    'Thank you for sharing your story with us. We''ll be in touch with next steps soon. Best of luck!',
    'Harvard Business School is committed to developing principled leaders who make a difference in the world. We value excellence, integrity, respect, accountability, and service.',
    'Focus on concrete examples, encourage storytelling, and probe for leadership impact.'
),
(
    '592a2b5d-bdff-4259-a191-48bda4c7a4b9', -- University of Pennsylvania, Wharton School
    'Prof. Michael Chen',
    'Admissions Committee Member',
    'analytical',
    'A finance professor and admissions committee member known for rigorous analytical thinking and global perspective.',
    'Hello, I''m Professor Chen from Wharton. Let''s explore your analytical thinking and global business perspective.',
    'Thank you for this engaging conversation. We appreciate your interest in Wharton.',
    'Wharton emphasizes analytical rigor, quantitative skills, and global citizenship. We seek leaders who can drive innovation through data-driven decision making.',
    'Ask for specific metrics and outcomes, probe analytical thinking, focus on global impact.'
),
(
    'e99a0a63-c27d-47c1-9d06-05d479478154', -- Stanford Graduate School of Business
    'Dr. Jennifer Rodriguez',
    'Admissions Associate Director',
    'innovative',
    'An entrepreneurship expert and former startup founder who values creativity and innovation.',
    'Hi there! I''m Dr. Rodriguez from Stanford Graduate School of Business. I''m looking forward to discussing your innovative ideas and entrepreneurial spirit.',
    'Thanks for the inspiring conversation! We''ll follow up soon with our decision.',
    'Stanford GSB develops leaders who change lives, change organizations, and change the world through innovation and entrepreneurship.',
    'Emphasize innovation, risk-taking, and social impact. Encourage creative thinking.'
),
(
    '868c1f8e-7657-4585-a6af-b43863a78119', -- Northwestern University, Kellogg School of Management
    'Mark Thompson',
    'Senior Admissions Manager',
    'collaborative',
    'A marketing executive turned admissions professional who values teamwork and collaboration.',
    'Hello! I''m Mark Thompson from Kellogg. I''m excited to learn about your collaborative experiences and team leadership.',
    'It''s been wonderful getting to know you. We''ll be in touch soon about next steps.',
    'Kellogg is known for its collaborative culture, marketing excellence, and team-based learning approach.',
    'Focus on teamwork, collaboration, and interpersonal skills. Ask about group experiences.'
);

-- Sample Interview Questions by School (using actual school IDs from mba_schools table)
INSERT INTO ai_interview_question_banks (
    school_id, question_text, question_category, priority
) VALUES 
-- Harvard Business School Questions
('56753ca6-19ca-4c1a-ad76-8be7e4267126', 'Tell me about a time when you had to lead a team through a significant challenge.', 'leadership', 1),
('56753ca6-19ca-4c1a-ad76-8be7e4267126', 'How do you define success, and how has that definition evolved?', 'values', 2),
('56753ca6-19ca-4c1a-ad76-8be7e4267126', 'Describe a situation where you had to influence others without formal authority.', 'influence', 3),
('56753ca6-19ca-4c1a-ad76-8be7e4267126', 'What is the most significant change you have implemented in an organization?', 'change_management', 4),
('56753ca6-19ca-4c1a-ad76-8be7e4267126', 'How do you handle ethical dilemmas in business?', 'ethics', 5),

-- Wharton School Questions  
('592a2b5d-bdff-4259-a191-48bda4c7a4b9', 'Walk me through a complex analytical problem you solved and your approach.', 'analytical', 1),
('592a2b5d-bdff-4259-a191-48bda4c7a4b9', 'How would you use data to make a strategic business decision?', 'quantitative', 2),
('592a2b5d-bdff-4259-a191-48bda4c7a4b9', 'Describe your experience working in a global or multicultural environment.', 'global', 3),
('592a2b5d-bdff-4259-a191-48bda4c7a4b9', 'Tell me about a time when you had to present financial analysis to non-financial stakeholders.', 'communication', 4),
('592a2b5d-bdff-4259-a191-48bda4c7a4b9', 'How do you stay current with global business trends?', 'awareness', 5),

-- Stanford GSB Questions
('e99a0a63-c27d-47c1-9d06-05d479478154', 'Describe an innovative solution you developed to solve a business problem.', 'innovation', 1),
('e99a0a63-c27d-47c1-9d06-05d479478154', 'Tell me about a time when you took a calculated risk. What was the outcome?', 'risk_taking', 2),
('e99a0a63-c27d-47c1-9d06-05d479478154', 'How do you approach creating social impact through business?', 'social_impact', 3),
('e99a0a63-c27d-47c1-9d06-05d479478154', 'Describe a time when you challenged the status quo.', 'disruption', 4),
('e99a0a63-c27d-47c1-9d06-05d479478154', 'What emerging technology or trend excites you most and why?', 'future_thinking', 5),

-- Kellogg School Questions
('868c1f8e-7657-4585-a6af-b43863a78119', 'Tell me about your most successful team collaboration experience.', 'teamwork', 1),
('868c1f8e-7657-4585-a6af-b43863a78119', 'How do you handle conflicts within a team?', 'conflict_resolution', 2),
('868c1f8e-7657-4585-a6af-b43863a78119', 'Describe a marketing challenge you faced and how you approached it.', 'marketing', 3),
('868c1f8e-7657-4585-a6af-b43863a78119', 'How do you build consensus among diverse stakeholders?', 'consensus_building', 4),
('868c1f8e-7657-4585-a6af-b43863a78119', 'Tell me about a time when you had to motivate an underperforming team member.', 'motivation', 5);

-- Additional Generic Questions (applicable to multiple schools)
INSERT INTO ai_interview_question_banks (
    school_id, question_text, question_category, priority
) VALUES 
('56753ca6-19ca-4c1a-ad76-8be7e4267126', 'Why do you want to pursue an MBA at this particular time in your career?', 'motivation', 6),
('592a2b5d-bdff-4259-a191-48bda4c7a4b9', 'Why do you want to pursue an MBA at this particular time in your career?', 'motivation', 6),
('e99a0a63-c27d-47c1-9d06-05d479478154', 'Why do you want to pursue an MBA at this particular time in your career?', 'motivation', 6),
('868c1f8e-7657-4585-a6af-b43863a78119', 'Why do you want to pursue an MBA at this particular time in your career?', 'motivation', 6),

('56753ca6-19ca-4c1a-ad76-8be7e4267126', 'What are your short-term and long-term career goals?', 'goals', 7),
('592a2b5d-bdff-4259-a191-48bda4c7a4b9', 'What are your short-term and long-term career goals?', 'goals', 7),
('e99a0a63-c27d-47c1-9d06-05d479478154', 'What are your short-term and long-term career goals?', 'goals', 7),
('868c1f8e-7657-4585-a6af-b43863a78119', 'What are your short-term and long-term career goals?', 'goals', 7),

('56753ca6-19ca-4c1a-ad76-8be7e4267126', 'Tell me about a time when you failed and what you learned from it.', 'failure_learning', 8),
('592a2b5d-bdff-4259-a191-48bda4c7a4b9', 'Tell me about a time when you failed and what you learned from it.', 'failure_learning', 8),
('e99a0a63-c27d-47c1-9d06-05d479478154', 'Tell me about a time when you failed and what you learned from it.', 'failure_learning', 8),
('868c1f8e-7657-4585-a6af-b43863a78119', 'Tell me about a time when you failed and what you learned from it.', 'failure_learning', 8);

-- Insert a few sample sessions for testing (optional - remove in production)
-- Note: These would normally be created by users, but included for testing purposes
-- You would need to replace 'user-uuid-here' with actual user UUIDs from your auth.users table

-- INSERT INTO ai_interview_agent_sessions (
--     id, user_id, school_id, status, started_at, completed_at, 
--     total_turns, duration_seconds, completion_percentage
-- ) VALUES 
-- ('test-session-001', 'user-uuid-here', '56753ca6-19ca-4c1a-ad76-8be7e4267126', 'completed', 
--  NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 
--  12, 1800, 100),
-- ('test-session-002', 'user-uuid-here', '592a2b5d-bdff-4259-a191-48bda4c7a4b9', 'in_progress', 
--  NOW() - INTERVAL '30 minutes', NULL, 
--  8, NULL, 67),
-- ('test-session-003', 'user-uuid-here', 'e99a0a63-c27d-47c1-9d06-05d479478154', 'completed', 
--  NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours', 
--  15, 2100, 100);
