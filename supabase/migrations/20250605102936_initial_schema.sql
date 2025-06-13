-- Create "profiles" table
CREATE TABLE profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    email text UNIQUE NOT NULL,
    first_name text,
    last_name text,
    phone text,
    date_of_birth date,
    nationality text,
    bio text,
    linkedin_url text,
    avatar_url text,
    highest_degree text,
    field_of_study text,
    university text,
    graduation_year integer,
    gpa numeric,
    test_scores jsonb,
    target_degree text,
    target_programs text[],
    career_objective text,
    work_experience_category text,
    preferred_countries text[],
    industry_interests text[],
    career_level text,
    budget_range text,
    start_date date,
    scholarship_interest boolean,
    accommodation_preference text,
    communication_preferences text[],
    profile_completed boolean DEFAULT FALSE,
    profile_completion_percentage integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profiles" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profiles" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create "universities" table
CREATE TABLE universities (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    location text NOT NULL,
    country text NOT NULL,
    ranking text,
    programs text[],
    website text,
    description text,
    logo_url text,
    established_year integer,
    student_count integer,
    acceptance_rate numeric,
    tuition_fees text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE universities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable public read access for universities" ON universities FOR SELECT USING (true);
CREATE POLICY "Admins can insert universities" ON universities FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update universities" ON universities FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete universities" ON universities FOR DELETE USING (auth.role() = 'authenticated');

-- Create "mba_schools" table
CREATE TABLE mba_schools (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    location text NOT NULL,
    country text NOT NULL,
    ranking integer,
    duration text,
    tuition text,
    total_cost text,
    description text,
    website text,
    university_id uuid REFERENCES universities(id),
    category text,
    specializations text[],
    program_duration text,
    avg_gmat integer,
    avg_work_experience text,
    acceptance_rate numeric,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE mba_schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable public read access for mba_schools" ON mba_schools FOR SELECT USING (true);
CREATE POLICY "Admins can insert mba_schools" ON mba_schools FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update mba_schools" ON mba_schools FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete mba_schools" ON mba_schools FOR DELETE USING (auth.role() = 'authenticated');

-- Create "scholarships" table
CREATE TABLE scholarships (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    organization text NOT NULL,
    country text NOT NULL,
    amount text NOT NULL,
    deadline date,
    degree text,
    field text,
    status text DEFAULT 'active',
    apply_url text,
    official_url text,
    scholarship_type text,
    eligibility_criteria text,
    application_process text,
    coverage_details text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable public read access for scholarships" ON scholarships FOR SELECT USING (true);
CREATE POLICY "Admins can insert scholarships" ON scholarships FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update scholarships" ON scholarships FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete scholarships" ON scholarships FOR DELETE USING (auth.role() = 'authenticated');

-- Create "applications" table
CREATE TABLE applications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    university_id uuid REFERENCES universities(id),
    student_name text NOT NULL,
    email text NOT NULL,
    school text NOT NULL,
    program text NOT NULL,
    status text DEFAULT 'pending' NOT NULL,
    submitted_date date,
    program_name text,
    application_type text,
    application_deadline date,
    submitted_at timestamp with time zone,
    decision_date date,
    notes text,
    documents_data jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own applications" ON applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own applications" ON applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own applications" ON applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own applications" ON applications FOR DELETE USING (auth.uid() = user_id);

-- Create "documents" table
CREATE TABLE documents (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    file_path text,
    file_url text,
    size integer,
    status text DEFAULT 'uploaded' NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents" ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own documents" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own documents" ON documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own documents" ON documents FOR DELETE USING (auth.uid() = user_id);

-- Create "sops" table
CREATE TABLE sops (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    university text NOT NULL,
    program text NOT NULL,
    author text NOT NULL,
    field text NOT NULL,
    country text NOT NULL,
    status text DEFAULT 'draft' NOT NULL,
    content text,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    university_id uuid REFERENCES universities(id),
    title text,
    word_count integer,
    version integer DEFAULT 1,
    feedback text,
    sop_status text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE sops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sops" ON sops FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sops" ON sops FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sops" ON sops FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sops" ON sops FOR DELETE USING (auth.uid() = user_id);

