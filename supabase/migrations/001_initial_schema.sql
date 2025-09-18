-- HACCP Business Manager - Initial Database Schema
-- This file contains the complete database schema for the application
-- Run this in Supabase SQL Editor to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create companies table for multi-tenancy
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  vat_number TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table (integrates with Clerk)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'employee', 'collaborator')),
  department_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create departments table
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, name)
);

-- Add foreign key constraint to users table
ALTER TABLE users ADD CONSTRAINT fk_users_department 
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- Create conservation_points table
CREATE TABLE conservation_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ambiente', 'frigorifero', 'freezer', 'abbattitore')),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  target_temperature_min DECIMAL(4,1),
  target_temperature_max DECIMAL(4,1),
  product_categories TEXT[],
  location TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  maintenance_schedule JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, name)
);

-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  conservation_point_id UUID REFERENCES conservation_points(id) ON DELETE SET NULL,
  expiry_date DATE,
  allergens TEXT[],
  image_url TEXT,
  notes TEXT,
  quantity DECIMAL(10,2),
  unit TEXT,
  supplier TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('maintenance', 'cleaning', 'general', 'temperature')),
  conservation_point_id UUID REFERENCES conservation_points(id) ON DELETE CASCADE,
  assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_to_role TEXT,
  assigned_to_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly', 'custom')),
  frequency_config JSONB DEFAULT '{}',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  due_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create task_completions table
CREATE TABLE task_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  completed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  photo_urls TEXT[],
  values JSONB DEFAULT '{}',
  is_valid BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create temperature_readings table
CREATE TABLE temperature_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  conservation_point_id UUID REFERENCES conservation_points(id) ON DELETE CASCADE,
  recorded_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  temperature DECIMAL(4,1) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  is_within_range BOOLEAN,
  notes TEXT,
  photo_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create non_conformities table
CREATE TABLE non_conformities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('temperature', 'cleaning', 'maintenance', 'product', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  conservation_point_id UUID REFERENCES conservation_points(id) ON DELETE SET NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  reported_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  corrective_action TEXT,
  root_cause TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  resolved_at TIMESTAMPTZ,
  resolved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  photo_urls TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('general', 'conservation_point', 'task', 'product', 'announcement')),
  title TEXT,
  content TEXT NOT NULL,
  conservation_point_id UUID REFERENCES conservation_points(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  mentioned_user_ids UUID[],
  is_pinned BOOLEAN DEFAULT FALSE,
  is_read_by JSONB DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create exports table
CREATE TABLE exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('full_backup', 'temperature_logs', 'task_reports', 'compliance_report')),
  format TEXT NOT NULL CHECK (format IN ('json', 'csv', 'pdf')),
  date_range_start DATE,
  date_range_end DATE,
  filters JSONB DEFAULT '{}',
  file_url TEXT,
  file_size_bytes INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX idx_departments_company_id ON departments(company_id);
CREATE INDEX idx_conservation_points_company_id ON conservation_points(company_id);
CREATE INDEX idx_products_company_id ON products(company_id);
CREATE INDEX idx_products_expiry_date ON products(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_tasks_company_id ON tasks(company_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_task_completions_company_id ON task_completions(company_id);
CREATE INDEX idx_task_completions_task_id ON task_completions(task_id);
CREATE INDEX idx_temperature_readings_company_id ON temperature_readings(company_id);
CREATE INDEX idx_temperature_readings_conservation_point_id ON temperature_readings(conservation_point_id);
CREATE INDEX idx_temperature_readings_recorded_at ON temperature_readings(recorded_at);
CREATE INDEX idx_non_conformities_company_id ON non_conformities(company_id);
CREATE INDEX idx_notes_company_id ON notes(company_id);
CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_exports_company_id ON exports(company_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conservation_points_updated_at BEFORE UPDATE ON conservation_points 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_non_conformities_updated_at BEFORE UPDATE ON non_conformities 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exports_updated_at BEFORE UPDATE ON exports 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();