-- Insert initial roles
INSERT INTO roles (name) VALUES 
    ('admin'),
    ('teacher'),
    ('student')
ON CONFLICT (name) DO NOTHING; 