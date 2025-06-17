-- Fix admin permissions for data editing in correction system
-- Apply this to your Supabase database via the SQL Editor

-- 1. Check if admin policies exist for mba_schools table
-- First, let's see what policies currently exist
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename IN ('mba_schools', 'universities', 'scholarships')
ORDER BY tablename, policyname;

-- 2. Grant admin edit permissions for mba_schools table
-- Drop existing admin policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Admins can edit mba_schools" ON public.mba_schools;
DROP POLICY IF EXISTS "Admins can update mba_schools" ON public.mba_schools;
DROP POLICY IF EXISTS "Admin full access to mba_schools" ON public.mba_schools;

-- Create comprehensive admin policy for mba_schools
CREATE POLICY "Admin full access to mba_schools" ON public.mba_schools
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- 3. Grant admin edit permissions for universities table
DROP POLICY IF EXISTS "Admins can edit universities" ON public.universities;
DROP POLICY IF EXISTS "Admins can update universities" ON public.universities;
DROP POLICY IF EXISTS "Admin full access to universities" ON public.universities;

CREATE POLICY "Admin full access to universities" ON public.universities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- 4. Grant admin edit permissions for scholarships table
DROP POLICY IF EXISTS "Admins can edit scholarships" ON public.scholarships;
DROP POLICY IF EXISTS "Admins can update scholarships" ON public.scholarships;
DROP POLICY IF EXISTS "Admin full access to scholarships" ON public.scholarships;

CREATE POLICY "Admin full access to scholarships" ON public.scholarships
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- 5. Ensure profiles table has proper admin detection
-- Check if we need to add role column to profiles
DO $$
BEGIN
    -- Check if role column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'role'
    ) THEN
        -- Add role column if it doesn't exist
        ALTER TABLE profiles ADD COLUMN role VARCHAR(20) DEFAULT 'user';
        
        -- Create index for performance
        CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
        
        -- Add constraint
        ALTER TABLE profiles ADD CONSTRAINT check_role 
        CHECK (role IN ('user', 'admin', 'super_admin'));
    END IF;
END
$$;

-- 6. Grant direct table permissions to authenticated users (needed for admin updates)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mba_schools TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.universities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scholarships TO authenticated;

-- 7. Verify admin user has correct role
-- This will show all users and their roles
SELECT 
    u.id,
    u.email,
    p.role,
    p.first_name,
    p.last_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email_confirmed_at IS NOT NULL
ORDER BY p.role DESC, u.email;

-- 8. Function to set user as admin (run this for your admin account)
CREATE OR REPLACE FUNCTION set_user_as_admin(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    user_id UUID;
    result_text TEXT;
BEGIN
    -- Find user by email
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RETURN 'User not found with email: ' || user_email;
    END IF;
    
    -- Update or insert profile with admin role
    INSERT INTO profiles (id, role, updated_at)
    VALUES (user_id, 'admin', now())
    ON CONFLICT (id) 
    DO UPDATE SET 
        role = 'admin',
        updated_at = now();
    
    result_text := 'User ' || user_email || ' has been set as admin';
    RETURN result_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Make yourself an admin (replace with your actual email)
-- Uncomment and update the email below:
-- SELECT set_user_as_admin('your-email@example.com');

-- 10. Test admin permissions
-- This should return true if you're properly set as admin
SELECT 
    auth.uid() as current_user_id,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        ) THEN 'Admin access: YES'
        ELSE 'Admin access: NO'
    END as admin_status;