-- HACCP Business Manager Database Schema
-- Version: 1.0
-- Description: Initial database schema for HACCP compliance management system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee', 'collaborator');
CREATE TYPE task_frequency AS ENUM ('daily', 'weekly', 'monthly', 'yearly', 'custom');
CREATE TYPE task_type AS ENUM ('maintenance', 'cleaning', 'general');
CREATE TYPE conservation_point_type AS ENUM ('fridge', 'freezer', 'ambient', 'blast_chiller');
CREATE TYPE product_allergen AS ENUM ('gluten', 'crustaceans', 'eggs', 'fish', 'peanuts', 'soy', 'milk', 'nuts', 'celery', 'mustard', 'sesame', 'sulphites', 'lupin', 'molluscs');

-- Companies table (multi-tenant support)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    vat_number VARCHAR(50),
    phone VARCHAR(50),
    email VARCHAR(255),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for company lookup
CREATE INDEX idx_companies_name ON companies(name);

-- Users table (linked to Clerk)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role user_role NOT NULL DEFAULT 'employee',
    department_id UUID,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, email)
);

-- Create indexes for users
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);

-- Departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, name)
);

-- Create index for departments
CREATE INDEX idx_departments_company_id ON departments(company_id);

-- Update users foreign key for departments
ALTER TABLE users ADD CONSTRAINT fk_users_department 
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- Conservation points table
CREATE TABLE conservation_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type conservation_point_type NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    min_temperature DECIMAL(5,2),
    max_temperature DECIMAL(5,2),
    is_blast_chiller BOOLEAN DEFAULT false,
    is_ambient BOOLEAN DEFAULT false,
    location TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    UNIQUE(company_id, name)
);

-- Create indexes for conservation points
CREATE INDEX idx_conservation_points_company_id ON conservation_points(company_id);
CREATE INDEX idx_conservation_points_department_id ON conservation_points(department_id);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    conservation_point_id UUID REFERENCES conservation_points(id) ON DELETE SET NULL,
    expiry_date DATE,
    allergens product_allergen[] DEFAULT '{}',
    label_image_url TEXT,
    notes TEXT,
    is_expired BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Create indexes for products
CREATE INDEX idx_products_company_id ON products(company_id);
CREATE INDEX idx_products_conservation_point_id ON products(conservation_point_id);
CREATE INDEX idx_products_expiry_date ON products(expiry_date);
CREATE INDEX idx_products_is_expired ON products(is_expired);

-- Tasks table (maintenance and general tasks)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type task_type NOT NULL,
    frequency task_frequency NOT NULL,
    custom_frequency_days INTEGER,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    conservation_point_id UUID REFERENCES conservation_points(id) ON DELETE CASCADE,
    assigned_to_user UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_to_role user_role,
    assigned_to_department UUID REFERENCES departments(id) ON DELETE SET NULL,
    last_completed_at TIMESTAMP WITH TIME ZONE,
    next_due_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Create indexes for tasks
CREATE INDEX idx_tasks_company_id ON tasks(company_id);
CREATE INDEX idx_tasks_conservation_point_id ON tasks(conservation_point_id);
CREATE INDEX idx_tasks_assigned_to_user ON tasks(assigned_to_user);
CREATE INDEX idx_tasks_next_due_date ON tasks(next_due_date);
CREATE INDEX idx_tasks_type ON tasks(type);

-- Task completions table
CREATE TABLE task_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    completed_by UUID NOT NULL REFERENCES users(id),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    signature TEXT,
    deduplication_key VARCHAR(255),
    UNIQUE(company_id, deduplication_key)
);

-- Create indexes for task completions
CREATE INDEX idx_task_completions_company_id ON task_completions(company_id);
CREATE INDEX idx_task_completions_task_id ON task_completions(task_id);
CREATE INDEX idx_task_completions_completed_at ON task_completions(completed_at);
CREATE INDEX idx_task_completions_completed_by ON task_completions(completed_by);

-- Temperature readings table
CREATE TABLE temperature_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    conservation_point_id UUID NOT NULL REFERENCES conservation_points(id) ON DELETE CASCADE,
    temperature DECIMAL(5,2) NOT NULL,
    recorded_by UUID NOT NULL REFERENCES users(id),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_out_of_range BOOLEAN DEFAULT false,
    notes TEXT,
    deduplication_key VARCHAR(255),
    UNIQUE(company_id, deduplication_key)
);

-- Create indexes for temperature readings
CREATE INDEX idx_temperature_readings_company_id ON temperature_readings(company_id);
CREATE INDEX idx_temperature_readings_conservation_point_id ON temperature_readings(conservation_point_id);
CREATE INDEX idx_temperature_readings_recorded_at ON temperature_readings(recorded_at);
CREATE INDEX idx_temperature_readings_is_out_of_range ON temperature_readings(is_out_of_range);

-- Non-conformities table
CREATE TABLE non_conformities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(50),
    conservation_point_id UUID REFERENCES conservation_points(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    reported_by UUID NOT NULL REFERENCES users(id),
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for non-conformities
CREATE INDEX idx_non_conformities_company_id ON non_conformities(company_id);
CREATE INDEX idx_non_conformities_reported_at ON non_conformities(reported_at);
CREATE INDEX idx_non_conformities_resolved_at ON non_conformities(resolved_at);

-- Notes/Messages table
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    is_priority BOOLEAN DEFAULT false,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deduplication_key VARCHAR(255),
    UNIQUE(company_id, deduplication_key)
);

-- Create indexes for notes
CREATE INDEX idx_notes_company_id ON notes(company_id);
CREATE INDEX idx_notes_author_id ON notes(author_id);
CREATE INDEX idx_notes_created_at ON notes(created_at);
CREATE INDEX idx_notes_is_priority ON notes(is_priority);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for audit logs
CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_entity_type_id ON audit_logs(entity_type, entity_id);

-- Data exports table
CREATE TABLE exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    exported_by UUID NOT NULL REFERENCES users(id),
    export_type VARCHAR(50) NOT NULL,
    date_from DATE,
    date_to DATE,
    file_url TEXT,
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for exports
CREATE INDEX idx_exports_company_id ON exports(company_id);
CREATE INDEX idx_exports_created_at ON exports(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
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