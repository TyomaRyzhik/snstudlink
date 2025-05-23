-- Add media and poll columns to posts table
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS media TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS poll JSONB; 