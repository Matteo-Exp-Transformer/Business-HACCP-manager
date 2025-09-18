-- HACCP Business Manager - Row Level Security Policies
-- This file sets up RLS policies for multi-tenant data isolation

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

-- Helper function to get current user's company_id from JWT
CREATE OR REPLACE FUNCTION auth.get_user_company_id()
RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() ->> 'company_id')::UUID,
    (
      SELECT company_id 
      FROM users 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
      LIMIT 1
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    auth.jwt() ->> 'role',
    (
      SELECT role 
      FROM users 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
      LIMIT 1
    ),
    'employee'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.get_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is manager or above
CREATE OR REPLACE FUNCTION auth.is_manager_or_above()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.get_user_role() IN ('admin', 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Companies table policies
CREATE POLICY "Users can view their own company" ON companies
  FOR SELECT USING (id = auth.get_user_company_id());

CREATE POLICY "Admins can update their company" ON companies
  FOR UPDATE USING (id = auth.get_user_company_id() AND auth.is_admin());

-- Users table policies
CREATE POLICY "Users can view users in their company" ON users
  FOR SELECT USING (company_id = auth.get_user_company_id());

CREATE POLICY "Admins can manage users in their company" ON users
  FOR ALL USING (company_id = auth.get_user_company_id() AND auth.is_admin());

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (
    clerk_user_id = auth.jwt() ->> 'sub' AND 
    company_id = auth.get_user_company_id()
  );

-- Departments table policies
CREATE POLICY "Users can view departments in their company" ON departments
  FOR SELECT USING (company_id = auth.get_user_company_id());

CREATE POLICY "Admins can manage departments in their company" ON departments
  FOR ALL USING (company_id = auth.get_user_company_id() AND auth.is_admin());

-- Conservation points table policies
CREATE POLICY "Users can view conservation points in their company" ON conservation_points
  FOR SELECT USING (company_id = auth.get_user_company_id());

CREATE POLICY "Managers can manage conservation points in their company" ON conservation_points
  FOR ALL USING (company_id = auth.get_user_company_id() AND auth.is_manager_or_above());

-- Products table policies
CREATE POLICY "Users can view products in their company" ON products
  FOR SELECT USING (company_id = auth.get_user_company_id());

CREATE POLICY "Users can manage products in their company" ON products
  FOR ALL USING (company_id = auth.get_user_company_id());

-- Tasks table policies
CREATE POLICY "Users can view tasks in their company" ON tasks
  FOR SELECT USING (company_id = auth.get_user_company_id());

CREATE POLICY "Managers can manage tasks in their company" ON tasks
  FOR ALL USING (company_id = auth.get_user_company_id() AND auth.is_manager_or_above());

-- Task completions table policies
CREATE POLICY "Users can view task completions in their company" ON task_completions
  FOR SELECT USING (company_id = auth.get_user_company_id());

CREATE POLICY "Users can create task completions in their company" ON task_completions
  FOR INSERT WITH CHECK (company_id = auth.get_user_company_id());

CREATE POLICY "Users can update their own task completions" ON task_completions
  FOR UPDATE USING (
    company_id = auth.get_user_company_id() AND
    completed_by_user_id = (
      SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub' LIMIT 1
    )
  );

-- Temperature readings table policies
CREATE POLICY "Users can view temperature readings in their company" ON temperature_readings
  FOR SELECT USING (company_id = auth.get_user_company_id());

CREATE POLICY "Users can create temperature readings in their company" ON temperature_readings
  FOR INSERT WITH CHECK (company_id = auth.get_user_company_id());

CREATE POLICY "Users can update their own temperature readings" ON temperature_readings
  FOR UPDATE USING (
    company_id = auth.get_user_company_id() AND
    recorded_by_user_id = (
      SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub' LIMIT 1
    )
  );

-- Non-conformities table policies
CREATE POLICY "Users can view non-conformities in their company" ON non_conformities
  FOR SELECT USING (company_id = auth.get_user_company_id());

CREATE POLICY "Users can create non-conformities in their company" ON non_conformities
  FOR INSERT WITH CHECK (company_id = auth.get_user_company_id());

CREATE POLICY "Managers can manage non-conformities in their company" ON non_conformities
  FOR ALL USING (company_id = auth.get_user_company_id() AND auth.is_manager_or_above());

-- Notes table policies
CREATE POLICY "Users can view notes in their company" ON notes
  FOR SELECT USING (company_id = auth.get_user_company_id());

CREATE POLICY "Users can create notes in their company" ON notes
  FOR INSERT WITH CHECK (company_id = auth.get_user_company_id());

CREATE POLICY "Users can update their own notes" ON notes
  FOR UPDATE USING (
    company_id = auth.get_user_company_id() AND
    created_by_user_id = (
      SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub' LIMIT 1
    )
  );

-- Audit logs table policies (read-only for users)
CREATE POLICY "Managers can view audit logs in their company" ON audit_logs
  FOR SELECT USING (company_id = auth.get_user_company_id() AND auth.is_manager_or_above());

-- Exports table policies
CREATE POLICY "Users can view their own exports" ON exports
  FOR SELECT USING (
    company_id = auth.get_user_company_id() AND
    created_by_user_id = (
      SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub' LIMIT 1
    )
  );

CREATE POLICY "Managers can view all exports in their company" ON exports
  FOR SELECT USING (company_id = auth.get_user_company_id() AND auth.is_manager_or_above());

CREATE POLICY "Users can create exports in their company" ON exports
  FOR INSERT WITH CHECK (company_id = auth.get_user_company_id());

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert audit log for all operations except audit_logs table itself
  IF TG_TABLE_NAME != 'audit_logs' THEN
    INSERT INTO audit_logs (
      company_id,
      user_id,
      action,
      table_name,
      record_id,
      old_values,
      new_values,
      ip_address,
      metadata
    ) VALUES (
      COALESCE(NEW.company_id, OLD.company_id),
      (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub' LIMIT 1),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
      CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
      inet_client_addr(),
      jsonb_build_object('timestamp', NOW(), 'operation', TG_OP)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to all tables (except audit_logs)
CREATE TRIGGER audit_companies AFTER INSERT OR UPDATE OR DELETE ON companies
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_departments AFTER INSERT OR UPDATE OR DELETE ON departments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_conservation_points AFTER INSERT OR UPDATE OR DELETE ON conservation_points
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_products AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_tasks AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_task_completions AFTER INSERT OR UPDATE OR DELETE ON task_completions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_temperature_readings AFTER INSERT OR UPDATE OR DELETE ON temperature_readings
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_non_conformities AFTER INSERT OR UPDATE OR DELETE ON non_conformities
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_notes AFTER INSERT OR UPDATE OR DELETE ON notes
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_exports AFTER INSERT OR UPDATE OR DELETE ON exports
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();