-- Create conferences table
CREATE TABLE IF NOT EXISTS conferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    room_name UUID DEFAULT gen_random_uuid(),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 