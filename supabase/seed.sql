-- HACCP Business Manager - Seed Data
-- This file contains sample data for development and testing
-- Run this after the schema migrations

-- Insert sample companies
INSERT INTO companies (id, name, address, phone, email, vat_number) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Ristorante Da Mario', 'Via Roma 123, 00100 Roma', '+39 06 1234567', 'info@damario.it', 'IT12345678901'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Pizzeria Bella Napoli', 'Via Napoli 456, 80100 Napoli', '+39 081 7654321', 'info@bellanapoli.it', 'IT98765432109');

-- Insert sample departments for first company
INSERT INTO departments (id, company_id, name, description) VALUES
  ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Cucina', 'Reparto cucina principale'),
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Sala', 'Servizio in sala'),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Magazzino', 'Deposito e stoccaggio'),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Bancone', 'Servizio al bancone');

-- Insert sample users (Note: clerk_user_id should match actual Clerk user IDs in production)
INSERT INTO users (id, clerk_user_id, company_id, email, first_name, last_name, role, department_id) VALUES
  ('770e8400-e29b-41d4-a716-446655440000', 'clerk_user_admin_001', '550e8400-e29b-41d4-a716-446655440000', 'mario@damario.it', 'Mario', 'Rossi', 'admin', '660e8400-e29b-41d4-a716-446655440000'),
  ('770e8400-e29b-41d4-a716-446655440001', 'clerk_user_manager_001', '550e8400-e29b-41d4-a716-446655440000', 'giulia@damario.it', 'Giulia', 'Bianchi', 'manager', '660e8400-e29b-41d4-a716-446655440001'),
  ('770e8400-e29b-41d4-a716-446655440002', 'clerk_user_employee_001', '550e8400-e29b-41d4-a716-446655440000', 'luca@damario.it', 'Luca', 'Verdi', 'employee', '660e8400-e29b-41d4-a716-446655440000'),
  ('770e8400-e29b-41d4-a716-446655440003', 'clerk_user_employee_002', '550e8400-e29b-41d4-a716-446655440000', 'anna@damario.it', 'Anna', 'Neri', 'employee', '660e8400-e29b-41d4-a716-446655440001');

-- Update department managers
UPDATE departments SET manager_id = '770e8400-e29b-41d4-a716-446655440000' WHERE id = '660e8400-e29b-41d4-a716-446655440000';
UPDATE departments SET manager_id = '770e8400-e29b-41d4-a716-446655440001' WHERE id = '660e8400-e29b-41d4-a716-446655440001';

-- Insert sample conservation points
INSERT INTO conservation_points (id, company_id, name, type, department_id, target_temperature_min, target_temperature_max, product_categories, location) VALUES
  ('880e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Frigorifero Cucina 1', 'frigorifero', '660e8400-e29b-41d4-a716-446655440000', 2.0, 4.0, ARRAY['latticini', 'carne', 'pesce'], 'Cucina principale'),
  ('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Freezer Cucina 1', 'freezer', '660e8400-e29b-41d4-a716-446655440000', -18.0, -15.0, ARRAY['surgelati', 'gelati'], 'Cucina principale'),
  ('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Dispensa Secca', 'ambiente', '660e8400-e29b-41d4-a716-446655440002', 15.0, 25.0, ARRAY['pasta', 'riso', 'conserve'], 'Magazzino'),
  ('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Abbattitore', 'abbattitore', '660e8400-e29b-41d4-a716-446655440000', -40.0, -35.0, ARRAY['preparazioni fresche'], 'Cucina principale');

-- Insert sample products
INSERT INTO products (id, company_id, name, category, department_id, conservation_point_id, expiry_date, allergens, quantity, unit, supplier) VALUES
  ('990e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Mozzarella di Bufala', 'latticini', '660e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440000', CURRENT_DATE + INTERVAL '5 days', ARRAY['latte'], 2.5, 'kg', 'Caseificio Sociale'),
  ('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Pomodori San Marzano', 'conserve', '660e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', CURRENT_DATE + INTERVAL '365 days', ARRAY[], 12.0, 'scatole', 'Conserve del Sud'),
  ('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Salmone Norvegese', 'pesce', '660e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440001', CURRENT_DATE + INTERVAL '30 days', ARRAY['pesce'], 1.8, 'kg', 'Pescheria Fresca'),
  ('990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Pasta Spaghetti', 'pasta', '660e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', CURRENT_DATE + INTERVAL '720 days', ARRAY['glutine'], 5.0, 'kg', 'Pastificio Artigianale');

-- Insert sample tasks
INSERT INTO tasks (id, company_id, name, description, type, conservation_point_id, assigned_to_user_id, frequency, priority, due_date) VALUES
  ('aa0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Controllo temperatura frigorifero', 'Verificare e registrare la temperatura del frigorifero cucina 1', 'temperature', '880e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440002', 'daily', 'high', CURRENT_TIMESTAMP + INTERVAL '1 day'),
  ('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Pulizia frigorifero', 'Pulizia approfondita del frigorifero cucina 1', 'cleaning', '880e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440002', 'weekly', 'medium', CURRENT_TIMESTAMP + INTERVAL '7 days'),
  ('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Manutenzione abbattitore', 'Controllo e manutenzione dell\'abbattitore', 'maintenance', '880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440000', 'monthly', 'high', CURRENT_TIMESTAMP + INTERVAL '30 days'),
  ('aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Inventario magazzino', 'Controllo inventario prodotti secchi', 'general', NULL, '770e8400-e29b-41d4-a716-446655440003', 'weekly', 'medium', CURRENT_TIMESTAMP + INTERVAL '7 days');

-- Insert sample temperature readings
INSERT INTO temperature_readings (company_id, conservation_point_id, recorded_by_user_id, temperature, recorded_at, is_within_range) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440002', 3.2, CURRENT_TIMESTAMP - INTERVAL '1 hour', true),
  ('550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440002', 3.5, CURRENT_TIMESTAMP - INTERVAL '2 hours', true),
  ('550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', -17.2, CURRENT_TIMESTAMP - INTERVAL '1 hour', true),
  ('550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', -16.8, CURRENT_TIMESTAMP - INTERVAL '2 hours', true);

-- Insert sample task completions
INSERT INTO task_completions (company_id, task_id, completed_by_user_id, completed_at, notes, values) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'aa0e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440002', CURRENT_TIMESTAMP - INTERVAL '1 day', 'Temperatura regolare', '{"temperature": 3.2}'),
  ('550e8400-e29b-41d4-a716-446655440000', 'aa0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', CURRENT_TIMESTAMP - INTERVAL '7 days', 'Pulizia completata, nessuna anomalia', '{}');

-- Insert sample notes
INSERT INTO notes (company_id, type, title, content, conservation_point_id, created_by_user_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'conservation_point', 'Attenzione temperatura', 'Il frigorifero ha mostrato lievi oscillazioni di temperatura nel pomeriggio. Monitorare attentamente.', '880e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440002'),
  ('550e8400-e29b-41d4-a716-446655440000', 'general', 'Nuovo fornitore', 'Abbiamo cambiato fornitore per i latticini. Verificare la qualità dei primi arrivi.', NULL, '770e8400-e29b-41d4-a716-446655440000'),
  ('550e8400-e29b-41d4-a716-446655440000', 'announcement', 'Formazione HACCP', 'Ricordo a tutto il personale che la formazione HACCP è programmata per venerdì prossimo alle 14:00.', NULL, '770e8400-e29b-41d4-a716-446655440001');

-- Insert sample non-conformity (optional - for testing)
INSERT INTO non_conformities (company_id, type, severity, conservation_point_id, reported_by_user_id, title, description, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'temperature', 'medium', '880e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440002', 'Temperatura fuori range', 'Il frigorifero ha registrato una temperatura di 6.2°C per circa 30 minuti a causa di apertura prolungata della porta.', 'resolved');