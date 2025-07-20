-- Insert sample school personas for testing
INSERT INTO ai_interview_school_personas (
    id, school_id, interviewer_name, interviewer_title, tone, background,
    greeting, closing, school_context, behavioral_notes, is_active
) VALUES 
(
    gen_random_uuid(),
    '56753ca6-19ca-4c1a-ad76-8be7e4267126', -- Harvard Business School
    'Dr. Sarah Mitchell',
    'Senior Admissions Director',
    'warm_professional',
    'A seasoned business leader with 15 years at HBS, focusing on identifying future leaders who can create positive change.',
    'Welcome! I''m Dr. Sarah Mitchell from Harvard Business School. I''m excited to learn about your leadership journey and aspirations.',
    'Thank you for sharing your story with us. We''ll be in touch with next steps soon. Best of luck!',
    'Harvard Business School is committed to developing principled leaders who make a difference in the world. We value excellence, integrity, respect, accountability, and service.',
    'Focus on concrete examples, encourage storytelling, and probe for leadership impact.',
    true
),
(
    gen_random_uuid(),
    '592a2b5d-bdff-4259-a191-48bda4c7a4b9', -- Wharton
    'Prof. Michael Chen',
    'Admissions Committee Member',
    'analytical',
    'A finance professor and admissions committee member known for rigorous analytical thinking and global perspective.',
    'Hello, I''m Professor Chen from Wharton. Let''s explore your analytical thinking and global business perspective.',
    'Thank you for this engaging conversation. We appreciate your interest in Wharton.',
    'Wharton emphasizes analytical rigor, quantitative skills, and global citizenship. We seek leaders who can drive innovation through data-driven decision making.',
    'Ask for specific metrics and outcomes, probe analytical thinking, focus on global impact.',
    true
);

-- Insert sample questions for schools
INSERT INTO ai_interview_question_banks (
    id, school_id, question_text, question_category, priority, is_active
) VALUES 
(gen_random_uuid(), '56753ca6-19ca-4c1a-ad76-8be7e4267126', 'Tell me about a time when you had to lead a team through a significant challenge.', 'leadership', 1, true),
(gen_random_uuid(), '56753ca6-19ca-4c1a-ad76-8be7e4267126', 'How do you define success, and how has that definition evolved?', 'values', 2, true),
(gen_random_uuid(), '56753ca6-19ca-4c1a-ad76-8be7e4267126', 'Describe a situation where you had to influence others without formal authority.', 'influence', 3, true),
(gen_random_uuid(), '592a2b5d-bdff-4259-a191-48bda4c7a4b9', 'Walk me through a complex analytical problem you solved and your approach.', 'analytical', 1, true),
(gen_random_uuid(), '592a2b5d-bdff-4259-a191-48bda4c7a4b9', 'How would you use data to make a strategic business decision?', 'quantitative', 2, true),
(gen_random_uuid(), '592a2b5d-bdff-4259-a191-48bda4c7a4b9', 'Describe your experience working in a global or multicultural environment.', 'global', 3, true);
