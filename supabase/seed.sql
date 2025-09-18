-- HACCP Business Manager - Seed Data
-- Version: 1.0
-- Description: Sample data for development and testing

-- Insert test company
INSERT INTO companies (id, name, address, vat_number, phone, email) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Al Ritrovo SRL', 'Via Roma 123, 00100 Roma', 'IT12345678901', '+39 06 12345678', 'info@alritrovo.it');

-- Insert test departments
INSERT INTO departments (id, company_id, name, description, is_custom) VALUES
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', 'Cucina', 'Reparto cucina principale', false),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440001', 'Sala', 'Servizio in sala', false),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440001', 'Bancone', 'Area bancone e bar', false),
('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440001', 'Magazzino', 'Gestione magazzino', false),
('550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440001', 'Amministrazione', 'Ufficio amministrativo', false);

-- Note: Users will be created when they sign up through Clerk
-- The clerk_id will be populated from Clerk authentication

-- Insert test conservation points
INSERT INTO conservation_points (id, company_id, name, type, department_id, min_temperature, max_temperature, location) VALUES
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Frigo A', 'fridge', '550e8400-e29b-41d4-a716-446655440101', 0, 4, 'Cucina - Parete nord'),
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'Freezer 1', 'freezer', '550e8400-e29b-41d4-a716-446655440101', -20, -18, 'Cucina - Area congelatori'),
('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440001', 'Bancone 1', 'fridge', '550e8400-e29b-41d4-a716-446655440103', 2, 6, 'Bancone principale'),
('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440001', 'Dispensa', 'ambient', '550e8400-e29b-41d4-a716-446655440104', null, null, 'Magazzino - Scaffale A'),
('550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440001', 'Abbattitore', 'blast_chiller', '550e8400-e29b-41d4-a716-446655440101', -20, 3, 'Cucina - Zona preparazione');

-- Insert sample products
INSERT INTO products (company_id, name, category, department_id, conservation_point_id, expiry_date, allergens) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Mozzarella di Bufala DOP', 'Latticini', '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440201', CURRENT_DATE + INTERVAL '5 days', ARRAY['milk']::product_allergen[]),
('550e8400-e29b-41d4-a716-446655440001', 'Pomodori San Marzano', 'Verdure', '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440201', CURRENT_DATE + INTERVAL '7 days', ARRAY[]::product_allergen[]),
('550e8400-e29b-41d4-a716-446655440001', 'Pasta De Cecco', 'Pasta', '550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440204', CURRENT_DATE + INTERVAL '180 days', ARRAY['gluten']::product_allergen[]),
('550e8400-e29b-41d4-a716-446655440001', 'Gamberi surgelati', 'Pesce', '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440202', CURRENT_DATE + INTERVAL '90 days', ARRAY['crustaceans']::product_allergen[]),
('550e8400-e29b-41d4-a716-446655440001', 'Prosciutto di Parma DOP', 'Salumi', '550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440203', CURRENT_DATE + INTERVAL '30 days', ARRAY[]::product_allergen[]);

-- Insert sample maintenance tasks
INSERT INTO tasks (company_id, name, description, type, frequency, conservation_point_id) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Pulizia Frigo A', 'Pulizia completa e sanificazione del frigorifero A', 'maintenance', 'weekly', '550e8400-e29b-41d4-a716-446655440201'),
('550e8400-e29b-41d4-a716-446655440001', 'Sbrinamento Freezer 1', 'Sbrinamento e pulizia del freezer', 'maintenance', 'monthly', '550e8400-e29b-41d4-a716-446655440202'),
('550e8400-e29b-41d4-a716-446655440001', 'Controllo guarnizioni Bancone 1', 'Verifica stato guarnizioni e chiusura porte', 'maintenance', 'monthly', '550e8400-e29b-41d4-a716-446655440203'),
('550e8400-e29b-41d4-a716-446655440001', 'Manutenzione Abbattitore', 'Manutenzione ordinaria abbattitore', 'maintenance', 'monthly', '550e8400-e29b-41d4-a716-446655440205');

-- Insert sample general tasks
INSERT INTO tasks (company_id, name, description, type, frequency, department_id) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Pulizia piano lavoro cucina', 'Sanificazione completa piani di lavoro', 'cleaning', 'daily', '550e8400-e29b-41d4-a716-446655440101'),
('550e8400-e29b-41d4-a716-446655440001', 'Controllo scadenze prodotti', 'Verifica date di scadenza in tutti i frigoriferi', 'general', 'daily', '550e8400-e29b-41d4-a716-446655440101'),
('550e8400-e29b-41d4-a716-446655440001', 'Pulizia sala', 'Pulizia completa sala ristorante', 'cleaning', 'daily', '550e8400-e29b-41d4-a716-446655440102'),
('550e8400-e29b-41d4-a716-446655440001', 'Inventario settimanale', 'Controllo inventario prodotti magazzino', 'general', 'weekly', '550e8400-e29b-41d4-a716-446655440104');

-- Note: Other data like temperature readings, task completions, etc. 
-- will be generated through the application during normal use