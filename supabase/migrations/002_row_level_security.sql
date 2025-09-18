-- HACCP Business Manager - Row Level Security Policies
-- Version: 1.0
-- Description: RLS policies for multi-tenant data isolation and role-based access

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conservation_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE temperature_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE non_conformities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's company_id
CREATE OR REPLACE FUNCTION auth.company_id() 
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT company_id 
    FROM public.users 
    WHERE clerk_id = auth.jwt() ->> 'sub'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION auth.user_role() 
RETURNS user_role AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.users 
    WHERE clerk_id = auth.jwt() ->> 'sub'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin or manager
CREATE OR REPLACE FUNCTION auth.is_admin_or_manager() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.user_role() IN ('admin', 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Companies policies
CREATE POLICY "Users can view their own company" ON companies
    FOR SELECT USING (id = auth.company_id());

CREATE POLICY "Only admins can update company info" ON companies
    FOR UPDATE USING (id = auth.company_id() AND auth.user_role() = 'admin');

-- Users policies
CREATE POLICY "Users can view colleagues in same company" ON users
    FOR SELECT USING (company_id = auth.company_id());

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (
        company_id = auth.company_id() 
        AND clerk_id = auth.jwt() ->> 'sub'
    );

CREATE POLICY "Admins can insert new users" ON users
    FOR INSERT WITH CHECK (
        company_id = auth.company_id() 
        AND auth.user_role() = 'admin'
    );

CREATE POLICY "Admins can update any user in company" ON users
    FOR UPDATE USING (
        company_id = auth.company_id() 
        AND auth.user_role() = 'admin'
    );

-- Departments policies
CREATE POLICY "All users can view departments" ON departments
    FOR SELECT USING (company_id = auth.company_id());

CREATE POLICY "Admin/Manager can manage departments" ON departments
    FOR ALL USING (
        company_id = auth.company_id() 
        AND auth.is_admin_or_manager()
    );

-- Conservation points policies
CREATE POLICY "All users can view conservation points" ON conservation_points
    FOR SELECT USING (company_id = auth.company_id());

CREATE POLICY "Admin/Manager can manage conservation points" ON conservation_points
    FOR ALL USING (
        company_id = auth.company_id() 
        AND auth.is_admin_or_manager()
    );

-- Products policies
CREATE POLICY "All users can view products" ON products
    FOR SELECT USING (company_id = auth.company_id());

CREATE POLICY "All users can insert products" ON products
    FOR INSERT WITH CHECK (company_id = auth.company_id());

CREATE POLICY "Users can update products" ON products
    FOR UPDATE USING (company_id = auth.company_id());

CREATE POLICY "Admin/Manager can delete products" ON products
    FOR DELETE USING (
        company_id = auth.company_id() 
        AND auth.is_admin_or_manager()
    );

-- Tasks policies
CREATE POLICY "All users can view tasks" ON tasks
    FOR SELECT USING (company_id = auth.company_id());

CREATE POLICY "Admin/Manager can manage tasks" ON tasks
    FOR ALL USING (
        company_id = auth.company_id() 
        AND auth.is_admin_or_manager()
    );

-- Task completions policies
CREATE POLICY "All users can view task completions" ON task_completions
    FOR SELECT USING (company_id = auth.company_id());

CREATE POLICY "All users can complete tasks" ON task_completions
    FOR INSERT WITH CHECK (company_id = auth.company_id());

-- Temperature readings policies
CREATE POLICY "All users can view temperature readings" ON temperature_readings
    FOR SELECT USING (company_id = auth.company_id());

CREATE POLICY "All users can record temperatures" ON temperature_readings
    FOR INSERT WITH CHECK (company_id = auth.company_id());

-- Non-conformities policies
CREATE POLICY "All users can view non-conformities" ON non_conformities
    FOR SELECT USING (company_id = auth.company_id());

CREATE POLICY "All users can report non-conformities" ON non_conformities
    FOR INSERT WITH CHECK (company_id = auth.company_id());

CREATE POLICY "Admin/Manager can update non-conformities" ON non_conformities
    FOR UPDATE USING (
        company_id = auth.company_id() 
        AND auth.is_admin_or_manager()
    );

-- Notes policies
CREATE POLICY "All users can view notes" ON notes
    FOR SELECT USING (company_id = auth.company_id());

CREATE POLICY "All users can create notes" ON notes
    FOR INSERT WITH CHECK (company_id = auth.company_id());

CREATE POLICY "Users can update their own notes" ON notes
    FOR UPDATE USING (
        company_id = auth.company_id() 
        AND author_id = (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub')
    );

CREATE POLICY "Admin/Manager can delete notes" ON notes
    FOR DELETE USING (
        company_id = auth.company_id() 
        AND auth.is_admin_or_manager()
    );

-- Audit logs policies
CREATE POLICY "Admin/Manager can view audit logs" ON audit_logs
    FOR SELECT USING (
        company_id = auth.company_id() 
        AND auth.is_admin_or_manager()
    );

CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (company_id = auth.company_id());

-- Exports policies
CREATE POLICY "Users can view exports" ON exports
    FOR SELECT USING (company_id = auth.company_id());

CREATE POLICY "Admin/Manager can create exports" ON exports
    FOR INSERT WITH CHECK (
        company_id = auth.company_id() 
        AND auth.is_admin_or_manager()
    );

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;