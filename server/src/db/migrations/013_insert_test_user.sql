-- Insert test user
INSERT INTO users (email, password, name, nickname, user_group, role_id) VALUES 
    ('admin@example.com', '$2b$10$8K1p/a0dR1xqM8K1p/a0dR1xqM8K1p/a0dR1xqM8K1p/a0dR1xqM', 'Admin User', 'admin', 'Administration', 1)
ON CONFLICT (email) DO NOTHING; 