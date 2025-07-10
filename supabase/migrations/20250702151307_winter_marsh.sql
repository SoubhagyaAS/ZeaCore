/*
  # Seed Sample Data

  1. Sample Data
    - Insert sample apps
    - Insert sample subscription plans
    - Insert sample customers
    - Insert sample subscriptions
    - Insert sample payments

  This migration populates the database with sample data for development and testing.
*/

-- Insert sample apps
INSERT INTO apps (id, name, description, category, status, features, api_endpoint, version, subscribers, revenue) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'ProjectFlow', 'Advanced project management and collaboration platform', 'Productivity', 'active', 
 ARRAY['Task Management', 'Team Collaboration', 'Time Tracking', 'Reporting', 'API Access', 'Custom Workflows'], 
 'https://api.projectflow.com', '2.1.4', 1247, 89340),
('550e8400-e29b-41d4-a716-446655440002', 'DataVault', 'Secure cloud storage and file sharing solution', 'Storage', 'active',
 ARRAY['Cloud Storage', 'File Sharing', 'Version Control', 'Encryption', 'Team Folders', 'Mobile Access'],
 'https://api.datavault.com', '3.0.1', 892, 67240),
('550e8400-e29b-41d4-a716-446655440003', 'AnalyticsPro', 'Business intelligence and analytics platform', 'Analytics', 'maintenance',
 ARRAY['Data Visualization', 'Custom Reports', 'Real-time Analytics', 'Data Export', 'Dashboard Builder'],
 'https://api.analyticspro.com', '1.8.2', 634, 45890),
('550e8400-e29b-41d4-a716-446655440004', 'ChatConnect', 'Enterprise communication and messaging platform', 'Communication', 'active',
 ARRAY['Instant Messaging', 'Video Calls', 'Screen Sharing', 'File Transfer', 'Channel Management'],
 'https://api.chatconnect.com', '4.2.0', 2156, 124780);

-- Insert sample subscription plans
INSERT INTO subscription_plans (id, name, app_id, price, billing, features, max_users, description, is_popular) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Starter', '550e8400-e29b-41d4-a716-446655440001', 29, 'monthly',
 ARRAY['Task Management', 'Team Collaboration', 'Basic Reporting'], 5, 'Perfect for small teams getting started', false),
('660e8400-e29b-41d4-a716-446655440002', 'Professional', '550e8400-e29b-41d4-a716-446655440001', 79, 'monthly',
 ARRAY['Task Management', 'Team Collaboration', 'Time Tracking', 'Advanced Reporting', 'API Access'], 25, 'Ideal for growing businesses', true),
('660e8400-e29b-41d4-a716-446655440003', 'Enterprise', '550e8400-e29b-41d4-a716-446655440001', 149, 'monthly',
 ARRAY['All Features', 'Custom Workflows', 'Priority Support', 'Advanced Security'], -1, 'For large organizations with complex needs', false),
('660e8400-e29b-41d4-a716-446655440004', 'Basic Storage', '550e8400-e29b-41d4-a716-446655440002', 19, 'monthly',
 ARRAY['100GB Storage', 'File Sharing', 'Mobile Access'], 3, 'Essential cloud storage for individuals', false),
('660e8400-e29b-41d4-a716-446655440005', 'Business Storage', '550e8400-e29b-41d4-a716-446655440002', 49, 'monthly',
 ARRAY['1TB Storage', 'Team Folders', 'Version Control', 'Encryption'], 15, 'Secure storage for business teams', false);

-- Insert sample customers
INSERT INTO customers (id, name, email, company, status, total_spent) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'John Smith', 'john.smith@techcorp.com', 'TechCorp Solutions', 'active', 2340),
('770e8400-e29b-41d4-a716-446655440002', 'Sarah Johnson', 'sarah.j@innovate.io', 'Innovate Labs', 'active', 1890),
('770e8400-e29b-41d4-a716-446655440003', 'Michael Chen', 'michael.chen@digitalflow.com', 'DigitalFlow Inc', 'inactive', 890),
('770e8400-e29b-41d4-a716-446655440004', 'Emily Rodriguez', 'emily.r@cloudtech.net', 'CloudTech Systems', 'active', 3240);

-- Insert sample customer subscriptions
INSERT INTO customer_subscriptions (id, customer_id, app_id, plan_id, status, start_date, end_date, price, billing, enabled_features) VALUES
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'active', '2023-09-01', '2024-09-01', 79, 'monthly',
 ARRAY['Task Management', 'Team Collaboration', 'Time Tracking', 'Advanced Reporting', 'API Access']),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440005', 'active', '2023-08-15', '2024-08-15', 49, 'monthly',
 ARRAY['1TB Storage', 'Team Folders', 'Version Control', 'Encryption']),
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'active', '2023-09-10', '2024-09-10', 29, 'monthly',
 ARRAY['Task Management', 'Team Collaboration', 'Basic Reporting']),
('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'trial', '2023-11-01', '2023-11-15', 0, 'monthly',
 ARRAY['Instant Messaging', 'Video Calls']);

-- Insert sample payments
INSERT INTO payments (id, customer_id, subscription_id, amount, status, payment_date, payment_method) VALUES
('990e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 79, 'completed', '2023-11-01', 'card'),
('990e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440002', 49, 'completed', '2023-11-01', 'card'),
('990e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440003', 29, 'completed', '2023-10-28', 'paypal'),
('990e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440004', 0, 'completed', '2023-11-01', 'card');